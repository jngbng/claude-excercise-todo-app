# Quickstart: 티켓 완료 처리 검증

계약은 [contracts/patch-tickets-id-complete.md](./contracts/patch-tickets-id-complete.md)
참고.

## 자동 테스트

```bash
npm test -- __tests__/api/tickets-id-complete.test.ts
```

**기대 결과**: TC-API-005-1~3이 통과해야 한다.

## 수동 검증 (curl)

```bash
ID=$(curl -s -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" -d '{"title":"완료 테스트"}' | jq -r .id)

curl -s -X PATCH http://localhost:3000/api/tickets/$ID/complete | jq
curl -s -X PATCH http://localhost:3000/api/tickets/$ID/complete | jq
```

기대: 첫 번째 호출은 `status: "DONE"` + `completedAt` 설정, 두 번째 호출은
`status: "IN_PROGRESS"` + `completedAt: null`.

## 성공 기준 대조

- SC-601: 토글을 반복해도 completedAt이 매번 정확히 갱신/삭제되면 충족.
- SC-602: 존재하지 않는 ID 완료 처리 시도가 항상 404면 충족.
