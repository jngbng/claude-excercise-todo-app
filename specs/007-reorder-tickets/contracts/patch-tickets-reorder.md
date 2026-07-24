# Contract: `PATCH /api/tickets/reorder`

**출처**: `docs/API_SPECS.md` (PATCH `/api/tickets/reorder` 섹션), `docs/TRD.md` (드래그앤드롭
흐름), 이 계획의 `research.md` "position 필드의 의미" 절

## Request

```typescript
type ReorderTicketRequest = {
  ticketId: number;
  status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS'; // DONE 불가
  position: number; // 대상 칼럼 내 0-based 삽입 인덱스 (ticketId 자신은 제외)
};
```

## 처리 규칙

- position 재계산 알고리즘: `data-model.md` 참고
- `status`가 `TODO`이면 `startedAt = now()`
- 이전 상태가 `TODO`이고 `status`가 `BACKLOG`이면 `startedAt = null`
- 그 외에는 `startedAt` 변경 없음
- 전체를 하나의 트랜잭션으로 처리

## Response

- `200 OK`: 수정된 Ticket 전체 객체
- `400 Bad Request`: `{ error: { code: 'VALIDATION_ERROR', message: '상태는 BACKLOG, TODO, IN_PROGRESS 중 선택해주세요' } }`
- `404 Not Found`: `{ error: { code: 'NOT_FOUND', message: '티켓을 찾을 수 없습니다' } }`

## 구현 매핑

| 계층 | 파일 |
|------|------|
| Route Handler | `app/api/tickets/reorder/route.ts` (`PATCH`) |
| 요청 검증 (Zod) | `src/shared/validations/ticket.ts` (`reorderTicketSchema`) |
| 비즈니스 로직 | `src/server/services/ticketService.ts` (`reorder`, 트랜잭션) |
