# TEST_CASES - Tika (Test Case Specification)

> 최종 수정: 2026-06-28
> 버전: 1.0 (MVP)
> 테스트 프레임워크: Jest + React Testing Library (API), MSW (통합)

---

## 1. API 테스트 (TC-API)

서버 Route Handler + Service 계층 검증. 각 엔드포인트의 정상 케이스와 예외 케이스를 포함한다.

---

### TC-API-001: POST `/api/tickets` — 티켓 생성

| TC ID | 시나리오 | 입력값 | 기대 결과 |
|-------|----------|--------|-----------|
| TC-API-001-1 | 최소 필드(title)만으로 생성 성공 | `{ title: "할 일" }` | 201, status=BACKLOG, priority=MEDIUM, position≤0 |
| TC-API-001-2 | 전체 필드로 생성 성공 | `{ title, description, priority: "HIGH", plannedStartDate, dueDate }` | 201, 입력 필드 모두 응답에 포함 |
| TC-API-001-3 | title 누락 | `{}` | 400, VALIDATION_ERROR, "제목을 입력해주세요" |
| TC-API-001-4 | title 공백만 입력 | `{ title: "   " }` | 400, VALIDATION_ERROR, "제목을 입력해주세요" |
| TC-API-001-5 | title 201자 초과 | `{ title: "a".repeat(201) }` | 400, VALIDATION_ERROR, "제목은 200자 이내로 입력해주세요" |
| TC-API-001-6 | description 1001자 초과 | `{ title: "t", description: "a".repeat(1001) }` | 400, VALIDATION_ERROR, "설명은 1000자 이내로 입력해주세요" |
| TC-API-001-7 | 잘못된 priority 값 | `{ title: "t", priority: "URGENT" }` | 400, VALIDATION_ERROR, "우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요" |
| TC-API-001-8 | dueDate가 과거 날짜 | `{ title: "t", dueDate: "2020-01-01" }` | 400, VALIDATION_ERROR, "종료예정일은 오늘 이후 날짜를 선택해주세요" |

---

### TC-API-002: GET `/api/tickets` — 보드 조회

| TC ID | 시나리오 | 입력값 | 기대 결과 |
|-------|----------|--------|-----------|
| TC-API-002-1 | 빈 보드 조회 | — | 200, `{ backlog: [], todo: [], inProgress: [], done: [] }` |
| TC-API-002-2 | 티켓이 있는 보드 조회 | — | 200, 각 칼럼에 티켓 배열, position 오름차순 정렬 |
| TC-API-002-3 | DONE 칼럼 24h 필터 | completedAt 25시간 전 티켓 존재 | 200, done 배열에 해당 티켓 미포함 |

---

### TC-API-003: GET `/api/tickets/:id` — 단건 조회

| TC ID | 시나리오 | 입력값 | 기대 결과 |
|-------|----------|--------|-----------|
| TC-API-003-1 | 존재하는 티켓 조회 | id=1 (존재) | 200, 티켓 전체 객체 (isOverdue 포함) |
| TC-API-003-2 | 존재하지 않는 ID | id=9999 | 404, NOT_FOUND |

---

### TC-API-004: PATCH `/api/tickets/:id` — 티켓 수정

| TC ID | 시나리오 | 입력값 | 기대 결과 |
|-------|----------|--------|-----------|
| TC-API-004-1 | title만 수정 | `{ title: "새 제목" }` | 200, title 변경, 나머지 필드 유지 |
| TC-API-004-2 | description을 null로 삭제 | `{ description: null }` | 200, description=null |
| TC-API-004-3 | 복수 필드 동시 수정 | `{ title, priority: "HIGH", dueDate }` | 200, 전송 필드 모두 갱신 |
| TC-API-004-4 | 존재하지 않는 ID | id=9999, `{ title: "t" }` | 404, NOT_FOUND |
| TC-API-004-5 | title 201자 초과 | `{ title: "a".repeat(201) }` | 400, VALIDATION_ERROR |
| TC-API-004-6 | dueDate가 과거 | `{ dueDate: "2020-01-01" }` | 400, VALIDATION_ERROR |

---

### TC-API-005: PATCH `/api/tickets/:id/complete` — 완료 처리

| TC ID | 시나리오 | 입력값 | 기대 결과 |
|-------|----------|--------|-----------|
| TC-API-005-1 | 비-DONE 티켓 → DONE 처리 | id=1 (status=BACKLOG) | 200, status=DONE, completedAt=현재시각 |
| TC-API-005-2 | DONE 티켓 → 복귀 (토글) | id=1 (status=DONE) | 200, status=IN_PROGRESS, completedAt=null |
| TC-API-005-3 | 존재하지 않는 ID | id=9999 | 404, NOT_FOUND |

---

### TC-API-006: DELETE `/api/tickets/:id` — 티켓 삭제

| TC ID | 시나리오 | 입력값 | 기대 결과 |
|-------|----------|--------|-----------|
| TC-API-006-1 | 존재하는 티켓 삭제 | id=1 | 204, No Content |
| TC-API-006-2 | 삭제 후 재조회 | id=1 삭제 후 GET /api/tickets/1 | 404, NOT_FOUND |
| TC-API-006-3 | 존재하지 않는 ID | id=9999 | 404, NOT_FOUND |

---

### TC-API-007: PATCH `/api/tickets/reorder` — 순서/상태 변경

| TC ID | 시나리오 | 입력값 | 기대 결과 |
|-------|----------|--------|-----------|
| TC-API-007-1 | BACKLOG → TODO 이동 | `{ ticketId, status: "TODO", position: 0 }` | 200, status=TODO, startedAt=현재시각 |
| TC-API-007-2 | TODO → BACKLOG 이동 | `{ ticketId, status: "BACKLOG", position: 0 }` | 200, status=BACKLOG, startedAt=null |
| TC-API-007-3 | 같은 칼럼 내 순서 변경 | `{ ticketId, status: "BACKLOG", position: 512 }` | 200, position 갱신, status 유지 |
| TC-API-007-4 | DONE 이동 시도 | `{ ticketId, status: "DONE", position: 0 }` | 400, VALIDATION_ERROR |
| TC-API-007-5 | 잘못된 status 값 | `{ ticketId, status: "INVALID" }` | 400, VALIDATION_ERROR |
| TC-API-007-6 | 존재하지 않는 ticketId | `{ ticketId: 9999, status: "TODO", position: 0 }` | 404, NOT_FOUND |
| TC-API-007-7 | position 간격 < 1 시 재정렬 | 기존 두 카드의 position 차이 < 1인 상태에서 삽입 | 200, 칼럼 전체 1024 간격으로 재정렬 후 반환 |

---

### TC-API-008: `isOverdue` 파생 필드

| TC ID | 시나리오 | 조건 | 기대 결과 |
|-------|----------|------|-----------|
| TC-API-008-1 | dueDate 지남 + 미완료 → true | dueDate=어제, status=IN_PROGRESS | isOverdue=true |
| TC-API-008-2 | dueDate 지남 + DONE → false | dueDate=어제, status=DONE | isOverdue=false |
| TC-API-008-3 | dueDate 없음 → false | dueDate=null | isOverdue=false |
| TC-API-008-4 | dueDate 오늘 이후 → false | dueDate=내일, status=BACKLOG | isOverdue=false |

---

## 2. 컴포넌트 테스트 (TC-COMP)

사용자 관점 검증. 내부 구현이 아닌 **사용자가 보는 것**과 **사용자가 하는 행동**에 초점을 맞춘다.

---

### TC-COMP-001: `TicketCard`

| TC ID | 시나리오 | 조건 | 기대 결과 |
|-------|----------|------|-----------|
| TC-COMP-001-1 | 기본 정보 렌더링 | title, priority=HIGH, dueDate 있음 | 제목 텍스트, [HIGH] 뱃지, 날짜 텍스트 화면에 표시 |
| TC-COMP-001-2 | 오버듀 경고 표시 | isOverdue=true | 경고 아이콘/표시 렌더링 |
| TC-COMP-001-3 | isOverdue=false면 경고 미표시 | isOverdue=false | 경고 아이콘 없음 |
| TC-COMP-001-4 | dueDate 없으면 날짜 미표시 | dueDate=null | 날짜 영역 렌더링 안 됨 |
| TC-COMP-001-5 | 카드 클릭 시 콜백 호출 | 카드 클릭 | onCardClick(id) 1회 호출 |

---

### TC-COMP-002: `BoardColumn`

| TC ID | 시나리오 | 조건 | 기대 결과 |
|-------|----------|------|-----------|
| TC-COMP-002-1 | 칼럼명과 카드 수 표시 | status=BACKLOG, tickets 3개 | "BACKLOG"와 "3" 텍스트 표시 |
| TC-COMP-002-2 | 티켓 목록 렌더링 | tickets 2개 | 2개의 카드 제목 화면에 표시 |
| TC-COMP-002-3 | 빈 칼럼 | tickets=[] | 카드 없음, 카드 수 0 표시 |

---

### TC-COMP-003: `KanbanBoard`

| TC ID | 시나리오 | 조건 | 기대 결과 |
|-------|----------|------|-----------|
| TC-COMP-003-1 | 4개 칼럼 렌더링 | initialData 있음 | BACKLOG, TODO, IN PROGRESS, DONE 칼럼명 모두 표시 |
| TC-COMP-003-2 | "+ 새 티켓" 버튼 클릭 | 버튼 클릭 | 생성 모드 TicketModal 렌더링 |
| TC-COMP-003-3 | FilterBar 표시 | — | "이번 주 업무", "만기일이 지난 업무" 버튼 표시 |

---

### TC-COMP-004: `TicketModal` + `TicketForm` — 생성 모드

| TC ID | 시나리오 | 조건 | 기대 결과 |
|-------|----------|------|-----------|
| TC-COMP-004-1 | 생성 폼 초기 상태 | mode="create" 모달 열기 | 제목 빈칸, 우선순위 MEDIUM 기본 선택 |
| TC-COMP-004-2 | 빈 title로 저장 시도 | 저장 클릭 (title 비어있음) | "제목을 입력해주세요" 에러 메시지 표시 |
| TC-COMP-004-3 | 유효한 입력 후 저장 | title 입력 → 저장 클릭 | createTicket API 호출, 모달 닫힘 |
| TC-COMP-004-4 | 닫기(×) 버튼 클릭 | × 클릭 | 모달 닫힘 |

---

### TC-COMP-005: `TicketModal` — 수정 모드

| TC ID | 시나리오 | 조건 | 기대 결과 |
|-------|----------|------|-----------|
| TC-COMP-005-1 | 기존 데이터 폼 초기화 | ticketId 있는 모달 열기 | 기존 title, priority 값이 폼에 표시 |
| TC-COMP-005-2 | 수정 후 저장 | 필드 수정 → 저장 클릭 | updateTicket API 호출, 모달 유지 (닫히지 않음) |
| TC-COMP-005-3 | 삭제 버튼 표시 | — | [삭제] 버튼 화면에 존재 |

---

### TC-COMP-006: `ConfirmDialog`

| TC ID | 시나리오 | 조건 | 기대 결과 |
|-------|----------|------|-----------|
| TC-COMP-006-1 | [삭제] 클릭 시 다이얼로그 표시 | TicketModal에서 [삭제] 클릭 | 확인 메시지 + [취소] [삭제] 버튼 표시 |
| TC-COMP-006-2 | [취소] 클릭 | 다이얼로그에서 [취소] 클릭 | 다이얼로그 닫힘, 티켓 유지 |
| TC-COMP-006-3 | [삭제] 확인 클릭 | 다이얼로그에서 [삭제] 클릭 | onConfirm() 호출 |

---

### TC-COMP-007: `FilterBar`

| TC ID | 시나리오 | 조건 | 기대 결과 |
|-------|----------|------|-----------|
| TC-COMP-007-1 | 버튼 2개 렌더링 | — | "이번 주 업무", "만기일이 지난 업무" 버튼 표시 |
| TC-COMP-007-2 | 필터 활성화 | [이번 주 업무] 클릭 | onFilterChange("THIS_WEEK") 호출, 버튼 강조 표시 |
| TC-COMP-007-3 | 같은 버튼 재클릭으로 해제 | 활성 버튼 재클릭 | onFilterChange(null) 호출 |
| TC-COMP-007-4 | 다른 필터로 전환 | [이번 주] 활성 중 [만기일] 클릭 | onFilterChange("OVERDUE") 호출 |

---

## 3. 통합 테스트 (TC-INT)

핵심 기능의 UI 동작 + API 연동을 엔드투엔드 관점으로 검증한다. API는 MSW(Mock Service Worker)로 모킹한다.

---

### TC-INT-001: 드래그앤드롭 — 이동 및 롤백

| TC ID | 시나리오 | 동작 | 기대 결과 |
|-------|----------|------|-----------|
| TC-INT-001-1 | 칼럼 간 이동 성공 | BACKLOG 카드를 TODO 칼럼으로 드래그 → API 성공 | 카드 TODO 칼럼에 표시, PATCH /api/tickets/reorder 호출됨 |
| TC-INT-001-2 | 칼럼 내 순서 변경 | 같은 칼럼 내 카드 순서 드래그 → API 성공 | 변경된 순서로 카드 표시, reorder API 호출됨 |
| TC-INT-001-3 | 드래그 중 UI 피드백 | 카드 드래그 시작 | 원래 위치 반투명 placeholder, DragOverlay 렌더링 |
| TC-INT-001-4 | API 실패 시 롤백 | 카드 드래그 → API 500 응답 | 카드 원래 칼럼으로 복귀, 에러 메시지 표시 |

---

### TC-INT-002: DONE 완료 처리 및 역이동

| TC ID | 시나리오 | 동작 | 기대 결과 |
|-------|----------|------|-----------|
| TC-INT-002-1 | 카드를 DONE 칼럼으로 드래그 | 카드 → DONE 드롭 → API 성공 | DONE 칼럼에 카드 표시, PATCH /:id/complete 호출됨 |
| TC-INT-002-2 | DONE 카드 역이동 | DONE 카드 → IN_PROGRESS 드롭 → API 성공 | IN_PROGRESS 칼럼으로 이동, PATCH /:id/complete 호출됨 (토글) |
| TC-INT-002-3 | DONE 카드 완료 표시 | DONE 칼럼 이동 후 | 카드에 완료 표시(✓) 렌더링 |

---

### TC-INT-003: 티켓 삭제 흐름

| TC ID | 시나리오 | 동작 | 기대 결과 |
|-------|----------|------|-----------|
| TC-INT-003-1 | 삭제 전체 흐름 | 카드 클릭 → [삭제] → [확인] → API 성공 | 카드 보드에서 제거, DELETE /:id 호출됨, 모달 닫힘 |
| TC-INT-003-2 | 삭제 취소 | 카드 클릭 → [삭제] → [취소] | 카드 유지, DELETE API 미호출, TicketModal 유지 |

---

## 4. 추적 매트릭스 (Requirement Traceability Matrix)

| TC ID | 관련 FR | 관련 US | 테스트 대상 |
|-------|---------|---------|------------|
| TC-API-001 | FR-001 | US-001, US-002 | POST /api/tickets 생성 및 입력 검증 |
| TC-API-002 | FR-002 | US-003 | GET /api/tickets 보드 조회 및 정렬 |
| TC-API-003 | FR-003 | US-007 | GET /api/tickets/:id 단건 조회 |
| TC-API-004 | FR-004 | US-007 | PATCH /api/tickets/:id 부분 수정 |
| TC-API-005 | FR-005 | US-006 | PATCH /api/tickets/:id/complete 완료 토글 |
| TC-API-006 | FR-006 | US-008 | DELETE /api/tickets/:id 하드 삭제 |
| TC-API-007 | FR-007 | US-005, US-006 | PATCH /api/tickets/reorder 상태·순서 변경 |
| TC-API-008 | FR-008 | US-004 | isOverdue 파생 필드 계산 |
| TC-COMP-001 | FR-008 | US-004 | TicketCard 렌더링, 오버듀·우선순위 표시 |
| TC-COMP-002 | FR-002 | US-003 | BoardColumn 칼럼·카드 수 렌더링 |
| TC-COMP-003 | FR-001, FR-002 | US-001, US-003 | KanbanBoard 레이아웃 및 모달 제어 |
| TC-COMP-004 | FR-001 | US-001, US-002 | TicketModal(생성) 폼 검증 및 저장 흐름 |
| TC-COMP-005 | FR-003, FR-004 | US-007 | TicketModal(수정) 기존 데이터 표시 및 저장 |
| TC-COMP-006 | FR-006 | US-008 | ConfirmDialog 삭제 확인 흐름 |
| TC-COMP-007 | — | — | FilterBar 필터 토글 및 강조 상태 |
| TC-INT-001 | FR-007 | US-005 | DnD 이동, 낙관적 업데이트, 실패 롤백 |
| TC-INT-002 | FR-005, FR-007 | US-006 | DONE 완료 처리, 역이동 토글, 완료 표시 |
| TC-INT-003 | FR-006 | US-008 | 티켓 삭제 전체 흐름 (모달→확인→보드 반영) |
