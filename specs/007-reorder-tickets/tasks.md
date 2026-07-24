---

description: "Task list template for feature implementation"
---

# Tasks: 드래그앤드롭 상태·순서 변경 (PATCH /api/tickets/reorder)

**Input**: Design documents from `/specs/007-reorder-tickets/`

**Prerequisites**: plan.md, spec.md, data-model.md, contracts/patch-tickets-reorder.md,
research.md, quickstart.md

**Tests**: 헌장이 TDD를 필수로 규정하므로 테스트 태스크는 필수다.

**Organization**: 단일 사용자 스토리(US1)로 구성된다.

---

## Phase 1: Setup

*해당 없음.*

## Phase 2: Foundational

*해당 없음.*

---

## Phase 3: User Story 1 - 드래그앤드롭으로 상태·순서 변경 (Priority: P1) 🎯 MVP

**Goal**: 티켓을 BACKLOG/TODO/IN_PROGRESS 사이에서 이동하거나 같은 칼럼 내 순서를 변경하고,
position 재계산·재정렬·startedAt 자동 처리를 트랜잭션으로 원자적으로 수행한다.

**Independent Test**: 칼럼 간 이동, 같은 칼럼 내 순서 변경, DONE 이동 시도, 존재하지 않는
티켓, 간격 부족 재정렬 각각을 요청해 응답을 확인한다.

### Tests for User Story 1 (Red)

- [x] T001 [US1] TC-API-007-1~7 테스트 작성: BACKLOG→TODO(startedAt 기록), TODO→BACKLOG
  (startedAt 초기화), 같은 칼럼 내 순서 변경, DONE 이동 시도(400), 잘못된 status 값(400),
  존재하지 않는 ticketId(404), 간격<1 시 재정렬(200) 검증 —
  `__tests__/api/tickets-reorder.test.ts` (신규 파일)

### Implementation for User Story 1 (Green)

- [x] T002 [US1] `reorderTicketSchema` 정의(status enum에서 DONE 제외) —
  `src/shared/validations/ticket.ts` (의존: T001)
- [x] T003 [US1] `reorder()` 서비스 함수(이웃 조회, position 재계산, 간격<1 재정렬,
  startedAt 자동 처리, 트랜잭션) + `app/api/tickets/reorder/route.ts` 생성 —
  `src/server/services/ticketService.ts`, `app/api/tickets/reorder/route.ts`
  (의존: T002)

### Refactor

*평가만 하고 필요한 경우에만 커밋한다.*

**Checkpoint**: User Story 1 독립적으로 동작 확인됨 — 이 기능이 완료되면 docs/API_SPECS.md의
7개 엔드포인트가 모두 구현된다.

---

## Phase 4: Polish & Cross-Cutting Concerns

- [ ] T004 [P] `quickstart.md`의 curl 시나리오를 로컬 서버에서 수동 검증
- [ ] T005 [P] `npx tsc --noEmit`, `npm run lint`, `npm test`가 모두 통과하는지 확인

---

## Notes

- Red(T001) → Green(T002, T003) → Refactor(평가) 각 단계가 끝날 때마다 커밋한다
- T002, T003은 같은 목표(Green)를 위한 것이라 하나의 커밋으로 묶어도 무방하다
- 간격<1 재정렬(TC-API-007-7) 테스트는 두 카드의 position이 정확히 같은 상태를 직접
  구성해야 하므로, Drizzle을 통해 fixture를 직접 조작한다
