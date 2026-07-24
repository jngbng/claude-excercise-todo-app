---

description: "Task list template for feature implementation"
---

# Tasks: 티켓 삭제 (DELETE /api/tickets/:id)

**Input**: Design documents from `/specs/005-delete-ticket/`

**Prerequisites**: plan.md, spec.md, data-model.md, contracts/delete-tickets-id.md, research.md,
quickstart.md

**Tests**: 헌장이 TDD를 필수로 규정하므로 테스트 태스크는 필수다.

**Organization**: 단일 사용자 스토리(US1)로 구성된다.

---

## Phase 1: Setup

*해당 없음.*

## Phase 2: Foundational

*해당 없음.*

---

## Phase 3: User Story 1 - 불필요한 티켓 제거 (Priority: P1) 🎯 MVP

**Goal**: ID로 지정한 티켓을 영구 삭제하고 204를 반환하거나, 존재하지 않으면 404를 반환한다.

**Independent Test**: 존재하는 티켓 삭제 후 재조회, 존재하지 않는 티켓 삭제를 각각 확인한다.

### Tests for User Story 1 (Red)

- [x] T001 [US1] TC-API-006-1~3 테스트 작성: 삭제 성공(204), 삭제 후 재조회(404), 존재하지
  않는 ID 삭제(404) 검증 — `__tests__/api/tickets-id.test.ts` (기존 GET/PATCH 테스트 옆에
  추가)

### Implementation for User Story 1 (Green)

- [ ] T002 [US1] `remove()` 서비스 함수 + `app/api/tickets/[id]/route.ts`에 `DELETE` Route
  Handler 추가 — `src/server/services/ticketService.ts`, `app/api/tickets/[id]/route.ts`
  (의존: T001)

### Refactor

*평가만 하고 필요한 경우에만 커밋한다.*

**Checkpoint**: User Story 1 독립적으로 동작 확인됨

---

## Phase 4: Polish & Cross-Cutting Concerns

- [ ] T003 [P] `quickstart.md`의 curl 시나리오를 로컬 서버에서 수동 검증
- [ ] T004 [P] `npx tsc --noEmit`, `npm run lint`, `npm test`가 모두 통과하는지 확인

---

## Notes

- Red(T001) → Green(T002) → Refactor(평가) 각 단계가 끝날 때마다 커밋한다
