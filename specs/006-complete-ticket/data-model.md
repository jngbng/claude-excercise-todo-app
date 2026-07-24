# Data Model: 티켓 완료 처리 (PATCH /api/tickets/:id/complete)

## 상태 전이

| 호출 시 현재 상태 | 결과 상태 | `completedAt` |
|--------------------|-----------|----------------|
| `DONE` 이외 (BACKLOG/TODO/IN_PROGRESS) | `DONE` | 현재 시각 기록 |
| `DONE` | `IN_PROGRESS` | `null`로 초기화 |

`status`, `completedAt` 외의 필드는 변경되지 않는다. `updatedAt`은 Drizzle의 `$onUpdate`로
자동 갱신된다.

## 404 조건

- `id`에 해당하는 티켓이 존재하지 않음
