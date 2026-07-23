# Contract: `PATCH /api/tickets/:id`

**출처**: `docs/API_SPECS.md` (PATCH `/api/tickets/:id` 섹션)

## Request

```typescript
type UpdateTicketRequest = {
  title?: string;
  description?: string | null;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  plannedStartDate?: string | null;
  dueDate?: string | null;
};
```

전송된 필드만 갱신한다.

## Response

- `200 OK`: 수정된 Ticket 전체 객체
- `400 Bad Request`: `VALIDATION_ERROR`
- `404 Not Found`: `NOT_FOUND`

## 구현 매핑

| 계층 | 파일 |
|------|------|
| Route Handler | `app/api/tickets/[id]/route.ts` (`PATCH`) |
| 요청 검증 (Zod) | `src/shared/validations/ticket.ts` (`updateTicketSchema`) |
| 비즈니스 로직 | `src/server/services/ticketService.ts` (`update`) |
