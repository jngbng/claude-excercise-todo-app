# Quickstart: 드래그앤드롭 상태·순서 변경 검증

계약은 [contracts/patch-tickets-reorder.md](./contracts/patch-tickets-reorder.md),
position 재계산은 [data-model.md](./data-model.md) 참고.

## 자동 테스트

```bash
npm test -- __tests__/api/tickets-reorder.test.ts
```

**기대 결과**: TC-API-007-1~7이 통과해야 한다.

## 수동 검증 (curl)

```bash
ID=$(curl -s -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" -d '{"title":"드래그 테스트"}' | jq -r .id)

curl -i -X PATCH http://localhost:3000/api/tickets/reorder \
  -H "Content-Type: application/json" \
  -d "{\"ticketId\": $ID, \"status\": \"TODO\", \"position\": 0}"
```

기대: `200`, `status: "TODO"`, `startedAt`이 현재 시각으로 채워짐.

```bash
curl -i -X PATCH http://localhost:3000/api/tickets/reorder \
  -H "Content-Type: application/json" \
  -d "{\"ticketId\": $ID, \"status\": \"DONE\", \"position\": 0}"
```

기대: `400`, `VALIDATION_ERROR`.

## 성공 기준 대조

- SC-701: 이동 결과가 다음 조회(`GET /api/tickets`)에서 정확히 반영되면 충족.
- SC-702: DONE 이동/존재하지 않는 티켓 이동이 각각 400/404로 거부되면 충족.
- SC-703: 좁은 간격 삽입 후에도 칼럼 내 순서가 의도대로 유지되면 충족(TC-API-007-7).
