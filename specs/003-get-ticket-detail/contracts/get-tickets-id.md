# Contract: `GET /api/tickets/:id`

**출처**: `docs/API_SPECS.md` (GET `/api/tickets/:id` 섹션)

## Request

| 위치 | 파라미터 | 타입 |
|------|----------|------|
| Path | `id` | `number` |

## Response

- `200 OK`: Ticket 전체 객체 (구조는 `specs/001-create-ticket/contracts/post-tickets.md` 참고)
- `404 Not Found`: `{ error: { code: 'NOT_FOUND', message: '티켓을 찾을 수 없습니다' } }`

## 구현 매핑

| 계층 | 파일 |
|------|------|
| Route Handler | `app/api/tickets/[id]/route.ts` (`GET`) |
| 비즈니스 로직 | `src/server/services/ticketService.ts` (`getById`) |
