# Implementation Plan: 티켓 완료 처리

**Branch**: `006-complete-ticket` | **Date**: 2026-07-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-complete-ticket/spec.md`

## Summary

`PATCH /api/tickets/:id/complete`는 현재 상태에 따라 완료 처리(DONE 전환 + completedAt
기록) 또는 되돌리기(IN_PROGRESS 전환 + completedAt 초기화)를 토글로 수행한다. 새 파일
`app/api/tickets/[id]/complete/route.ts`를 만들고, 003/004/005가 확립한 404 처리 패턴과
동일한 형식을 이 파일 안에서 독립적으로 재현한다(별개 디렉터리 route.ts 간에는 헬퍼를 직접
import하지 않음 — `research.md` 참고).

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Node.js 20.x

**Primary Dependencies**: Next.js 15 (App Router), Drizzle ORM

**Storage**: Vercel Postgres (Neon) — `docker-compose.yml`의 Postgres 컨테이너

**Testing**: Jest 29 (`next/jest`) — `@jest-environment node` API 레벨 통합 테스트, id 기반
자체 정리

**Target Platform**: Vercel Serverless Functions (Node.js 런타임)

**Project Type**: Web service — 001~005와 동일한 구조를 확장

**Performance Goals**: API 응답 300ms 이내 p95 (`docs/REQUIREMENTS.md` NFR-001)

**Constraints**: 에러 응답 형식 통일, 비즈니스 로직은 `src/server/services/`에만 위치 (헌장
원칙 III, V)

**Scale/Scope**: 엔드포인트 1개(`PATCH /api/tickets/:id/complete`) — 새 동적 라우트 파일 하나
생성

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 원칙 | 상태 | 근거 |
|------|------|------|
| I. TypeScript Strict 모드 필수 | PASS | 신규 코드 strict 모드로 컴파일 |
| II. API 응답 명세 준수 | PASS | `contracts/patch-tickets-id-complete.md`가 `docs/API_SPECS.md` 섹션을 그대로 재진술 |
| III. 에러 응답 형식 통일 | PASS | 404가 `{ error: { code: 'NOT_FOUND', message } }` 형식(003/004/005와 동일) |
| IV. 요청 검증은 Zod로만 | N/A | 요청 바디가 없어 검증 대상 자체가 없음 |
| V. 비즈니스 로직의 서비스 계층 분리 | PASS | 토글 로직은 `complete()`(서비스 계층)에 위치, Route Handler는 파싱·호출·응답만 수행 |

위반 없음 — Complexity Tracking 불필요.

## Project Structure

### Documentation (this feature)

```text
specs/006-complete-ticket/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── patch-tickets-id-complete.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
└── api/
    └── tickets/
        └── [id]/
            └── complete/
                └── route.ts      # 신규: PATCH

src/
└── server/
    └── services/
        └── ticketService.ts      # complete() 추가

__tests__/
└── api/
    └── tickets-id-complete.test.ts   # 신규
```

**Structure Decision**: `app/api/tickets/[id]/complete/route.ts`는 이미 스캐폴딩되어 있던
빈 폴더(`.gitkeep`)를 실제 파일로 채우는 것이다. `[id]/route.ts`와는 별개 파일이므로 404
처리 로직(`parseId`, 404 JSON)을 이 파일 안에 독립적으로 작성한다(`research.md`에서 조기
추상화를 피하기로 결정한 근거 참고).

## Complexity Tracking

*해당 없음 — Constitution Check 위반이 없어 정당화가 필요한 항목이 없다.*
