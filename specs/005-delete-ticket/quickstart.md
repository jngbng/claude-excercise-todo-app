# Quickstart: 티켓 삭제 검증

계약은 [contracts/delete-tickets-id.md](./contracts/delete-tickets-id.md) 참고.

## 자동 테스트

```bash
npm test -- __tests__/api/tickets-id.test.ts
```

**기대 결과**: TC-API-006-1~3이 통과해야 한다.

## 수동 검증 (curl)

```bash
ID=$(curl -s -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" -d '{"title":"삭제 테스트"}' | jq -r .id)

curl -i -X DELETE http://localhost:3000/api/tickets/$ID
curl -i http://localhost:3000/api/tickets/$ID
```

기대: 첫 번째는 `204`, 두 번째(재조회)는 `404` + `NOT_FOUND`.

## 성공 기준 대조

- SC-501: 삭제 후 재조회가 항상 404면 충족.
- SC-502: 존재하지 않는 ID 삭제 시도가 항상 404면 충족.
