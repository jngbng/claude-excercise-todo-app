# Implementation Plan: 티켓 생성 (POST /api/tickets)

**Branch**: `001-create-ticket` | **Date**: 2026-07-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-create-ticket/spec.md`

## Summary

`POST /api/tickets`는 사용자가 제목(필수)과 설명·우선순위·계획시작일·종료예정일(선택)을 입력해
새 티켓을 생성하고, 항상 `BACKLOG` 상태로 Backlog 칼럼 맨 위에 배치하는 기능이다. 기술적 접근은
Route Handler(`app/api/tickets/route.ts`)가 요청을 파싱해 공유 Zod 스키마
(`src/shared/validations/ticket.ts`)로 검증한 뒤, 서비스 계층(`src/server/services/ticketService.ts`)
에 위임해 position 계산과 DB 삽입(Drizzle ORM)을 수행하고, 통일된 `{ error: { code, message } }`
형식 또는 생성된 Ticket 객체를 반환하는 3계층 구조다.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Node.js 20.x

**Primary Dependencies**: Next.js 15 (App Router, Route Handlers), Zod, Drizzle ORM

**Storage**: Vercel Postgres (Neon) — 로컬 개발은 `docker-compose.yml`의 Postgres 컨테이너

**Testing**: Jest 29 (`next/jest`) — `@jest-environment node`로 Route Handler를 직접 호출하는 API
레벨 테스트

**Target Platform**: Vercel Serverless Functions (Node.js 런타임)

**Project Type**: Web service — Next.js App Router 단일 레포, 프론트엔드(`src/client/`)와
백엔드(`app/api/`, `src/server/`)를 디렉토리 수준에서 분리

**Performance Goals**: API 응답 300ms 이내 p95 (`docs/REQUIREMENTS.md` NFR-001)

**Constraints**: 에러 응답 `{ error: { code, message } }` 형식 고정, 모든 요청 검증은 Zod로만,
비즈니스 로직은 `src/server/services/`에만 위치 (헌장 원칙 III, IV, V)

**Scale/Scope**: 엔드포인트 1개(`POST /api/tickets`) — 조회·수정·삭제·reorder 등 다른 엔드포인트는
이 계획의 범위 밖

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 원칙 | 상태 | 근거 |
|------|------|------|
| I. TypeScript Strict 모드 필수 | PASS | 기존/신규 코드 모두 strict 모드로 컴파일되며 `any` 미사용 (`unknown` + 타입 가드) |
| II. API 응답 명세 준수 | PASS | `contracts/post-tickets.md`가 `docs/API_SPECS.md`의 요청/응답/오류 구조를 그대로 재진술 |
| III. 에러 응답 형식 통일 | PASS | 모든 에러 응답이 `{ error: { code, message } }` 형식, `code`는 `VALIDATION_ERROR`만 사용 (생성 성공 경로에는 `NOT_FOUND` 해당 없음) |
| IV. 요청 검증은 Zod로만 | PASS | `src/shared/validations/ticket.ts`의 `createTicketSchema` 하나로만 검증, 수동 조건문 없음 |
| V. 비즈니스 로직의 서비스 계층 분리 | PASS | Route Handler는 파싱→검증→서비스 호출→응답만 수행, position 계산·DB 삽입은 `ticketService.create()`에 위치 |

위반 없음 — Complexity Tracking 불필요.

## Project Structure

### Documentation (this feature)

```text
specs/001-create-ticket/
├── plan.md              # 이 파일 (/speckit-plan 산출물)
├── research.md          # Phase 0 산출물
├── data-model.md         # Phase 1 산출물
├── quickstart.md         # Phase 1 산출물
├── contracts/
│   └── post-tickets.md   # Phase 1 산출물
└── tasks.md              # Phase 2 산출물 (/speckit-tasks — 이 명령의 범위 밖)
```

### Source Code (repository root)

```text
app/
└── api/
    └── tickets/
        └── route.ts              # POST 핸들러: 파싱 → Zod 검증 → 서비스 호출 → 응답

src/
├── shared/
│   ├── validations/
│   │   └── ticket.ts             # createTicketSchema (Zod)
│   └── types/
│       └── index.ts              # Ticket, TICKET_STATUS, TICKET_PRIORITY
└── server/
    ├── services/
    │   └── ticketService.ts      # create(): position 계산 + DB 삽입 + 파생 필드 계산
    └── db/
        └── schema.ts             # tickets 테이블 (Drizzle)

__tests__/
└── api/
    └── tickets.test.ts           # TC-API-001 시나리오 (Jest, node 환경)
```

**Structure Decision**: 위 경로들은 `CLAUDE.md`/`docs/TRD.md`에 이미 확정된 프론트엔드-백엔드
디렉토리 분리 구조를 그대로 따른다. 이 기능은 새 디렉토리를 추가하지 않고 기존 5개 파일(및 테스트
파일)만 사용한다 — 계획 수립 시점 기준 이미 이 구조대로 구현되어 있으며(research.md "기존 구현 상태"
참고), 본 계획은 그 구현이 spec.md·헌장과 정확히 일치함을 검증하는 설계 문서로도 기능한다.

## Complexity Tracking

*해당 없음 — Constitution Check 위반이 없어 정당화가 필요한 항목이 없다.*
