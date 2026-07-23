# Quickstart: 티켓 단건 조회 검증

계약은 [contracts/get-tickets-id.md](./contracts/get-tickets-id.md) 참고.

## 자동 테스트

```bash
npm test -- __tests__/api/tickets-id.test.ts
```

**기대 결과**: `docs/TEST_CASES.md`의 TC-API-003-1, TC-API-003-2가 통과해야 한다.

## 수동 검증 (curl)

```bash
ID=$(curl -s -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" -d '{"title":"단건 조회 테스트"}' | jq -r .id)

curl -s http://localhost:3000/api/tickets/$ID | jq
curl -i http://localhost:3000/api/tickets/999999
```

기대: 첫 번째는 `200` + 티켓 전체 정보, 두 번째는 `404` + `NOT_FOUND`.

## 성공 기준 대조

- SC-301: 존재하는 티켓 조회 결과가 실제 DB 값과 정확히 일치하면 충족.
- SC-302: 존재하지 않는 ID 조회가 항상 404를 반환하면 충족.
