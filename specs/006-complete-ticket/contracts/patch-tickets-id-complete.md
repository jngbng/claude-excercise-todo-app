# Contract: `PATCH /api/tickets/:id/complete`

**출처**: `docs/API_SPECS.md` (PATCH `/api/tickets/:id/complete` 섹션)

## Request

Body 없음.

## 처리 규칙

| 현재 상태 | 결과 |
|-----------|------|
| `DONE` 이외 | `status = DONE`, `completedAt = now()` |
| `DONE` | `status = IN_PROGRESS`, `completedAt = null` |

## Response

- `200 OK`: 수정된 Ticket 전체 객체
- `404 Not Found`: `{ error: { code: 'NOT_FOUND', message: '티켓을 찾을 수 없습니다' } }`

## 구현 매핑

| 계층 | 파일 |
|------|------|
| Route Handler | `app/api/tickets/[id]/complete/route.ts` (`PATCH`) |
| 비즈니스 로직 | `src/server/services/ticketService.ts` (`complete`) |
