# Research: 드래그앤드롭 상태·순서 변경 (PATCH /api/tickets/reorder)

**입력**: [spec.md](./spec.md), `.specify/memory/constitution.md`, `docs/API_SPECS.md`,
`docs/DATA_MODEL.md`, `docs/TRD.md`

## `position` 필드의 의미와 재계산 알고리즘

**Decision**: `docs/API_SPECS.md`의 요청 필드 표는 `position`을 "칼럼 내 새 위치
(클라이언트가 계산하여 전송)"이라고만 적어 모호하지만, `docs/TRD.md`의 드래그앤드롭 데이터
흐름에는 `ticketService.reorder()`가 "position 재계산 (prev + next) / 2"를 직접 수행한다고
명시되어 있다. 즉 클라이언트가 보내는 `position`은 최종 저장 값이 아니라 **대상 칼럼 내
0-based 삽입 인덱스**(이동 중인 티켓을 제외한 기존 카드 목록 기준)이며, 서버가 그 인덱스의
앞뒤 이웃 카드 position을 바탕으로 실제 저장 값을 계산한다.

계산 규칙(`docs/DATA_MODEL.md`와 동일):

| 상황 | 계산 |
|------|------|
| 대상 칼럼이 비어 있음 | `0` |
| 인덱스가 맨 앞(이전 이웃 없음) | `다음 이웃.position - 1024` |
| 인덱스가 맨 뒤(다음 이웃 없음) | `이전 이웃.position + 1024` |
| 이웃 두 카드 사이 | `round((이전.position + 다음.position) / 2)` |
| 이웃 두 카드의 간격이 1 미만 | 칼럼 전체(이동 중인 카드 포함)를 순서대로 1024 간격으로 재배치 |

**Rationale**: 이 해석만이 `docs/TRD.md`가 명시한 "서버가 prev/next로 재계산한다"는 문장과
모순 없이 맞아떨어진다.

**Alternatives considered**: `position`을 클라이언트가 계산한 최종 저장값으로 그대로 신뢰 —
TRD.md의 서버 측 재계산 서술과 직접 모순되어 기각.

## Zod 스키마 설계

**Decision**: `reorderTicketSchema`는 `ticketId: z.number().int()`,
`status: z.enum(['BACKLOG','TODO','IN_PROGRESS'])`(DONE 제외, 잘못된 값과 DONE 모두 같은
에러 메시지로 처리), `position: z.number().int()`로 정의한다.

**Rationale**: `status`의 enum에서 `DONE`을 제외하는 것만으로 "DONE 이동 시도"와 "잘못된
상태 값" 두 케이스가 동일한 `errorMap` 메시지("상태는 BACKLOG, TODO, IN_PROGRESS 중
선택해주세요")로 자연스럽게 처리된다 — 헌장 원칙 IV(Zod로만 검증).

**Alternatives considered**: `status`를 문자열로 받아 서비스 계층에서 별도 조건문으로 DONE을
막는 방식 — 헌장 원칙 IV 위반(수동 조건문으로 검증을 대체).

## 트랜잭션 처리

**Decision**: 이웃 조회 → (필요 시) 칼럼 전체 재배치 → 대상 티켓의 status/position/
startedAt 갱신까지 전체를 `db.transaction()` 하나로 묶는다. `drizzle-orm/node-postgres`는
`db.transaction(async (tx) => {...})`을 지원하며, 트랜잭션 콜백 내 모든 쿼리는 전달받은
`tx` 객체로 실행한다.

**Rationale**: `docs/API_SPECS.md`의 reorder 처리 규칙이 "트랜잭션으로 원자성 보장"을
명시한다(헌장 원칙 V가 요구하는 서비스 계층 책임의 일부). 재배치 도중 일부 카드만 갱신되고
중단되면 position 값이 깨진 상태로 남는 것을 방지한다.

## startedAt 자동 처리

**Decision**: 대상 상태가 `TODO`이면 `startedAt = now()`, 이동 전 상태가 `TODO`이고 대상
상태가 `BACKLOG`이면 `startedAt = null`, 그 외에는 `startedAt` 필드를 업데이트 대상에서
아예 제외해 기존 값을 그대로 둔다.

**Rationale**: `docs/DATA_MODEL.md`의 `started_at` 처리 규칙을 그대로 반영한다. 조건에
해당하지 않을 때 필드 자체를 갱신 대상에서 제외해야 Drizzle의 `.set()`이 실수로 기존 값을
덮어쓰지 않는다.

## 계층 분리·404 처리 (003~006과 동일 컨벤션)

**Decision**: `reorder()`는 `ticketId`가 존재하지 않으면 `null`을 반환하고, Route Handler가
이를 404로 변환한다. `app/api/tickets/reorder/route.ts`는 003~006과 마찬가지로 자체
`parseId` 불필요(요청 바디에서 직접 `ticketId`를 받으므로 path parameter가 없음)하지만,
동일한 404 JSON 형식을 재현한다.

**Rationale**: 헌장 원칙 III, V.
