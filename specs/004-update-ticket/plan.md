# Implementation Plan: 티켓 수정

**Branch**: `004-update-ticket` | **Date**: 2026-07-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-update-ticket/spec.md`

## Summary

`PATCH /api/tickets/:id`는 전송된 필드만 부분 수정하고, description/plannedStartDate/
dueDate는 `null` 전송 시 삭제한다. 새 `updateTicketSchema`(모든 필드 optional, 기본값 없음)로
검증하고, Zod 파싱 결과에서 키 존재 여부(`'field' in input`)로 "미전송(유지)"과 "null
전송(삭제)"을 구분한다. 003에서 확정한 404 처리 패턴(`parseId`, `notFoundResponse`)을
`app/api/tickets/[id]/route.ts`의 `PATCH`에도 재사용한다.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Node.js 20.x

**Primary Dependencies**: Next.js 15 (App Router), Zod, Drizzle ORM

**Storage**: Vercel Postgres (Neon) — `docker-compose.yml`의 Postgres 컨테이너

**Testing**: Jest 29 (`next/jest`) — `@jest-environment node` API 레벨 통합 테스트, id 기반
자체 정리(`__tests__/helpers/ticketFixtures.ts`)

**Target Platform**: Vercel Serverless Functions (Node.js 런타임)

**Project Type**: Web service — 001/002/003과 동일한 구조를 확장

**Performance Goals**: API 응답 300ms 이내 p95 (`docs/REQUIREMENTS.md` NFR-001)

**Constraints**: 에러 응답 형식 통일, 모든 요청 검증은 Zod로만, 비즈니스 로직은
`src/server/services/`에만 위치 (헌장 원칙 III, IV, V)

**Scale/Scope**: 엔드포인트 1개(`PATCH /api/tickets/:id`) — 003이 만든
`app/api/tickets/[id]/route.ts`에 `PATCH`를 추가

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 원칙 | 상태 | 근거 |
|------|------|------|
| I. TypeScript Strict 모드 필수 | PASS | 신규 코드 strict 모드로 컴파일, `any` 미사용 |
| II. API 응답 명세 준수 | PASS | `contracts/patch-tickets-id.md`가 `docs/API_SPECS.md` PATCH 섹션을 그대로 재진술 |
| III. 에러 응답 형식 통일 | PASS | 400/404 모두 `{ error: { code, message } }` 형식 |
| IV. 요청 검증은 Zod로만 | PASS | `updateTicketSchema` 하나로만 검증, 수동 조건문 없음 |
| V. 비즈니스 로직의 서비스 계층 분리 | PASS | 부분 갱신 로직은 `update()`(서비스 계층)에 위치, Route Handler는 파싱·검증·호출·응답만 수행 |

위반 없음 — Complexity Tracking 불필요.

## Project Structure

### Documentation (this feature)

```text
specs/004-update-ticket/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── patch-tickets-id.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
└── api/
    └── tickets/
        └── [id]/
            └── route.ts          # 003의 GET 옆에 PATCH 추가

src/
├── shared/
│   └── validations/
│       └── ticket.ts             # updateTicketSchema 추가
└── server/
    └── services/
        └── ticketService.ts      # update() 추가

__tests__/
└── api/
    └── tickets-id.test.ts        # 003의 GET 테스트 옆에 PATCH 테스트 추가
```

**Structure Decision**: 새 디렉터리를 만들지 않는다. 003이 만든
`app/api/tickets/[id]/route.ts`, `__tests__/api/tickets-id.test.ts`를 확장하고,
`src/shared/validations/ticket.ts`에 두 번째 스키마(`updateTicketSchema`)를 추가한다.

## Complexity Tracking

*해당 없음 — Constitution Check 위반이 없어 정당화가 필요한 항목이 없다.*
