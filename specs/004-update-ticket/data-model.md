# Data Model: 티켓 수정 (PATCH /api/tickets/:id)

## 수정 가능 필드와 규칙

| 필드 | 미전송 시 | `null` 전송 시 | 값 전송 시 |
|------|-----------|----------------|------------|
| `title` | 유지 | (허용 안 됨 — 필수 문자열) | 1~200자, 공백만 불가 규칙으로 갱신 |
| `description` | 유지 | 삭제(`null`) | 최대 1000자 규칙으로 갱신 |
| `priority` | 유지 | (허용 안 됨) | LOW/MEDIUM/HIGH 중 하나로 갱신 |
| `plannedStartDate` | 유지 | 삭제(`null`) | `YYYY-MM-DD`로 갱신 |
| `dueDate` | 유지 | 삭제(`null`) | `YYYY-MM-DD`, 오늘 이후 규칙으로 갱신 |

`status`, `position`, `startedAt`, `completedAt`, `createdAt`은 이 기능의 수정 대상이 아니다.
`updatedAt`은 Drizzle의 `$onUpdate`로 자동 갱신된다.

## 검증 실패 조건 (400 VALIDATION_ERROR)

- `title` 200자 초과
- `description` 1000자 초과
- 정의되지 않은 `priority` 값
- `dueDate`가 오늘 이전

## 404 조건

- `id`에 해당하는 티켓이 존재하지 않음
