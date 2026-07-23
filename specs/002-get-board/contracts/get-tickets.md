# Contract: `GET /api/tickets`

**출처**: `docs/API_SPECS.md` (GET `/api/tickets` 섹션)

## Request

파라미터 없음.

## Response `200 OK`

```typescript
type BoardResponse = {
  backlog: Ticket[];
  todo: Ticket[];
  inProgress: Ticket[];
  done: Ticket[]; // completedAt이 24시간 이내인 것만 포함
};
```

각 배열은 `position` 오름차순. `Ticket` 구조는
`specs/001-create-ticket/contracts/post-tickets.md` 참고.

```json
{
  "backlog": [],
  "todo": [],
  "inProgress": [],
  "done": []
}
```

## 구현 매핑

| 계층 | 파일 |
|------|------|
| Route Handler | `app/api/tickets/route.ts` (`GET`) |
| 비즈니스 로직 | `src/server/services/ticketService.ts` (`getBoard`) |
