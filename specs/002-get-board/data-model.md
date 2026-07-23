# Data Model: 칸반 보드 전체 조회 (GET /api/tickets)

`Ticket` 엔터티 전체 필드 정의는 `specs/001-create-ticket/data-model.md`를 따른다. 이 기능은
새 필드나 상태 전이를 추가하지 않고, 기존 `status`/`position`/`completedAt` 필드를 읽어
그룹화·정렬·필터링만 수행한다.

## 응답 구조

```typescript
type BoardData = {
  backlog: Ticket[];
  todo: Ticket[];
  inProgress: Ticket[];
  done: Ticket[]; // completedAt이 24시간 이내인 것만 포함
};
```

## 그룹화·필터링 규칙

| 단계 | 규칙 |
|------|------|
| 정렬 | 전체 티켓을 `position` 오름차순으로 조회 |
| 그룹화 | `status` 값에 따라 4개 배열 중 하나에 배치 |
| Done 필터 | `status === 'DONE'`인 티켓은 `completedAt`이 `null`이 아니고, 현재 시각과의 차이가
  24시간 이하일 때만 `done` 배열에 포함 |

이 기능은 읽기 전용이며, 위 규칙을 적용한 결과 외에 어떤 필드도 변경하지 않는다.
