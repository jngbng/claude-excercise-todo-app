# Implementation Plan: 티켓 단건 조회

**Branch**: `003-get-ticket-detail` | **Date**: 2026-07-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-get-ticket-detail/spec.md`

## Summary

`GET /api/tickets/:id`는 path parameter `id`로 티켓 하나를 조회해 전체 정보를 반환하거나,
존재하지 않으면 404 NOT_FOUND를 반환한다. 이 기능에서 새 파일 `app/api/tickets/[id]/route.ts`를
만들고, 이후 PATCH/DELETE 기능도 이 같은 파일에 계속 추가될 예정이므로 404 처리 패턴(서비스는
`null` 반환, Route Handler가 변환)을 여기서 확정한다.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Node.js 20.x

**Primary Dependencies**: Next.js 15 (App Router, 동적 Route Handler), Drizzle ORM

**Storage**: Vercel Postgres (Neon) — 로컬 개발/테스트는 `docker-compose.yml`의 Postgres 컨테이너

**Testing**: Jest 29 (`next/jest`) — `@jest-environment node` API 레벨 통합 테스트, 생성한
데이터는 id 기반으로 자체 정리(`__tests__/helpers/ticketFixtures.ts`, 002에서 도입)

**Target Platform**: Vercel Serverless Functions (Node.js 런타임)

**Project Type**: Web service — 001/002와 동일한 구조를 확장

**Performance Goals**: API 응답 300ms 이내 p95 (`docs/REQUIREMENTS.md` NFR-001)

**Constraints**: 에러 응답 `{ error: { code, message } }` 형식 고정, 비즈니스 로직은
`src/server/services/`에만 위치 (헌장 원칙 III, V)

**Scale/Scope**: 엔드포인트 1개(`GET /api/tickets/:id`) — 새 동적 라우트 파일 하나 생성

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 원칙 | 상태 | 근거 |
|------|------|------|
| I. TypeScript Strict 모드 필수 | PASS | 신규 코드 strict 모드로 컴파일, `any` 미사용 |
| II. API 응답 명세 준수 | PASS | `contracts/get-tickets-id.md`가 `docs/API_SPECS.md` GET 섹션을 그대로 재진술 |
| III. 에러 응답 형식 통일 | PASS | 404가 `{ error: { code: 'NOT_FOUND', message } }` 형식 |
| IV. 요청 검증은 Zod로만 | N/A | 요청 바디가 없고 path parameter 하나뿐이라 Zod 스키마 대상 자체가 없음(research.md 참고) |
| V. 비즈니스 로직의 서비스 계층 분리 | PASS | 조회 로직은 `getById()`(서비스 계층)에 위치, Route Handler는 파싱·호출·응답만 수행 |

위반 없음 — Complexity Tracking 불필요.

## Project Structure

### Documentation (this feature)

```text
specs/003-get-ticket-detail/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── get-tickets-id.md
└── tasks.md   # /speckit-tasks 산출물, 이 명령의 범위 밖
```

### Source Code (repository root)

```text
app/
└── api/
    └── tickets/
        └── [id]/
            └── route.ts          # 신규: GET (이후 기능들이 PATCH/DELETE 추가 예정)

src/
└── server/
    └── services/
        └── ticketService.ts      # getById() 추가

__tests__/
└── api/
    └── tickets-id.test.ts        # 신규
```

**Structure Decision**: `app/api/tickets/[id]/route.ts`는 이미 스캐폴딩되어 있던 빈 폴더
(`.gitkeep`)를 실제 파일로 채우는 것이다. 이후 004(수정), 005(삭제) 기능이 같은 파일에
PATCH/DELETE를 추가할 것을 고려해, 이 기능에서 path parameter 파싱(`parseId` 헬퍼)과
404 응답 패턴을 재사용 가능한 형태로 만든다.

## Complexity Tracking

*해당 없음 — Constitution Check 위반이 없어 정당화가 필요한 항목이 없다.*
