# Contract: `DELETE /api/tickets/:id`

**출처**: `docs/API_SPECS.md` (DELETE `/api/tickets/:id` 섹션)

## Request

| 위치 | 파라미터 | 타입 |
|------|----------|------|
| Path | `id` | `number` |

## Response

- `204 No Content`: 본문 없음
- `404 Not Found`: `{ error: { code: 'NOT_FOUND', message: '티켓을 찾을 수 없습니다' } }`

## 구현 매핑

| 계층 | 파일 |
|------|------|
| Route Handler | `app/api/tickets/[id]/route.ts` (`DELETE`) |
| 비즈니스 로직 | `src/server/services/ticketService.ts` (`remove`) |
