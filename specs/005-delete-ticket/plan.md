# Implementation Plan: 티켓 삭제

**Branch**: `005-delete-ticket` | **Date**: 2026-07-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-delete-ticket/spec.md`

## Summary

`DELETE /api/tickets/:id`는 ID로 지정한 티켓을 영구 삭제하고 204를 반환하거나, 존재하지
않으면 404를 반환한다. 003/004에서 확정한 `parseId`/`notFoundResponse` 헬퍼를 그대로
재사용해 `app/api/tickets/[id]/route.ts`에 `DELETE`를 추가한다.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Node.js 20.x

**Primary Dependencies**: Next.js 15 (App Router), Drizzle ORM

**Storage**: Vercel Postgres (Neon) — `docker-compose.yml`의 Postgres 컨테이너

**Testing**: Jest 29 (`next/jest`) — `@jest-environment node` API 레벨 통합 테스트, id 기반
자체 정리

**Target Platform**: Vercel Serverless Functions (Node.js 런타임)

**Project Type**: Web service — 001~004와 동일한 구조를 확장

**Performance Goals**: API 응답 300ms 이내 p95 (`docs/REQUIREMENTS.md` NFR-001)

**Constraints**: 에러 응답 형식 통일, 비즈니스 로직은 `src/server/services/`에만 위치 (헌장
원칙 III, V)

**Scale/Scope**: 엔드포인트 1개(`DELETE /api/tickets/:id`) — 003/004가 만든
`app/api/tickets/[id]/route.ts`에 `DELETE` 추가

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 원칙 | 상태 | 근거 |
|------|------|------|
| I. TypeScript Strict 모드 필수 | PASS | 신규 코드 strict 모드로 컴파일 |
| II. API 응답 명세 준수 | PASS | `contracts/delete-tickets-id.md`가 `docs/API_SPECS.md` DELETE 섹션을 그대로 재진술 |
| III. 에러 응답 형식 통일 | PASS | 404가 `{ error: { code: 'NOT_FOUND', message } }` 형식 |
| IV. 요청 검증은 Zod로만 | N/A | 요청 바디가 없어 검증 대상 자체가 없음 |
| V. 비즈니스 로직의 서비스 계층 분리 | PASS | 삭제 로직은 `remove()`(서비스 계층)에 위치, Route Handler는 파싱·호출·응답만 수행 |

위반 없음 — Complexity Tracking 불필요.

## Project Structure

### Documentation (this feature)

```text
specs/005-delete-ticket/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── delete-tickets-id.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
└── api/
    └── tickets/
        └── [id]/
            └── route.ts          # 003/004의 GET/PATCH 옆에 DELETE 추가

src/
└── server/
    └── services/
        └── ticketService.ts      # remove() 추가

__tests__/
└── api/
    └── tickets-id.test.ts        # GET/PATCH 테스트 옆에 DELETE 테스트 추가
```

**Structure Decision**: 새 디렉터리를 만들지 않는다. 003/004가 만든 파일들을 그대로
확장한다.

## Complexity Tracking

*해당 없음 — Constitution Check 위반이 없어 정당화가 필요한 항목이 없다.*
