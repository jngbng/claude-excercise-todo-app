# COMPONENT_SPEC - Tika (Component Specification)

> 최종 수정: 2026-06-28
> 버전: 1.0 (MVP)

---

## 1. 컴포넌트 계층 구조

```
app/page.tsx  (BoardPage — RSC, 초기 데이터 패치)
└── KanbanBoard                          # 보드 루트, DndContext, 전체 상태 관리
    ├── FilterBar                        # 이번 주 / 오버듀 필터 버튼
    ├── BoardColumn × 4                  # 칼럼 (BACKLOG / TODO / IN_PROGRESS / DONE)
    │   ├── ColumnHeader                 # 칼럼명 + 카드 수 뱃지
    │   └── TicketCard × N              # 개별 티켓 카드 (드래그 가능)
    │       └── PriorityBadge           # 우선순위 색상 뱃지
    ├── DragOverlay                      # 드래그 중 카드 미리보기
    ├── TicketModal                      # 상세 보기 / 수정 오버레이
    │   └── TicketForm                  # 생성·수정 공용 폼
    └── ConfirmDialog                   # 삭제 확인 다이얼로그
```

### 레이아웃 와이어프레임

#### 메인 보드 화면

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ KanbanBoard                                                                     │
│                                                                                 │
│  Tika                                                           [+ 새 티켓]    │
│ ┌───────────────────────────────────────────────────────────────────────────┐   │
│ │ FilterBar                          [이번 주 업무]  [만기일이 지난 업무]    │   │
│ └───────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐ │
│  │  BoardColumn    │ │  BoardColumn    │ │  BoardColumn    │ │ BoardColumn   │ │
│  │ ┌─────────────┐ │ │ ┌─────────────┐ │ │ ┌─────────────┐ │ │ ┌───────────┐ │ │
│  │ │ColumnHeader │ │ │ │ColumnHeader │ │ │ │ColumnHeader │ │ │ │ColumnHeader│ │ │
│  │ │ BACKLOG (2) │ │ │ │  TODO  (1)  │ │ │ │IN PROGRESS  │ │ │ │  DONE (1) │ │ │
│  │ └─────────────┘ │ │ └─────────────┘ │ │ │    (1)      │ │ │ └───────────┘ │ │
│  │ ┌─────────────┐ │ │ ┌─────────────┐ │ │ └─────────────┘ │ │ ┌───────────┐ │ │
│  │ │ TicketCard  │ │ │ │ TicketCard  │ │ │ ┌─────────────┐ │ │ │ TicketCard│ │ │
│  │ │ 로그인 디자인│ │ │ │  API 연동   │ │ │ │ TicketCard  │ │ │ │  기획 완료│ │ │
│  │ │ [HIGH] ~7/10│ │ │ │ [MED] ~7/15 │ │ │ │  DB 스키마  │ │ │ │     ✓     │ │ │
│  │ └─────────────┘ │ │ └─────────────┘ │ │ │  [LOW]      │ │ │ └───────────┘ │ │
│  │ ┌─────────────┐ │ │                 │ │ └─────────────┘ │ │               │ │
│  │ │⚠ TicketCard │ │ │                 │ │                 │ │               │ │
│  │ │  리뷰 작업  │ │ │                 │ │                 │ │               │ │
│  │ │ [MED] ~6/20 │ │ │                 │ │                 │ │               │ │
│  │ └─────────────┘ │ │                 │ │                 │ │               │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ └───────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**범례**
- `⚠` — `isOverdue === true` (계획종료일 초과, 미완료)
- `[HIGH]` / `[MED]` / `[LOW]` — `PriorityBadge`
- `~7/10` — `dueDate` 표시
- `✓` — DONE 칼럼 완료 표시

---

#### TicketModal 오버레이

카드 클릭 시 보드 위에 오버레이로 표시된다.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ KanbanBoard (반투명 배경)                                                        │
│                                                                                 │
│            ┌──────────────────────────────────────────────┐                    │
│            │ TicketModal                          [×] 닫기 │                    │
│            │ ──────────────────────────────────────────── │                    │
│            │  제목      로그인 페이지 디자인                │                    │
│            │  상태      BACKLOG          [HIGH]            │                    │
│            │  생성일    2026-06-28                         │                    │
│            │  시작일    —          종료일  —                │                    │
│            │                                              │                    │
│            │ TicketForm                                   │                    │
│            │  설명   ┌─────────────────────────────────┐  │                    │
│            │         │ OAuth 소셜 로그인 포함           │  │                    │
│            │         └─────────────────────────────────┘  │                    │
│            │  계획시작일  [ 2026-07-01              ]      │                    │
│            │  계획종료일  [ 2026-07-10              ]      │                    │
│            │                                              │                    │
│            │  [삭제]                            [저장]    │                    │
│            └──────────────────────────────────────────────┘                    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

#### ConfirmDialog — 삭제 확인

삭제 버튼 클릭 시 TicketModal 위에 중첩하여 표시된다.

```
│            ┌──────────────────────────────────────────────┐
│            │ TicketModal (흐리게)                          │
│            │                                              │
│            │     ┌────────────────────────────────┐       │
│            │     │ ConfirmDialog                  │       │
│            │     │                                │       │
│            │     │  티켓을 삭제하면 복구할 수       │       │
│            │     │  없습니다. 삭제하시겠습니까?     │       │
│            │     │                                │       │
│            │     │  [취소]              [삭제]    │       │
│            │     └────────────────────────────────┘       │
│            └──────────────────────────────────────────────┘
```

---

### 파일 위치

```
src/client/
├── components/
│   ├── KanbanBoard.tsx
│   ├── FilterBar.tsx
│   ├── BoardColumn.tsx
│   ├── ColumnHeader.tsx
│   ├── TicketCard.tsx
│   ├── PriorityBadge.tsx
│   ├── TicketModal.tsx
│   ├── TicketForm.tsx
│   └── ConfirmDialog.tsx
└── hooks/
    ├── useBoard.ts
    ├── useDragAndDrop.ts
    └── useTicketFilter.ts
```

---

## 2. 페이지 컴포넌트

### `app/page.tsx` — BoardPage (RSC)

**책임**: 서버에서 초기 보드 데이터를 패치하여 `KanbanBoard`에 전달한다.

```typescript
// 서버 컴포넌트 — DB 직접 접근 없이 ticketApi.ts 또는 서비스 호출
const data: BoardData = await ticketService.getBoard();
return <KanbanBoard initialData={data} />;
```

- 클라이언트 상태 없음, 데이터 패치만 담당
- 이후 모든 상태 변경은 `KanbanBoard` 내 클라이언트 훅이 처리

---

## 3. 핵심 컴포넌트 명세

### `KanbanBoard`

**책임**: 보드 전체 레이아웃, 전역 상태 관리, DnD 컨텍스트 루트, 모달 개폐 조율.

#### Props

```typescript
type KanbanBoardProps = {
  initialData: BoardData;
};
```

#### 상태

| 상태 | 타입 | 설명 |
|------|------|------|
| `board` | `BoardData` | 칼럼별 티켓 목록 |
| `activeTicketId` | `number \| null` | 드래그 중인 티켓 ID (DragOverlay용) |
| `modalTicketId` | `number \| null` | 상세 모달에 표시할 티켓 ID |
| `isCreateModalOpen` | `boolean` | 생성 폼 모달 열림 여부 |
| `deleteTargetId` | `number \| null` | 삭제 확인 다이얼로그 대상 티켓 ID |
| `filter` | `'THIS_WEEK' \| 'OVERDUE' \| null` | 현재 활성 필터 |

#### 동작

- `useBoard(initialData)`로 보드 데이터와 CRUD 액션 주입
- `useDragAndDrop(board, setBoard)`로 DnD 이벤트 핸들러 주입
- `useTicketFilter(board, filter)`로 필터된 보드 데이터 계산
- `DndContext`로 전체 보드를 감싸고 `onDragStart`, `onDragEnd` 핸들러 연결
- 모달 상태(`modalTicketId`, `isCreateModalOpen`, `deleteTargetId`)는 이 컴포넌트에서 관리하고 하위로 콜백 전달

#### 렌더 구조

```tsx
<DndContext onDragStart={...} onDragEnd={...}>
  <FilterBar filter={filter} onFilterChange={setFilter} />
  <div className="board-layout">
    {COLUMN_ORDER.map(status => (
      <BoardColumn
        key={status}
        status={status}
        tickets={filteredBoard[status]}
        onCardClick={(id) => setModalTicketId(id)}
        onAddClick={() => setIsCreateModalOpen(true)}
      />
    ))}
  </div>
  <DragOverlay>
    {activeTicketId && <TicketCard ticket={findTicket(activeTicketId)} isDragging />}
  </DragOverlay>
  {modalTicketId && (
    <TicketModal
      ticketId={modalTicketId}
      onClose={() => setModalTicketId(null)}
      onDelete={(id) => setDeleteTargetId(id)}
    />
  )}
  {isCreateModalOpen && (
    <TicketModal mode="create" onClose={() => setIsCreateModalOpen(false)} />
  )}
  {deleteTargetId && (
    <ConfirmDialog
      onConfirm={() => handleDelete(deleteTargetId)}
      onCancel={() => setDeleteTargetId(null)}
    />
  )}
</DndContext>
```

---

### `FilterBar`

**책임**: 이번 주 업무 / 만기일이 지난 업무 필터 버튼 렌더링 및 토글.

#### Props

```typescript
type FilterBarProps = {
  filter: 'THIS_WEEK' | 'OVERDUE' | null;
  onFilterChange: (filter: 'THIS_WEEK' | 'OVERDUE' | null) => void;
};
```

#### 동작

- 버튼 클릭 시: 현재 `filter`와 같으면 `null`(해제), 다르면 해당 필터로 변경
- 활성 필터 버튼은 시각적으로 강조 (배경색 구분)
- 두 필터는 동시에 활성화되지 않음 (단일 선택)

| 버튼 | filter 값 | 필터 조건 |
|------|-----------|-----------|
| 이번 주 업무 | `'THIS_WEEK'` | `plannedStartDate` 또는 `dueDate`가 이번 주(월~일) 내 |
| 만기일이 지난 업무 | `'OVERDUE'` | `isOverdue === true` |

---

### `BoardColumn`

**책임**: 단일 칼럼 렌더링. 드롭 대상 역할, 칼럼 내 카드 목록 표시.

#### Props

```typescript
type BoardColumnProps = {
  status: TicketStatus;
  tickets: Ticket[];
  onCardClick: (id: number) => void;
  onAddClick?: () => void;   // BACKLOG 칼럼에서만 표시
};
```

#### 동작

- `useDroppable({ id: status })`로 칼럼 자체를 드롭 존으로 등록 (빈 칼럼에 카드 드롭 지원)
- `SortableContext`로 칼럼 내 카드 목록 감싸기 (`verticalListSortingStrategy`)
- 카드가 없을 때 드롭 가능 영역 최소 높이 유지 (빈 칼럼 드롭 UX)
- DONE 칼럼은 `onAddClick` 버튼 미표시

---

### `ColumnHeader`

**책임**: 칼럼 제목과 카드 수 뱃지 표시.

#### Props

```typescript
type ColumnHeaderProps = {
  status: TicketStatus;
  count: number;
};
```

| status | 표시 이름 |
|--------|-----------|
| `BACKLOG` | Backlog |
| `TODO` | TODO |
| `IN_PROGRESS` | In Progress |
| `DONE` | Done |

---

### `TicketCard`

**책임**: 단일 티켓 카드 렌더링. 드래그 가능한 항목.

#### Props

```typescript
type TicketCardProps = {
  ticket: Ticket;
  onClick: () => void;
  isDragging?: boolean;    // DragOverlay에서 사용 시 true
};
```

#### 표시 요소

| 요소 | 조건 | 설명 |
|------|------|------|
| 제목 | 항상 | 최대 2줄, 초과 시 말줄임(`line-clamp-2`) |
| `PriorityBadge` | 항상 | 우선순위 색상 뱃지 |
| 계획종료일 | `dueDate` 있을 때 | `YYYY-MM-DD` 형식 |
| ⚠ 오버듀 경고 | `isOverdue === true` | 아이콘 + 텍스트, 카드 테두리 강조 |
| 완료 체크 | `status === 'DONE'` | 완료 표시 아이콘 |

#### 동작

- `useSortable({ id: ticket.id })`로 드래그 핸들 및 transform 스타일 적용
- `isDragging`이 `true`면 원본 카드 자리는 반투명 placeholder로 표시
- 클릭 이벤트는 드래그와 충돌 방지: `distance: 5` 이상 이동 시에만 드래그 시작

---

### `PriorityBadge`

**책임**: 우선순위 값을 색상 뱃지로 표시.

#### Props

```typescript
type PriorityBadgeProps = {
  priority: TicketPriority;
};
```

| priority | 색상 | 텍스트 |
|----------|------|--------|
| `LOW` | 회색 | Low |
| `MEDIUM` | 파란색 | Medium |
| `HIGH` | 빨간색 | High |

---

### `TicketModal`

**책임**: 티켓 상세 조회·수정 또는 신규 생성 모달 오버레이.

#### Props

```typescript
type TicketModalProps =
  | { mode?: 'edit'; ticketId: number; onClose: () => void; onDelete: (id: number) => void; }
  | { mode: 'create'; onClose: () => void; };
```

#### 상태

| 상태 | 타입 | 설명 |
|------|------|------|
| `ticket` | `Ticket \| null` | 조회된 티켓 데이터 (edit 모드) |
| `isLoading` | `boolean` | 데이터 로딩 중 여부 |
| `isEditing` | `boolean` | 편집 모드 활성 여부 |

#### 동작

- **edit 모드**: 마운트 시 `GET /api/tickets/:id` 호출하여 최신 데이터 조회
- **create 모드**: 빈 `TicketForm` 표시
- 배경(오버레이) 클릭 또는 ESC 키 입력 시 `onClose` 호출
- 수정 저장 성공 시 부모 보드 상태 갱신 후 모달 유지 (편집 모드 종료)
- 삭제 버튼은 edit 모드에서만 표시, 클릭 시 `onDelete(ticketId)` 호출 (ConfirmDialog 진입)

---

### `TicketForm`

**책임**: 티켓 생성·수정 공용 폼. 필드 입력 및 클라이언트 Zod 검증.

#### Props

```typescript
type TicketFormProps = {
  initialValues?: Partial<Ticket>;
  onSubmit: (data: CreateTicketInput | UpdateTicketInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
};
```

#### 필드

| 필드 | 입력 컴포넌트 | 검증 |
|------|-------------|------|
| `title` | `<input type="text">` | 필수, 1~200자, 공백만 불가 |
| `description` | `<textarea>` | 선택, 최대 1000자 |
| `priority` | `<select>` | LOW / MEDIUM / HIGH |
| `plannedStartDate` | `<input type="date">` | 선택 |
| `dueDate` | `<input type="date">` | 선택, 오늘 이후 |

#### 동작

- 제출 전 `createTicketSchema` 또는 `updateTicketSchema`(Zod)로 클라이언트 검증
- 검증 실패 시 해당 필드 아래 에러 메시지 인라인 표시
- `isSubmitting`이 `true`면 제출 버튼 비활성화 및 로딩 스피너 표시
- 취소 시 폼 초기화 없이 `onCancel` 호출

---

### `ConfirmDialog`

**책임**: 삭제 확인 다이얼로그. 사용자가 확인 또는 취소를 선택한다.

#### Props

```typescript
type ConfirmDialogProps = {
  message?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};
```

#### 기본값

| prop | 기본값 |
|------|--------|
| `message` | `"티켓을 삭제하면 복구할 수 없습니다. 삭제하시겠습니까?"` |
| `confirmLabel` | `"삭제"` |

#### 동작

- ESC 키 → `onCancel`
- 배경(오버레이) 클릭 → `onCancel`
- 확인 버튼은 삭제임을 명시하는 강조 색상(빨간색) 사용

---

## 4. 커스텀 훅 명세

### `useBoard(initialData: BoardData)`

**책임**: 보드 데이터 상태와 모든 티켓 CRUD 액션을 제공한다.

#### 반환값

```typescript
type UseBoardReturn = {
  board: BoardData;
  setBoard: Dispatch<SetStateAction<BoardData>>;
  createTicket: (data: CreateTicketInput) => Promise<void>;
  updateTicket: (id: number, data: UpdateTicketInput) => Promise<void>;
  deleteTicket: (id: number) => Promise<void>;
  completeTicket: (id: number) => Promise<void>;
};
```

#### 동작

- `board`는 `useState<BoardData>(initialData)`로 초기화
- 각 액션은 `ticketApi.ts`를 호출하고 응답으로 `board` 상태를 갱신
- 생성: 응답 티켓을 `board.backlog` 맨 앞에 추가
- 수정: 해당 칼럼에서 id로 찾아 교체
- 삭제: 해당 칼럼에서 id 제거
- 완료: `completeTicket` 응답 기반으로 칼럼 간 이동 처리
- API 실패 시 `board` 상태 롤백하지 않음 (CRUD는 낙관적 업데이트 미적용, 응답 기반 갱신)

---

### `useDragAndDrop(board: BoardData, setBoard: Dispatch<...>)`

**책임**: @dnd-kit DnD 이벤트 처리, 낙관적 업데이트, 실패 시 롤백.

#### 반환값

```typescript
type UseDragAndDropReturn = {
  activeTicketId: number | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
};
```

#### 동작

```
handleDragStart:
  activeTicketId = event.active.id

handleDragEnd:
  1. 스냅샷: 이전 board 저장
  2. 낙관적 업데이트: board 상태에서 카드 이동 (칼럼 간 또는 칼럼 내 재정렬)
  3. DONE 칼럼 드롭 감지:
     → completeTicket(id) 호출
  4. 그 외 칼럼 드롭:
     → position 계산 (인접 카드의 position 기반)
     → reorderTicket({ ticketId, status, position }) 호출
  5. API 실패 시:
     → 스냅샷으로 board 복원 (롤백)
     → 에러 토스트 표시
  6. activeTicketId = null
```

#### position 계산 (클라이언트)

| 삽입 위치 | position |
|-----------|----------|
| 칼럼이 비어 있음 | `0` |
| 맨 앞 | `첫 번째 position - 1024` |
| 두 카드 사이 | `(prev.position + next.position) / 2` |
| 맨 뒤 | `마지막 position + 1024` |

> 최종 position 정규화(간격 < 1 시 재정렬)는 서버에서 처리한다.

---

### `useTicketFilter(board: BoardData, filter: FilterType | null)`

**책임**: 활성 필터 기준으로 보드 데이터를 파생 계산한다.

#### 반환값

```typescript
type UseTicketFilterReturn = {
  filteredBoard: BoardData;
};
```

#### 필터 조건

```typescript
// THIS_WEEK: plannedStartDate 또는 dueDate가 이번 주 월~일 내
const isThisWeek = (ticket: Ticket): boolean => {
  const { start, end } = getThisWeekRange(); // 월요일 ~ 일요일
  return (
    (ticket.plannedStartDate !== null && ticket.plannedStartDate >= start && ticket.plannedStartDate <= end) ||
    (ticket.dueDate !== null && ticket.dueDate >= start && ticket.dueDate <= end)
  );
};

// OVERDUE: dueDate < 오늘 AND status !== DONE
const isOverdue = (ticket: Ticket): boolean => ticket.isOverdue;
```

- `filter === null`이면 `filteredBoard = board` (필터 없음)
- 필터는 모든 칼럼에 동일하게 적용

---

## 5. 드래그앤드롭 구현 전략

### @dnd-kit 구성 요소 역할

| 구성 요소 | 적용 위치 | 역할 |
|-----------|-----------|------|
| `DndContext` | `KanbanBoard` | DnD 이벤트 루트, `onDragStart`/`onDragEnd` 수신 |
| `SortableContext` | `BoardColumn` | 칼럼 내 카드 순서 관리, `verticalListSortingStrategy` |
| `useSortable` | `TicketCard` | 카드를 드래그 가능한 항목으로 등록 |
| `useDroppable` | `BoardColumn` | 빈 칼럼에 드롭 가능하도록 칼럼 자체 등록 |
| `DragOverlay` | `KanbanBoard` | 드래그 중 카드 시각적 미리보기 (포탈 렌더링) |

### 칼럼 간 이동 감지

```
onDragEnd에서 대상 감지:
  over.data.current?.type === 'column'  →  빈 칼럼에 드롭
  over.data.current?.sortable.containerId  →  카드 위에 드롭 (해당 칼럼 식별)
```

### DONE 칼럼 처리

- DONE 칼럼은 `PATCH /api/tickets/reorder`가 아닌 `PATCH /api/tickets/:id/complete`를 사용
- `handleDragEnd`에서 `targetStatus === 'DONE'`이면 분기하여 `completeTicket` 호출
- DONE에서 다른 칼럼으로 이동 시에도 `completeTicket` 호출 (서버에서 `completedAt = null` 처리)

### 드래그 활성화 임계값

```typescript
// 클릭과 드래그 충돌 방지
const sensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  useSensor(KeyboardSensor)  // 키보드 접근성 지원
);
```

- 5px 이상 이동 시에만 드래그 시작 → 카드 클릭(모달 열기)과 분리
- `KeyboardSensor`로 키보드 드래그 지원 (접근성 NFR-003)

### 낙관적 업데이트 흐름

```
onDragEnd
  ├─ 이전 board 스냅샷 저장
  ├─ board 상태 즉시 업데이트 (UI 반영)
  └─ API 호출
       ├─ 성공 → 스냅샷 폐기
       └─ 실패 → 스냅샷으로 board 복원 + 에러 토스트
```

### 드래그 중 UX

- 원본 위치: 반투명 placeholder 카드 표시
- 드래그 중 카드: `DragOverlay`로 포탈 렌더링 (z-index 최상위, 그림자 강조)
- 드롭 가능한 칼럼 위에 올라올 때: 칼럼 배경색 강조 (`isOver` 상태 활용)
