# Quickstart: 티켓 수정 검증

계약은 [contracts/patch-tickets-id.md](./contracts/patch-tickets-id.md) 참고.

## 자동 테스트

```bash
npm test -- __tests__/api/tickets-id.test.ts
```

**기대 결과**: TC-API-004-1~6이 통과해야 한다.

## 수동 검증 (curl)

```bash
ID=$(curl -s -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" -d '{"title":"수정 전","description":"원래 설명"}' | jq -r .id)

curl -s -X PATCH http://localhost:3000/api/tickets/$ID \
  -H "Content-Type: application/json" -d '{"title":"수정 후"}' | jq

curl -s -X PATCH http://localhost:3000/api/tickets/$ID \
  -H "Content-Type: application/json" -d '{"description": null}' | jq
```

기대: 첫 번째 응답은 `title`만 바뀌고 `description`은 유지, 두 번째 응답은 `description`이
`null`.

## 성공 기준 대조

- SC-401: 보낸 필드만 바뀌고 나머지는 그대로면 충족.
- SC-402: 잘못된 입력이 400으로 거부되고 기존 값이 보존되면 충족.
