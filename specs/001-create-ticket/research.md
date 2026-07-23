# Research: 티켓 생성 (POST /api/tickets)

**입력**: [spec.md](./spec.md) 요구사항, `.specify/memory/constitution.md`, `docs/API_SPECS.md`, `docs/DATA_MODEL.md`

이 기능은 기술적으로 불확실한 지점이 없다 — 이미 확정된 프로젝트 헌장·기술 명세 문서가 모든 결정을
직접 지정하고 있으므로, Technical Context에는 `NEEDS CLARIFICATION` 항목이 없다. 아래는 각 결정의
근거를 정리한 것이다.

## 계층 분리: Route Handler / Service / Zod 스키마

**Decision**: `app/api/tickets/route.ts`(Route Handler) → `src/shared/validations/ticket.ts`
(Zod 스키마) → `src/server/services/ticketService.ts`(비즈니스 로직) → `src/server/db/schema.ts`
(Drizzle) 순으로 계층을 분리한다. Route Handler는 요청 파싱 → 검증 호출 → 서비스 호출 → 응답
반환만 수행한다.

**Rationale**: 헌장 원칙 IV(요청 검증은 Zod로만), V(비즈니스 로직의 서비스 계층 분리)의 직접적인
요구사항이며, `CLAUDE.md`의 "Route Handler는 얇게" 컨벤션과 동일하다.

**Alternatives considered**: Route Handler 내부에서 직접 DB 쿼리 및 검증 — 헌장 원칙 V 위반이므로
기각.

## 요청 검증 방식

**Decision**: `src/shared/validations/ticket.ts`의 `createTicketSchema`(Zod)로 검증한다. `title`은
`trim()` 후 `min(1)`으로 공백만 입력을 차단하고, `description`은 1000자 제한, `priority`는
`z.enum(['LOW','MEDIUM','HIGH'])` 후 기본값 `MEDIUM`, `dueDate`는 `today()` 기준 이후 날짜만 허용한다.

**Rationale**: 헌장 원칙 IV(Zod로만 검증), `docs/API_SPECS.md`의 필드별 제약과 오류 메시지를 그대로
반영해야 하는 헌장 원칙 II(API 응답 명세 준수)를 동시에 만족시킨다. 프론트엔드와 백엔드가
`src/shared/`의 동일 스키마를 공유해 이중 검증을 보장한다(`CLAUDE.md` 코딩 컨벤션).

**Alternatives considered**: 수동 `if`문 검증 — 헌장 원칙 IV에서 명시적으로 금지.

## 에러 응답 형식

**Decision**: 검증 실패 시 Zod 에러의 첫 번째 이슈 메시지를 사용해 `{ error: { code:
'VALIDATION_ERROR', message } }` 형식으로 400을 반환한다.

**Rationale**: 헌장 원칙 III(에러 응답 형식 통일)과 `docs/API_SPECS.md` 공통 에러 형식을 그대로
따른다.

**Alternatives considered**: 여러 검증 오류를 배열로 한 번에 반환 — API_SPECS.md가 단일
`code`/`message` 쌍만 정의하므로 범위 밖. 필요해지면 API_SPECS.md를 먼저 개정해야 한다(헌장 원칙 II).

## position 계산 방식

**Decision**: 생성 시 `status`는 항상 `BACKLOG`로 고정하고, `position`은 BACKLOG 칼럼의 최솟값 -
1024로 계산한다(칼럼이 비어 있으면 0).

**Rationale**: `docs/DATA_MODEL.md`의 position 계산 규칙 및 `docs/API_SPECS.md`의 처리 규칙과
동일하다.

**Alternatives considered**: 없음 — 명세에 유일하게 정의된 방식.

## 테스트 전략

**Decision**: Jest(`@jest-environment node`)로 Route Handler를 직접 호출하는 API 레벨 테스트를
`__tests__/api/tickets.test.ts`에 작성한다. Red(테스트만) → Green(최소 구현) → Refactor 순으로
진행한다.

**Rationale**: `CLAUDE.md`의 TDD 사이클 규칙, `docs/TEST_CASES.md`의 TC-API-001 케이스와 일치한다.

**Alternatives considered**: 없음 — 프로젝트 전역 컨벤션.

## 기존 구현 상태 (참고)

계획 수립 시점 기준으로 아래 파일들이 이미 이 설계와 동일한 형태로 존재한다:
`src/server/db/schema.ts`, `src/shared/types/index.ts`, `src/shared/validations/ticket.ts`,
`src/server/services/ticketService.ts`, `app/api/tickets/route.ts`. TC-API-001-1, -2, -3, -5, -7,
-8 여섯 개 테스트가 통과 중이며, TC-API-001-4(제목 공백만 입력)와 TC-API-001-6(설명 1000자 초과)에
대응하는 테스트는 아직 작성되지 않았다 — 스키마 로직상으로는 이미 처리되지만 회귀를 막을 테스트가
없는 상태다. 이 gap은 `/speckit-tasks`에서 태스크로 반영한다.
