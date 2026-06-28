# API_SPECS - Tika (API Specification)

> 최종 수정: 2026-06-28
> 버전: 1.0 (MVP)

---

## 1. 엔드포인트 목록

| 메서드 | URL | 설명 | FR |
|--------|-----|------|----|
| `GET` | `/api/tickets` | 보드 전체 티켓 조회 (칼럼별 그룹화) | FR-002 |
| `POST` | `/api/tickets` | 티켓 생성 | FR-001 |
| `GET` | `/api/tickets/:id` | 티켓 단건 조회 | FR-003 |
| `PATCH` | `/api/tickets/:id` | 티켓 수정 | FR-004 |
| `DELETE` | `/api/tickets/:id` | 티켓 삭제 | FR-006 |
| `PATCH` | `/api/tickets/:id/complete` | 티켓 완료 처리 | FR-005 |
| `PATCH` | `/api/tickets/reorder` | 티켓 순서/상태 변경 (드래그앤드롭) | FR-007 |

---

## 2. 공통 규칙

### 요청

- `Content-Type: application/json`
- 날짜 형식: `YYYY-MM-DD` (예: `"2026-06-28"`)
- 타임스탬프 형식: ISO 8601 UTC (예: `"2026-06-28T09:00:00.000Z"`)
- 필드 삭제: 해당 필드에 `null` 전송

### 성공 응답

- 단건: 티켓 객체 반환
- 목록: 칼럼별 그룹 객체 반환
- 삭제: 본문 없음 (`204 No Content`)

### 에러 응답 형식

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "제목을 입력해주세요"
  }
}
```

| code | 설명 |
|------|------|
| `VALIDATION_ERROR` | 요청 필드 검증 실패 |
| `NOT_FOUND` | 리소스 없음 |
| `INTERNAL_ERROR` | 서버 내부 오류 |

### HTTP 상태 코드

| 코드 | 용도 |
|------|------|
| `200` | 조회·수정 성공 |
| `201` | 생성 성공 |
| `204` | 삭제 성공 (본문 없음) |
| `400` | 요청 검증 실패 |
| `404` | 리소스 없음 |
| `500` | 서버 내부 오류 |

### Ticket 객체 공통 구조

모든 엔드포인트의 티켓 응답은 아래 구조를 따른다.

```typescript
type Ticket = {
  id:               number;
  title:            string;
  description:      string | null;
  status:           'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority:         'LOW' | 'MEDIUM' | 'HIGH';
  position:         number;
  plannedStartDate: string | null;  // 'YYYY-MM-DD'
  dueDate:          string | null;  // 'YYYY-MM-DD'
  startedAt:        string | null;  // ISO 8601
  completedAt:      string | null;  // ISO 8601
  createdAt:        string;         // ISO 8601
  updatedAt:        string;         // ISO 8601
  isOverdue:        boolean;        // 파생 필드 (DB 미저장)
}
```

---

## 3. 엔드포인트 상세

### GET `/api/tickets`

보드에 표시할 전체 티켓을 칼럼별로 그룹화하여 반환한다. 각 칼럼은 `position` 오름차순으로 정렬된다. `isOverdue`는 조회 시 계산되는 파생 필드다.

**관련 FR**: FR-002, FR-008

#### 요청

파라미터 없음.

#### 응답 `200 OK`

```json
{
  "backlog": [
    {
      "id": 1,
      "title": "로그인 페이지 디자인",
      "description": null,
      "status": "BACKLOG",
      "priority": "HIGH",
      "position": -1024,
      "plannedStartDate": null,
      "dueDate": "2026-07-10",
      "startedAt": null,
      "completedAt": null,
      "createdAt": "2026-06-28T09:00:00.000Z",
      "updatedAt": "2026-06-28T09:00:00.000Z",
      "isOverdue": false
    }
  ],
  "todo": [],
  "inProgress": [],
  "done": []
}
```

---

### POST `/api/tickets`

새 티켓을 생성하여 `BACKLOG` 칼럼 맨 위에 배치한다.

**관련 FR**: FR-001

#### 요청 Body

```json
{
  "title": "로그인 페이지 디자인",
  "description": "OAuth 소셜 로그인 포함",
  "priority": "HIGH",
  "plannedStartDate": "2026-07-01",
  "dueDate": "2026-07-10"
}
```

| 필드 | 타입 | 필수 | 제약 | 기본값 | 설명 |
|------|------|------|------|--------|------|
| `title` | `string` | ✅ | 1~200자, 공백만 불가 | — | 티켓 제목 |
| `description` | `string` | ❌ | 최대 1000자 | `null` | 티켓 설명 |
| `priority` | `'LOW' \| 'MEDIUM' \| 'HIGH'` | ❌ | — | `'MEDIUM'` | 우선순위 |
| `plannedStartDate` | `string` | ❌ | `YYYY-MM-DD` | `null` | 계획시작일 |
| `dueDate` | `string` | ❌ | `YYYY-MM-DD`, 오늘 이후 | `null` | 계획종료일 |

#### 처리 규칙

- `status`는 항상 `BACKLOG`로 고정
- `position`: BACKLOG 칼럼 최솟값 - 1024 (칼럼이 비어 있으면 `0`)
- `createdAt`, `updatedAt` 자동 설정

#### 응답 `201 Created`

생성된 티켓 전체 객체 반환.

```json
{
  "id": 1,
  "title": "로그인 페이지 디자인",
  "description": "OAuth 소셜 로그인 포함",
  "status": "BACKLOG",
  "priority": "HIGH",
  "position": -1024,
  "plannedStartDate": "2026-07-01",
  "dueDate": "2026-07-10",
  "startedAt": null,
  "completedAt": null,
  "createdAt": "2026-06-28T09:00:00.000Z",
  "updatedAt": "2026-06-28T09:00:00.000Z",
  "isOverdue": false
}
```

#### 에러 응답

| 상태 | code | 조건 | message |
|------|------|------|---------|
| `400` | `VALIDATION_ERROR` | 제목 누락 또는 공백만 입력 | `"제목을 입력해주세요"` |
| `400` | `VALIDATION_ERROR` | 제목 200자 초과 | `"제목은 200자 이내로 입력해주세요"` |
| `400` | `VALIDATION_ERROR` | 설명 1000자 초과 | `"설명은 1000자 이내로 입력해주세요"` |
| `400` | `VALIDATION_ERROR` | 잘못된 priority 값 | `"우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요"` |
| `400` | `VALIDATION_ERROR` | dueDate가 오늘 이전 | `"종료예정일은 오늘 이후 날짜를 선택해주세요"` |

---

### GET `/api/tickets/:id`

단일 티켓의 전체 정보를 반환한다.

**관련 FR**: FR-003

#### 요청

| 위치 | 파라미터 | 타입 | 설명 |
|------|----------|------|------|
| Path | `id` | `number` | 티켓 ID |

#### 응답 `200 OK`

티켓 전체 객체 반환 (Ticket 공통 구조 참고).

#### 에러 응답

| 상태 | code | 조건 |
|------|------|------|
| `404` | `NOT_FOUND` | 존재하지 않는 ID |

---

### PATCH `/api/tickets/:id`

티켓의 내용을 부분 수정한다. 전송된 필드만 업데이트된다.

**관련 FR**: FR-004

#### 요청

| 위치 | 파라미터 | 타입 | 설명 |
|------|----------|------|------|
| Path | `id` | `number` | 티켓 ID |

**Body**

```json
{
  "title": "로그인 페이지 디자인 (수정)",
  "description": null,
  "priority": "MEDIUM",
  "plannedStartDate": null,
  "dueDate": "2026-07-15"
}
```

| 필드 | 타입 | 필수 | 제약 | 기본값 | 설명 |
|------|------|------|------|--------|------|
| `title` | `string` | ❌ | 1~200자, 공백만 불가 | — | 티켓 제목 (전송 시 업데이트) |
| `description` | `string \| null` | ❌ | 최대 1000자 | — | 티켓 설명 (`null` 전송 시 삭제) |
| `priority` | `'LOW' \| 'MEDIUM' \| 'HIGH'` | ❌ | — | — | 우선순위 (전송 시 업데이트) |
| `plannedStartDate` | `string \| null` | ❌ | `YYYY-MM-DD` | — | 계획시작일 (`null` 전송 시 삭제) |
| `dueDate` | `string \| null` | ❌ | `YYYY-MM-DD`, 오늘 이후 | — | 계획종료일 (`null` 전송 시 삭제) |

#### 처리 규칙

- 전송된 필드만 업데이트 (나머지 유지)
- `updatedAt` 자동 갱신

#### 응답 `200 OK`

수정된 티켓 전체 객체 반환.

#### 에러 응답

| 상태 | code | 조건 | message |
|------|------|------|---------|
| `400` | `VALIDATION_ERROR` | 제목 200자 초과 | `"제목은 200자 이내로 입력해주세요"` |
| `400` | `VALIDATION_ERROR` | 설명 1000자 초과 | `"설명은 1000자 이내로 입력해주세요"` |
| `400` | `VALIDATION_ERROR` | 잘못된 priority 값 | `"우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요"` |
| `400` | `VALIDATION_ERROR` | dueDate가 오늘 이전 | `"종료예정일은 오늘 이후 날짜를 선택해주세요"` |
| `404` | `NOT_FOUND` | 존재하지 않는 ID | — |

---

### DELETE `/api/tickets/:id`

티켓을 영구 삭제한다 (복구 불가).

**관련 FR**: FR-006

#### 요청

| 위치 | 파라미터 | 타입 | 설명 |
|------|----------|------|------|
| Path | `id` | `number` | 티켓 ID |

#### 응답 `204 No Content`

본문 없음.

#### 에러 응답

| 상태 | code | 조건 |
|------|------|------|
| `404` | `NOT_FOUND` | 존재하지 않는 ID |

---

### PATCH `/api/tickets/:id/complete`

티켓을 `DONE` 상태로 완료 처리하거나 `DONE`에서 다른 상태로 복귀시킨다.

**관련 FR**: FR-005

#### 요청

| 위치 | 파라미터 | 타입 | 설명 |
|------|----------|------|------|
| Path | `id` | `number` | 티켓 ID |

Body 없음.

#### 처리 규칙

| 현재 상태 | 호출 결과 |
|-----------|-----------|
| `DONE` 이외 | `status = DONE`, `completed_at = NOW()` |
| `DONE` | `status = IN_PROGRESS`, `completed_at = null` |

> Done 칼럼에는 `completed_at` 기준 24시간 이내 티켓만 표시된다 (조회 시 필터링).

#### 응답 `200 OK`

업데이트된 티켓 전체 객체 반환.

```json
{
  "id": 1,
  "title": "로그인 페이지 디자인",
  "status": "DONE",
  "completedAt": "2026-06-28T11:30:00.000Z",
  "isOverdue": false,
  "...": "..."
}
```

#### 에러 응답

| 상태 | code | 조건 |
|------|------|------|
| `404` | `NOT_FOUND` | 존재하지 않는 ID |

---

### PATCH `/api/tickets/reorder`

티켓을 다른 칼럼으로 이동하거나 같은 칼럼 내 순서를 변경한다. `DONE` 이동은 이 엔드포인트에서 허용하지 않는다.

**관련 FR**: FR-007

#### 요청 Body

```json
{
  "ticketId": 1,
  "status": "IN_PROGRESS",
  "position": 512
}
```

| 필드 | 타입 | 필수 | 제약 | 기본값 | 설명 |
|------|------|------|------|--------|------|
| `ticketId` | `number` | ✅ | 존재하는 티켓 ID | — | 이동할 티켓 ID |
| `status` | `'BACKLOG' \| 'TODO' \| 'IN_PROGRESS'` | ✅ | `DONE` 불가 | — | 이동 대상 칼럼 |
| `position` | `number` | ✅ | 정수 | — | 칼럼 내 새 위치 (클라이언트가 계산하여 전송) |

#### 처리 규칙

**position 재계산** (서버에서 처리)

| 삽입 위치 | position 계산 |
|-----------|--------------|
| 칼럼이 비어 있음 | `0` |
| 맨 앞 삽입 | `첫 번째 position - 1024` |
| 두 카드 사이 | `(prev.position + next.position) / 2` |
| 맨 뒤 삽입 | `마지막 position + 1024` |
| 간격 < 1 | 칼럼 전체를 1024 간격으로 재정렬 |

**자동 날짜 처리**

| 이동 경로 | 처리 |
|-----------|------|
| 어느 칼럼 → `TODO` | `started_at = NOW()` |
| `TODO` → `BACKLOG` | `started_at = null` |
| 그 외 이동 | 변경 없음 |

- `status`, `position`, `updated_at` 동시 업데이트
- 트랜잭션으로 원자성 보장

#### 응답 `200 OK`

업데이트된 티켓 전체 객체 반환.

```json
{
  "id": 1,
  "title": "로그인 페이지 디자인",
  "status": "IN_PROGRESS",
  "position": 512,
  "startedAt": "2026-06-28T10:00:00.000Z",
  "isOverdue": false,
  "...": "..."
}
```

#### 에러 응답

| 상태 | code | 조건 | message |
|------|------|------|---------|
| `400` | `VALIDATION_ERROR` | status가 `DONE` 이거나 허용되지 않는 값 | `"상태는 BACKLOG, TODO, IN_PROGRESS 중 선택해주세요"` |
| `404` | `NOT_FOUND` | 존재하지 않는 ticketId | `"티켓을 찾을 수 없습니다"` |
