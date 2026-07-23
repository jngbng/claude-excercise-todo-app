# Implementation Plan: 칸반 보드 전체 조회

**Branch**: `002-get-board` | **Date**: 2026-07-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-get-board/spec.md`

## Summary

`GET /api/tickets`는 전체 티켓을 상태별 4개 칼럼(Backlog/To Do/In Progress/Done)으로
그룹화하고, 칼럼 내에서는 position 오름차순으로, Done 칼럼은 완료된 지 24시간 이내인 티켓만
반환한다. 001의 3계층 구조(Route Handler → 서비스 → DB)를 그대로 확장하며, 001의 `create()`가
쓰던 DB row → API 응답 변환 로직을 `toTicket()` 헬퍼로 추출해 재사용한다.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Node.js 20.x

**Primary Dependencies**: Next.js 15 (App Router), Drizzle ORM

**Storage**: Vercel Postgres (Neon) — 로컬 개발/테스트는 `docker-compose.yml`의 Postgres
컨테이너 (`tika_dev`, `tika_test`)

**Testing**: Jest 29 (`next/jest`) — `@jest-environment node`로 Route Handler를 직접 호출하는
API 레벨 통합 테스트, 실제 DB에 대해 실행하고 생성한 데이터는 id 기반으로 자체 정리

**Target Platform**: Vercel Serverless Functions (Node.js 런타임)

**Project Type**: Web service — 001과 동일한 Next.js App Router 단일 레포 구조를 확장

**Performance Goals**: API 응답 300ms 이내 p95 (`docs/REQUIREMENTS.md` NFR-001)

**Constraints**: 에러 응답 형식 통일, 비즈니스 로직은 `src/server/services/`에만 위치 (헌장
원칙 III, V) — 이 엔드포인트는 요청 바디/파라미터가 없어 Zod 검증 대상 자체가 없음

**Scale/Scope**: 엔드포인트 1개(`GET /api/tickets`) — 001의 `POST /api/tickets`와 같은 파일
(`app/api/tickets/route.ts`)에 공존하지만 서로 독립적으로 동작

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 원칙 | 상태 | 근거 |
|------|------|------|
| I. TypeScript Strict 모드 필수 | PASS | 신규 코드 strict 모드로 컴파일, `any` 미사용 |
| II. API 응답 명세 준수 | PASS | `contracts/get-tickets.md`가 `docs/API_SPECS.md` GET 섹션을 그대로 재진술 |
| III. 에러 응답 형식 통일 | PASS | 이 엔드포인트는 에러 케이스가 없음(파라미터 없는 조회) — 위반 아님 |
| IV. 요청 검증은 Zod로만 | N/A | 요청 바디/파라미터가 없어 검증 대상 자체가 없음 |
| V. 비즈니스 로직의 서비스 계층 분리 | PASS | 그룹화·정렬·24시간 필터 로직 모두 `getBoard()`(서비스 계층)에 위치, Route Handler는 호출·응답만 수행 |

위반 없음 — Complexity Tracking 불필요.

## Project Structure

### Documentation (this feature)

```text
specs/002-get-board/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── get-tickets.md
└── tasks.md   # /speckit-tasks 산출물, 이 명령의 범위 밖
```

### Source Code (repository root)

```text
app/
└── api/
    └── tickets/
        └── route.ts              # 기존 POST 옆에 GET 추가

src/
└── server/
    └── services/
        └── ticketService.ts      # toTicket() 추출 + getBoard() 추가

__tests__/
├── helpers/
│   └── ticketFixtures.ts         # 신규: 생성한 티켓 id 추적 + 정리 헬퍼
└── api/
    └── tickets.test.ts           # 기존 파일 맨 앞에 GET 보드 조회 테스트 추가
```

**Structure Decision**: 새 디렉터리를 만들지 않는다. `app/api/tickets/route.ts`와
`src/server/services/ticketService.ts`는 001이 이미 만든 파일을 확장하고,
`__tests__/helpers/ticketFixtures.ts`만 이 기능에서 새로 추가되는 테스트 인프라다. GET 테스트는
같은 테스트 파일(`tickets.test.ts`) 안에서 기존 POST 테스트보다 앞서 선언해, "빈 보드" 시나리오가
항상 깨끗한 상태에서 실행되도록 한다(`research.md` 테스트 데이터 격리 전략 참고).

## Complexity Tracking

*해당 없음 — Constitution Check 위반이 없어 정당화가 필요한 항목이 없다.*
