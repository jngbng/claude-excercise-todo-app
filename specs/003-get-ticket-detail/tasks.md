---

description: "Task list template for feature implementation"
---

# Tasks: 티켓 단건 조회 (GET /api/tickets/:id)

**Input**: Design documents from `/specs/003-get-ticket-detail/`

**Prerequisites**: plan.md, spec.md, data-model.md, contracts/get-tickets-id.md, research.md,
quickstart.md

**Tests**: 프로젝트 헌장이 TDD를 필수로 규정하므로 테스트 태스크는 필수다.

**Organization**: 단일 사용자 스토리(US1)로 구성된다.

## Format: `[ID] [P?] [Story] Description`

## Path Conventions

`app/api/tickets/[id]/route.ts`(Route Handler), `src/server/services/ticketService.ts`(서비스),
`__tests__/`(테스트)

---

## Phase 1: Setup

*해당 없음 — 002에서 만든 `__tests__/helpers/ticketFixtures.ts`를 그대로 재사용한다.*

## Phase 2: Foundational

*해당 없음.*

---

## Phase 3: User Story 1 - 티켓 상세 정보 확인 (Priority: P1) 🎯 MVP

**Goal**: ID로 티켓 하나를 조회해 전체 정보를 반환하거나 404를 반환한다.

**Independent Test**: 존재하는 티켓과 존재하지 않는 티켓 각각을 조회해 응답을 확인한다.

### Tests for User Story 1 (Red)

- [x] T001 [US1] TC-API-003-1,2 테스트 작성: 존재하는 티켓 조회(200), 존재하지 않는 ID
  조회(404) 검증 — `__tests__/api/tickets-id.test.ts` (신규 파일)

### Implementation for User Story 1 (Green)

- [ ] T002 [US1] `getById()` 서비스 함수 + `app/api/tickets/[id]/route.ts`에 `GET` Route
  Handler(path parameter 파싱, 404 처리 헬퍼 포함) 구현 —
  `src/server/services/ticketService.ts`, `app/api/tickets/[id]/route.ts` (의존: T001)

### Refactor

*평가만 하고, 필요한 경우에만 커밋한다 — 이 기능은 새 로직이 적어 리팩터링 대상이 없을 가능성이
높다.*

**Checkpoint**: User Story 1 독립적으로 동작 확인됨

---

## Phase 4: Polish & Cross-Cutting Concerns

- [ ] T003 [P] `quickstart.md`의 curl 시나리오를 로컬 서버에서 수동 검증
- [ ] T004 [P] `npx tsc --noEmit`, `npm run lint`, `npm test`가 모두 통과하는지 확인

---

## Dependencies & Execution Order

- Setup/Foundational 없음 → 바로 User Story 1(T001 → T002)부터 시작
- Polish(T003, T004)는 User Story 1 완료에 의존, 서로 병렬 가능

## Notes

- Red(T001) → Green(T002) → Refactor(평가) 각 단계가 끝날 때마다 커밋한다
- 이후 004(수정), 005(삭제) 기능이 `app/api/tickets/[id]/route.ts`에 PATCH/DELETE를 추가할
  것이므로, 이 파일의 구조(파라미터 파싱 헬퍼, 404 응답)를 재사용 가능하게 유지한다
