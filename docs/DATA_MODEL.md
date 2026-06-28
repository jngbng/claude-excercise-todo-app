# DATA_MODEL - Tika (Data Model Document)

> 최종 수정: 2026-06-28
> 버전: 1.0 (MVP)

---

## 1. 설계 원칙

- MVP는 단일 사용자를 가정하므로 `tickets` 단일 테이블로 구성한다
- 사용자(users) 테이블, 외래 키, 인증 관련 컬럼은 2차 스펙에서 추가한다
- `isOverdue`는 DB에 저장하지 않고 조회 시 계산하는 파생 필드다
- 날짜(`plannedStartDate`, `dueDate`)는 날짜만 저장(`date` 타입), 시각 정보는 불필요
- 타임스탬프(`startedAt`, `completedAt`, `createdAt`, `updatedAt`)는 UTC로 저장한다

---

## 2. 테이블 정의

### `tickets`

| 컬럼명 | 타입 | Null | 기본값 | 설명 |
|--------|------|------|--------|------|
| `id` | `serial` | NOT NULL | auto | PK, 자동 증가 |
| `title` | `varchar(200)` | NOT NULL | — | 티켓 제목 (1~200자) |
| `description` | `text` | NULL | `null` | 티켓 설명 (최대 1000자) |
| `status` | `varchar(20)` | NOT NULL | `'BACKLOG'` | 칸반 상태 (아래 enum 참고) |
| `priority` | `varchar(10)` | NOT NULL | `'MEDIUM'` | 우선순위 (아래 enum 참고) |
| `position` | `integer` | NOT NULL | — | 칼럼 내 정렬 순서 (오름차순) |
| `planned_start_date` | `date` | NULL | `null` | 계획시작일 |
| `due_date` | `date` | NULL | `null` | 계획종료일 |
| `started_at` | `timestamp` | NULL | `null` | 실제 시작일시 (TODO 이동 시 자동 기록) |
| `completed_at` | `timestamp` | NULL | `null` | 실제 종료일시 (DONE 이동 시 자동 기록) |
| `created_at` | `timestamp` | NOT NULL | `now()` | 생성일시 (자동) |
| `updated_at` | `timestamp` | NOT NULL | `now()` | 최종 수정일시 (자동) |

---

## 3. Enum 정의

### `status` 허용 값

```typescript
const TICKET_STATUS = {
  BACKLOG:     'BACKLOG',
  TODO:        'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE:        'DONE',
} as const;

type TicketStatus = typeof TICKET_STATUS[keyof typeof TICKET_STATUS];
```

| 값 | 설명 |
|----|------|
| `BACKLOG` | 대기 중 (기본값) |
| `TODO` | 이번에 할 일 |
| `IN_PROGRESS` | 진행 중 |
| `DONE` | 완료 |

### `priority` 허용 값

```typescript
const TICKET_PRIORITY = {
  LOW:    'LOW',
  MEDIUM: 'MEDIUM',
  HIGH:   'HIGH',
} as const;

type TicketPriority = typeof TICKET_PRIORITY[keyof typeof TICKET_PRIORITY];
```

| 값 | 설명 | UI 색상 |
|----|------|---------|
| `LOW` | 낮음 | 회색 |
| `MEDIUM` | 보통 (기본값) | 파란색 |
| `HIGH` | 높음 | 빨간색 |

---

## 4. 컬럼 상세 규칙

### `position`

칼럼 내 카드 순서를 나타내는 정수 값. 오름차순으로 정렬된다.

| 상황 | position 계산 방식 |
|------|-------------------|
| 칼럼이 비어 있을 때 생성 | `0` |
| 칼럼 맨 위에 삽입 | `첫 번째 카드의 position - 1024` |
| 두 카드 사이에 삽입 | `(prev.position + next.position) / 2` |
| 칼럼 맨 아래에 삽입 | `마지막 카드의 position + 1024` |
| 간격이 1 미만일 때 | 해당 칼럼 전체를 1024 간격으로 재정렬 |

> 새 티켓 생성 시 해당 칼럼(BACKLOG) 맨 위에 배치한다 (`첫 번째 position - 1024`).

### `startedAt`

| 이벤트 | startedAt 처리 |
|--------|----------------|
| 어느 칼럼에서든 → `TODO` 이동 | `NOW()` 기록 |
| `TODO` → `BACKLOG` 이동 | `null` 초기화 |
| 그 외 칼럼 간 이동 | 변경 없음 |

### `completedAt`

| 이벤트 | completedAt 처리 |
|--------|-----------------|
| 어느 칼럼에서든 → `DONE` 이동 | `NOW()` 기록 |
| `DONE` → 다른 칼럼 이동 | `null` 초기화 |

> Done 칼럼에는 `completedAt` 기준 **24시간 이내** 티켓만 표시한다 (조회 시 필터링).

### `dueDate`

- 생성·수정 시 오늘 이후 날짜만 허용 (서버·클라이언트 양쪽 Zod 검증)
- `null` 전송 시 삭제

---

## 5. 파생 필드 (DB 미저장)

### `isOverdue`

DB에 저장하지 않고 조회 시 계산한다.

```typescript
const isOverdue = (ticket: Ticket): boolean =>
  ticket.dueDate !== null &&
  ticket.dueDate < today() &&
  ticket.status !== 'DONE';
```

| 조건 | isOverdue |
|------|-----------|
| `dueDate`가 없음 | `false` |
| `dueDate < 오늘` AND `status ≠ DONE` | `true` |
| 그 외 | `false` |

---

## 6. Drizzle ORM 스키마

```typescript
// src/server/db/schema.ts
import { pgTable, serial, varchar, text, integer, date, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const tickets = pgTable('tickets', {
  id:               serial('id').primaryKey(),
  title:            varchar('title', { length: 200 }).notNull(),
  description:      text('description'),
  status:           varchar('status', { length: 20 }).notNull().default('BACKLOG'),
  priority:         varchar('priority', { length: 10 }).notNull().default('MEDIUM'),
  position:         integer('position').notNull(),
  plannedStartDate: date('planned_start_date'),
  dueDate:          date('due_date'),
  startedAt:        timestamp('started_at'),
  completedAt:      timestamp('completed_at'),
  createdAt:        timestamp('created_at').notNull().default(sql`now()`),
  updatedAt:        timestamp('updated_at').notNull().default(sql`now()`),
});

export type TicketRow    = typeof tickets.$inferSelect;
export type NewTicketRow = typeof tickets.$inferInsert;
```

---

## 7. 인덱스

| 인덱스 | 대상 컬럼 | 목적 |
|--------|-----------|------|
| PK | `id` | 단건 조회·수정·삭제 |
| `idx_tickets_status_position` | `(status, position)` | 보드 조회 시 칼럼별 정렬 |
| `idx_tickets_due_date` | `due_date` | 오버듀 판정 필터링 |

---

## 8. 공유 TypeScript 타입

```typescript
// src/shared/types/index.ts

export type Ticket = {
  id:               number;
  title:            string;
  description:      string | null;
  status:           TicketStatus;
  priority:         TicketPriority;
  position:         number;
  plannedStartDate: string | null;  // 'YYYY-MM-DD'
  dueDate:          string | null;  // 'YYYY-MM-DD'
  startedAt:        string | null;  // ISO 8601
  completedAt:      string | null;  // ISO 8601
  createdAt:        string;         // ISO 8601
  updatedAt:        string;         // ISO 8601
  isOverdue:        boolean;        // 파생 필드
};

export type BoardData = {
  backlog:    Ticket[];
  todo:       Ticket[];
  inProgress: Ticket[];
  done:       Ticket[];
};
```

---

## 9. 2차 스펙 확장 계획

MVP 이후 멀티 사용자를 지원할 때 추가될 구조 (현재는 미구현).

```
users 테이블 추가
  └─ tickets.userId (FK → users.id) 컬럼 추가
```

> 현재 `tickets` 테이블에 `userId`를 추가하면 마이그레이션으로 확장 가능하도록 설계되어 있다.
