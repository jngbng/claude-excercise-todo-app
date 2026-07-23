---

description: "Task list template for feature implementation"
---

# Tasks: 티켓 생성 (POST /api/tickets)

**Input**: Design documents from `/specs/001-create-ticket/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/post-tickets.md, research.md, quickstart.md

**Tests**: 프로젝트 헌장(`.specify/memory/constitution.md` 개발 워크플로)이 TDD(Red-Green-Refactor)를
필수로 규정하므로, 이 기능의 테스트 태스크는 선택이 아니라 필수다.

**Organization**: 태스크는 spec.md의 사용자 스토리(P1/P2/P3)별로 그룹화되어 독립적으로 구현·검증할 수
있다.

**현재 상태**: 2026-07-24 `/speckit-implement` 실행 완료 — 전체 17개 태스크 모두 `[x]` 완료.
T012, T014(누락된 회귀 테스트 2건)를 추가하고, T016(quickstart 수동 검증), T017(타입체크·lint·
테스트 확인)을 수행했다. 그 과정에서 마이그레이션 파일명과 `meta/_journal.json`의 태그가
불일치해 `db:migrate`가 깨져 있던 문제와, `.next/types/`가 존재할 때 lint가 실패하던 문제를
함께 발견해 수정했다 (아래 Notes 참고).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 다른 파일을 다루며 의존성이 없어 병렬 실행 가능
- **[Story]**: 해당 태스크가 속한 사용자 스토리 (US1/US2/US3)
- **주의**: 이 기능의 테스트 태스크(US1~US3의 테스트)는 모두 동일한 파일
  (`__tests__/api/tickets.test.ts`)을 수정하므로, 템플릿의 일반 규칙과 달리 서로 `[P]`로 표시하지
  않았다 — 같은 파일에 대한 동시 편집 충돌을 피하기 위함이다.

## Path Conventions

이 프로젝트는 `CLAUDE.md`/`docs/TRD.md`에 확정된 구조를 따른다: `app/api/`(Route Handler),
`src/server/`(서비스·DB), `src/shared/`(공유 타입·검증), `__tests__/`(테스트).

---

## Phase 1: Setup

**Purpose**: 이 기능이 의존하는 DB 마이그레이션 산출물 확인

- [x] T001 `tickets` 테이블 초기 마이그레이션 생성 확인 — `src/server/db/migrations/0000_tiny_argent.sql`,
  `src/server/db/migrations/meta/_journal.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 사용자 스토리가 공통으로 의존하는 스키마·타입·검증·배선

**⚠️ CRITICAL**: 이 단계가 끝나야 사용자 스토리 구현을 시작할 수 있다

- [x] T002 [P] `tickets` 테이블 Drizzle 스키마 정의 — `src/server/db/schema.ts`
- [x] T003 [P] 공유 `Ticket` 타입 및 `TICKET_STATUS`/`TICKET_PRIORITY` 상수 정의 —
  `src/shared/types/index.ts`
- [x] T004 [P] `createTicketSchema` Zod 스키마 기본 골격(title 필수, priority enum) 정의 —
  `src/shared/validations/ticket.ts`
- [x] T005 `POST` Route Handler를 서비스 계층에 배선 (요청 파싱 → Zod 검증 → 서비스 호출 → 응답
  반환) — `app/api/tickets/route.ts`, `src/server/services/ticketService.ts` (의존: T002, T003, T004)

**Checkpoint**: 기반 완료 — 사용자 스토리 구현 가능 (모두 완료됨)

---

## Phase 3: User Story 1 - 제목만으로 빠르게 등록 (Priority: P1) 🎯 MVP

**Goal**: 사용자가 제목만 입력해 새 할 일을 Backlog에 등록할 수 있다.

**Independent Test**: 제목만 입력해 생성 요청을 보내고, 응답이 `status=BACKLOG`,
`priority=MEDIUM`, `position<=0`인지 확인한다.

### Tests for User Story 1

> **참고**: 테스트를 먼저 작성해 실패를 확인한 뒤 구현하는 것이 원칙이나, 아래 T006/T007은 이미
> 완료되어 통과 중이다.

- [x] T006 [US1] TC-API-001-1 테스트 작성: title만으로 생성 시 201, `status=BACKLOG`,
  `priority=MEDIUM`, `position<=0` 검증 — `__tests__/api/tickets.test.ts` (의존: T005)

### Implementation for User Story 1

- [x] T007 [US1] `create()`에서 신규 티켓의 `status`를 항상 `BACKLOG`로 고정하고, `position`을
  BACKLOG 칼럼 최솟값 - 1024(비어 있으면 0)로 계산하는 로직 구현 —
  `src/server/services/ticketService.ts` (의존: T006)

**Checkpoint**: User Story 1 독립적으로 동작 확인됨 (완료)

---

## Phase 4: User Story 2 - 상세 정보를 포함해 등록 (Priority: P2)

**Goal**: 사용자가 description/priority/plannedStartDate/dueDate를 포함해 티켓을 등록할 수 있다.

**Independent Test**: 모든 선택 필드를 채워 생성 요청 후 응답에 입력값이 그대로 반영되는지, 과거
dueDate 요청은 거부되는지 확인한다.

### Tests for User Story 2

- [x] T008 [US2] TC-API-001-2 테스트 작성: 전체 필드로 생성 시 입력값이 모두 응답에 포함되는지 검증
  — `__tests__/api/tickets.test.ts` (의존: T007)
- [x] T009 [US2] TC-API-001-8 테스트 작성: dueDate가 과거 날짜면 400과 지정된 오류 메시지를
  반환하는지 검증 — `__tests__/api/tickets.test.ts` (의존: T007)

### Implementation for User Story 2

- [x] T010 [US2] description(최대 1000자)/priority(기본값 MEDIUM)/plannedStartDate/dueDate(오늘
  이후 `refine` 검증) 선택 필드 처리 구현 — `src/shared/validations/ticket.ts`,
  `src/server/services/ticketService.ts` (의존: T008, T009)

**Checkpoint**: User Story 1과 2가 함께 독립적으로 동작 확인됨 (완료)

---

## Phase 5: User Story 3 - 잘못된 입력에 대한 명확한 안내 (Priority: P3)

**Goal**: 유효하지 않은 입력에 대해 구체적인 오류 메시지를 반환한다.

**Independent Test**: 제목 누락/공백/초과, 설명 초과, 잘못된 priority 각각의 요청에 대해 지정된
오류 메시지를 받는지 확인한다.

### Tests for User Story 3

- [x] T011 [US3] TC-API-001-3 테스트 작성: title 누락 시 400 + "제목을 입력해주세요" 검증 —
  `__tests__/api/tickets.test.ts` (의존: T010)
- [x] T012 [US3] TC-API-001-4 테스트 작성: title이 공백 문자로만 구성된 경우 400 + "제목을
  입력해주세요" 검증 — `__tests__/api/tickets.test.ts` (의존: T010)
- [x] T013 [US3] TC-API-001-5 테스트 작성: title이 200자를 초과하면 400 + "제목은 200자 이내로
  입력해주세요" 검증 — `__tests__/api/tickets.test.ts` (의존: T010)
- [x] T014 [US3] TC-API-001-6 테스트 작성: description이 1000자를 초과하면 400 + "설명은 1000자
  이내로 입력해주세요" 검증 — `__tests__/api/tickets.test.ts` (의존: T010)
- [x] T015 [US3] TC-API-001-7 테스트 작성: 잘못된 priority 값이면 400 + "우선순위는 LOW, MEDIUM,
  HIGH 중 선택해주세요" 검증 — `__tests__/api/tickets.test.ts` (의존: T010)

> T012, T014는 `createTicketSchema`의 `title.trim().min(1)`, `description.max(1000)` 규칙이 이미
> 처리하는 케이스에 대한 회귀 테스트다. 작성 후 바로 통과할 것으로 예상되며, 통과하지 않는다면
> 테스트가 아니라 스키마 구현을 의심할 것 (헌장 원칙: "테스트 실패 시 구현을 수정, 테스트는
> 수정하지 않는다"의 역방향 — 이 경우는 스키마가 아니라 새로 작성한 테스트 코드 자체의 오류일
> 가능성을 먼저 점검한다).

### Implementation for User Story 3

구현은 Phase 2(T004)와 Phase 4(T010)에서 이미 완료되었다 — 이 단계는 테스트 커버리지만 보강한다.

**Checkpoint**: 모든 사용자 스토리가 독립적으로 동작 확인됨 (T012, T014 추가 시 완료)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 전체 기능에 대한 최종 검증

- [x] T016 [P] `quickstart.md`의 curl 시나리오 3종을 로컬 서버에서 수동 검증
- [x] T017 [P] `npx tsc --noEmit`, `npm run lint`, `npm test`가 모두 통과하는지 확인

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 의존성 없음 — 완료됨
- **Foundational (Phase 2)**: Setup 완료에 의존 — 모든 사용자 스토리를 막는 단계 — 완료됨
- **User Stories (Phase 3~5)**: Foundational 완료에 의존, 우선순위 순(P1 → P2 → P3)으로 순차 진행
  (같은 파일을 다루므로 병렬보다는 순차 권장)
- **Polish (Phase 6)**: 원하는 모든 사용자 스토리 완료에 의존

### User Story Dependencies

- **User Story 1 (P1)**: Foundational 이후 시작 가능 — 다른 스토리에 의존하지 않음 (완료)
- **User Story 2 (P2)**: Foundational 이후 시작 가능하나, 동일 서비스 함수를 확장하므로 US1 이후
  진행 (완료)
- **User Story 3 (P3)**: 동일한 검증 스키마에 케이스를 추가하므로 US1·US2 이후 진행 (T012, T014
  남음)

### Within Each User Story

- 테스트를 먼저 작성해 실패를 확인한 뒤 구현 (T012, T014는 예외적으로 기존 구현이 이미 처리하는
  회귀 테스트)
- 모델(스키마) → 서비스 → 엔드포인트 순
- 스토리 완료 후 다음 우선순위로 이동

### Parallel Opportunities

- Foundational 단계의 T002, T003, T004는 서로 다른 파일이므로 병렬 실행 가능
- 그 외 태스크는 대부분 `__tests__/api/tickets.test.ts` 또는 동일 서비스/스키마 파일을 순차적으로
  수정하므로 병렬 실행을 권장하지 않는다
- Polish 단계의 T016, T017은 서로 다른 활동이므로 병렬 실행 가능

---

## Parallel Example: Foundational

```bash
# Foundational 단계에서 함께 실행 가능한 태스크:
Task: "tickets 테이블 Drizzle 스키마 정의 in src/server/db/schema.ts"
Task: "공유 Ticket 타입 정의 in src/shared/types/index.ts"
Task: "createTicketSchema 기본 골격 정의 in src/shared/validations/ticket.ts"
```

---

## Implementation Strategy

### 완료 기록 (Completed)

1. T012 — 제목 공백만 입력 회귀 테스트 작성, 구현 변경 없이 통과 확인
2. T014 — 설명 1000자 초과 회귀 테스트 작성, 구현 변경 없이 통과 확인
3. T016 — `next dev` + 실제 DB로 quickstart.md curl 시나리오 3종 수동 검증 (SC-001~004 모두 충족 확인)
4. T017 — `npx tsc --noEmit`, `npm run lint`, `npm test` 전체 통과 확인 (8/8 테스트)

### MVP 범위

User Story 1(T006, T007)은 이미 완료되어 있어 MVP는 배포 가능한 상태였다. 이번 실행으로 P3 스토리의
회귀 테스트 커버리지와 최종 검증까지 모두 완료되어, 이 기능(POST /api/tickets)은 전체가 완료 상태다.

---

## Notes

- `[P]` 태스크는 서로 다른 파일이며 의존성이 없는 경우에만 표시했다
- `[Story]` 라벨은 spec.md의 사용자 스토리와의 추적성을 위한 것이다
- `npm test -- __tests__/api/tickets.test.ts` 기준 TC-API-001-1~8 전체 8/8 통과
- T001 검증 중 `src/server/db/migrations/meta/_journal.json`의 `tag`가 실제 파일명
  (`0000_generate_tickets_table.sql`)과 달라 `db:migrate`가 실패하는 문제를 발견해 태그를
  수정했다 (파일이 이 태스크 범위 밖에서 이미 리네임되어 있었음)
- T017 검증 중 `.next/types/`가 로컬에 존재할 때 lint가 실패하는 문제를 발견해
  `eslint.config.mjs`의 ignores에 `.next/**`를 추가했다
- 커밋은 태스크 단위로 수행한다
