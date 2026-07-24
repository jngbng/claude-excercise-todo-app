---

description: "Task list template for feature implementation"
---

# Tasks: 티켓 수정 (PATCH /api/tickets/:id)

**Input**: Design documents from `/specs/004-update-ticket/`

**Prerequisites**: plan.md, spec.md, data-model.md, contracts/patch-tickets-id.md, research.md,
quickstart.md

**Tests**: 헌장이 TDD를 필수로 규정하므로 테스트 태스크는 필수다.

**Organization**: 단일 사용자 스토리(US1)로 구성된다.

---

## Phase 1: Setup

*해당 없음 — 002/003의 테스트 헬퍼·404 패턴을 그대로 재사용한다.*

## Phase 2: Foundational

*해당 없음.*

---

## Phase 3: User Story 1 - 티켓 내용 수정 (Priority: P1) 🎯 MVP

**Goal**: 전송된 필드만 부분 수정하고, null 전송 시 삭제, 유효성 실패 시 400, 존재하지 않으면
404를 반환한다.

**Independent Test**: 단일 필드 수정, null 삭제, 복수 필드 동시 수정, 존재하지 않는 ID,
유효성 실패 각각을 요청해 응답을 확인한다.

### Tests for User Story 1 (Red)

- [x] T001 [US1] TC-API-004-1~6 테스트 작성: title만 수정, description null 삭제, 복수 필드
  동시 수정, 존재하지 않는 ID(404), title 초과(400), 과거 dueDate(400) 검증 —
  `__tests__/api/tickets-id.test.ts` (기존 GET 테스트 옆에 추가)

### Implementation for User Story 1 (Green)

- [ ] T002 [US1] `updateTicketSchema` 정의(모든 필드 optional, 기본값 없음) —
  `src/shared/validations/ticket.ts` (의존: T001)
- [ ] T003 [US1] `update()` 서비스 함수(키 존재 여부로 부분 갱신) + `app/api/tickets/[id]/route.ts`에
  `PATCH` Route Handler 추가 — `src/server/services/ticketService.ts`,
  `app/api/tickets/[id]/route.ts` (의존: T002)

### Refactor

*평가만 하고 필요한 경우에만 커밋한다.*

**Checkpoint**: User Story 1 독립적으로 동작 확인됨

---

## Phase 4: Polish & Cross-Cutting Concerns

- [ ] T004 [P] `quickstart.md`의 curl 시나리오를 로컬 서버에서 수동 검증
- [ ] T005 [P] `npx tsc --noEmit`, `npm run lint`, `npm test`가 모두 통과하는지 확인

---

## Notes

- Red(T001) → Green(T002, T003) → Refactor(평가) 각 단계가 끝날 때마다 커밋한다
- T002, T003은 같은 목표(Green)를 위한 것이라 하나의 커밋으로 묶어도 무방하다
