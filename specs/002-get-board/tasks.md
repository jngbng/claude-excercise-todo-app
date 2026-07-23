---

description: "Task list template for feature implementation"
---

# Tasks: 칸반 보드 전체 조회 (GET /api/tickets)

**Input**: Design documents from `/specs/002-get-board/`

**Prerequisites**: plan.md, spec.md, data-model.md, contracts/get-tickets.md, research.md, quickstart.md

**Tests**: 프로젝트 헌장이 TDD(Red-Green-Refactor)를 필수로 규정하므로, 테스트 태스크는 선택이
아니라 필수다. 이 기능은 사용자 스토리가 1개(P1)뿐이라 Red/Green/Refactor를 각각 하나의 태스크로
분리했다.

**Organization**: 단일 사용자 스토리(US1)로 구성된다.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 다른 파일을 다루며 의존성이 없어 병렬 실행 가능
- **[Story]**: 해당 태스크가 속한 사용자 스토리 (US1)

## Path Conventions

`app/api/tickets/route.ts`(Route Handler), `src/server/services/ticketService.ts`(서비스),
`__tests__/`(테스트) — 001에서 확립한 구조를 그대로 확장한다.

---

## Phase 1: Setup

**Purpose**: 통합 테스트가 실제 DB에 남긴 자기 자신의 데이터만 정리할 수 있는 인프라 준비

- [x] T001 [P] 티켓 생성 id 추적 + 정리 헬퍼 생성 — `__tests__/helpers/ticketFixtures.ts`
  (`trackTicketId`, `cleanupTrackedTickets`)

---

## Phase 2: Foundational

*해당 없음 — 001에서 이미 만든 스키마·타입·Zod 골격을 그대로 재사용하며, 이 기능 전용의 추가
차단 의존성이 없다.*

---

## Phase 3: User Story 1 - 칸반 보드 한눈에 보기 (Priority: P1) 🎯 MVP

**Goal**: 전체 티켓을 상태별 4개 칼럼으로 그룹화하고, position 순으로 정렬하며, Done은 24시간
필터를 적용해 조회한다.

**Independent Test**: 빈 상태, 여러 칼럼에 걸친 상태, 24시간 지난 DONE 티켓이 섞인 상태 각각에서
`GET /api/tickets`를 호출해 응답을 확인한다.

### Tests for User Story 1 (Red)

> **테스트를 먼저 작성해 실패를 확인한 뒤 구현한다 (`app/api/tickets/route.ts`에 아직 `GET`이
> 없으므로 전부 실패해야 한다).**

- [x] T002 [US1] TC-API-002-1,2,3 테스트 작성: 빈 보드 조회, 정렬된 다중 티켓 조회, Done 24시간
  필터 검증 — `__tests__/api/tickets.test.ts` (기존 POST 테스트보다 앞에 위치, 의존: T001)

### Implementation for User Story 1 (Green)

- [x] T003 [US1] `getBoard()` 서비스 함수(그룹화·정렬·24시간 필터, 최소 구현) + `GET` Route
  Handler 추가 — `src/server/services/ticketService.ts`, `app/api/tickets/route.ts` (의존: T002)

### Refactor

- [x] T004 [US1] `create()`와 `getBoard()`가 공유하는 DB row → API 응답 변환 로직을 `toTicket()`
  헬퍼로 추출 — `src/server/services/ticketService.ts` (의존: T003, 테스트는 계속 통과 유지)

**Checkpoint**: User Story 1 독립적으로 동작 확인됨

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: 전체 기능에 대한 최종 검증

- [ ] T005 [P] `quickstart.md`의 curl 시나리오를 로컬 서버에서 수동 검증
- [ ] T006 [P] `npx tsc --noEmit`, `npm run lint`, `npm test`가 모두 통과하는지 확인

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 의존성 없음
- **Foundational (Phase 2)**: 해당 없음
- **User Story 1 (Phase 3)**: Setup 완료에 의존
- **Polish (Phase 4)**: User Story 1 완료에 의존

### Within User Story 1

- 테스트(T002)를 먼저 작성해 실패를 확인한 뒤 구현(T003)
- Refactor(T004)는 테스트가 계속 통과하는 것을 확인하며 진행

### Parallel Opportunities

- T001은 다른 태스크와 독립적으로 먼저 진행 가능
- Polish 단계의 T005, T006은 서로 다른 활동이므로 병렬 실행 가능
- 그 외 태스크는 같은 파일(`ticketService.ts`, `tickets.test.ts`)을 순차적으로 수정하므로
  병렬 실행을 권장하지 않는다

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001 완료
2. T002(Red) → T003(Green) → T004(Refactor)
3. T005, T006으로 최종 검증
4. 이 기능은 사용자 스토리가 하나뿐이므로, 위 사이클이 곧 전체 구현이다.

---

## Notes

- `[P]` 태스크는 서로 다른 파일이며 의존성이 없는 경우에만 표시했다
- Red → Green → Refactor 각 단계가 끝날 때마다 커밋한다
- 리팩터링(T004) 이후에도 T002의 테스트가 계속 통과해야 한다
