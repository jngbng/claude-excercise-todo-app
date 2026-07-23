# Contract: `POST /api/tickets`

**출처**: `docs/API_SPECS.md` (POST `/api/tickets` 섹션) — 이 계약은 그 명세를 재진술한 것이며,
상충 시 `docs/API_SPECS.md`가 우선한다(헌장 원칙 II).

## Request

`Content-Type: application/json`

```typescript
type CreateTicketRequest = {
  title: string;                    // 필수, trim 후 1~200자
  description?: string | null;      // 선택, 최대 1000자
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'; // 선택, 기본값 MEDIUM
  plannedStartDate?: string | null; // 선택, 'YYYY-MM-DD'
  dueDate?: string | null;          // 선택, 'YYYY-MM-DD', 오늘 이후
};
```

## Response `201 Created`

생성된 Ticket 전체 객체 (data-model.md 참고).

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

## Response `400 Bad Request`

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "제목을 입력해주세요" } }
```

| 조건 | message |
|------|---------|
| title 누락 | "제목을 입력해주세요" |
| title 공백만 입력 | "제목을 입력해주세요" |
| title 200자 초과 | "제목은 200자 이내로 입력해주세요" |
| description 1000자 초과 | "설명은 1000자 이내로 입력해주세요" |
| 잘못된 priority 값 | "우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요" |
| dueDate가 오늘 이전 | "종료예정일은 오늘 이후 날짜를 선택해주세요" |

## Response `500 Internal Server Error`

```json
{ "error": { "code": "INTERNAL_ERROR", "message": "서버 오류가 발생했습니다" } }
```

## 구현 매핑

| 계층 | 파일 |
|------|------|
| Route Handler | `app/api/tickets/route.ts` (`POST`) |
| 요청 검증 (Zod) | `src/shared/validations/ticket.ts` (`createTicketSchema`) |
| 비즈니스 로직 | `src/server/services/ticketService.ts` (`create`) |
| DB 스키마 | `src/server/db/schema.ts` (`tickets`) |
| 공유 타입 | `src/shared/types/index.ts` (`Ticket`) |
