---

description: "Task list template for feature implementation"
---

# Tasks: 티켓 완료 처리 (PATCH /api/tickets/:id/complete)

**Input**: Design documents from `/specs/006-complete-ticket/`

**Prerequisites**: plan.md, spec.md, data-model.md, contracts/patch-tickets-id-complete.md,
research.md, quickstart.md

**Tests**: 헌장이 TDD를 필수로 규정하므로 테스트 태스크는 필수다.

**Organization**: 단일 사용자 스토리(US1)로 구성된다.

---

## Phase 1: Setup

*해당 없음.*

## Phase 2: Foundational

*해당 없음.*

---

## Phase 3: User Story 1 - 티켓 완료 처리 및 되돌리기 (Priority: P1) 🎯 MVP

**Goal**: DONE이 아닌 티켓은 완료 처리하고, 이미 DONE인 티켓은 되돌리는 토글을 구현한다.

**Independent Test**: 완료되지 않은 티켓과 이미 완료된 티켓 각각에 같은 요청을 보내 토글
동작을 확인한다.

### Tests for User Story 1 (Red)

- [x] T001 [US1] TC-API-005-1~3 테스트 작성: DONE 전환, DONE→IN_PROGRESS 되돌리기, 존재하지
  않는 ID(404) 검증 — `__tests__/api/tickets-id-complete.test.ts` (신규 파일)

### Implementation for User Story 1 (Green)

- [ ] T002 [US1] `complete()` 서비스 함수(조회 후 토글 갱신) + `app/api/tickets/[id]/complete/route.ts`
  생성 — `src/server/services/ticketService.ts`,
  `app/api/tickets/[id]/complete/route.ts` (의존: T001)

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
