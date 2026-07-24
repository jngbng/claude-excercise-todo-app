# Implementation Plan: 드래그앤드롭 상태·순서 변경

**Branch**: `007-reorder-tickets` | **Date**: 2026-07-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/007-reorder-tickets/spec.md`

## Summary

`PATCH /api/tickets/reorder`는 티켓을 BACKLOG/TODO/IN_PROGRESS 사이에서 이동하거나 같은
칼럼 내 순서를 변경한다. `position` 필드는 클라이언트가 계산한 최종 저장값이 아니라 대상
칼럼 내 0-based 삽입 인덱스이며(`research.md`), 서버가 이웃 카드 기반으로 실제 position을
재계산한다. 간격이 좁으면 칼럼 전체를 재정렬한다. 전체 과정을 트랜잭션으로 묶어 원자성을
보장한다.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Node.js 20.x

**Primary Dependencies**: Next.js 15 (App Router), Zod, Drizzle ORM(트랜잭션 API 포함)

**Storage**: Vercel Postgres (Neon) — `docker-compose.yml`의 Postgres 컨테이너

**Testing**: Jest 29 (`next/jest`) — `@jest-environment node` API 레벨 통합 테스트, id 기반
자체 정리

**Target Platform**: Vercel Serverless Functions (Node.js 런타임)

**Project Type**: Web service — 001~006과 동일한 구조를 확장(이 배치의 마지막 엔드포인트)

**Performance Goals**: API 응답 300ms 이내 p95 (`docs/REQUIREMENTS.md` NFR-001)

**Constraints**: 에러 응답 형식 통일, 모든 요청 검증은 Zod로만, 비즈니스 로직은
`src/server/services/`에만 위치, reorder는 트랜잭션으로 원자성 보장 (헌장 원칙 III, IV, V +
`docs/API_SPECS.md` reorder 처리 규칙)

**Scale/Scope**: 엔드포인트 1개(`PATCH /api/tickets/reorder`) — 새 동적 라우트 파일 하나 생성

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 원칙 | 상태 | 근거 |
|------|------|------|
| I. TypeScript Strict 모드 필수 | PASS | 신규 코드 strict 모드로 컴파일, `any` 미사용 |
| II. API 응답 명세 준수 | PASS | `contracts/patch-tickets-reorder.md`가 `docs/API_SPECS.md` 섹션을 그대로 재진술 |
| III. 에러 응답 형식 통일 | PASS | 400/404 모두 `{ error: { code, message } }` 형식 |
| IV. 요청 검증은 Zod로만 | PASS | `reorderTicketSchema`(status enum에서 DONE 제외) 하나로 DONE 이동·잘못된 값을 모두 처리, 수동 조건문 없음 |
| V. 비즈니스 로직의 서비스 계층 분리 | PASS | position 재계산·트랜잭션·상태 전이 로직 모두 `reorder()`(서비스 계층)에 위치, Route Handler는 파싱·검증·호출·응답만 수행 |

위반 없음 — Complexity Tracking 불필요.

## Project Structure

### Documentation (this feature)

```text
specs/007-reorder-tickets/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── patch-tickets-reorder.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
└── api/
    └── tickets/
        └── reorder/
            └── route.ts          # 신규: PATCH

src/
├── shared/
│   └── validations/
│       └── ticket.ts             # reorderTicketSchema 추가
└── server/
    └── services/
        └── ticketService.ts      # reorder() 추가 (트랜잭션)

__tests__/
└── api/
    └── tickets-reorder.test.ts   # 신규
```

**Structure Decision**: `app/api/tickets/reorder/route.ts`는 이미 스캐폴딩되어 있던 빈 폴더
(`.gitkeep`)를 실제 파일로 채우는 것이다. 이 기능이 이 배치(001~007)의 마지막 엔드포인트이므로,
완료 후에는 `docs/API_SPECS.md`에 정의된 7개 엔드포인트가 모두 구현된다.

## Complexity Tracking

*해당 없음 — Constitution Check 위반이 없어 정당화가 필요한 항목이 없다.*
