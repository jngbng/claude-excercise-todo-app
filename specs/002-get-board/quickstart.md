# Quickstart: 칸반 보드 전체 조회 검증

계약은 [contracts/get-tickets.md](./contracts/get-tickets.md) 참고.

## 사전 준비

```bash
docker compose up -d
npm run db:push
npm run dev   # http://localhost:3000
```

## 자동 테스트로 검증

```bash
npm test -- __tests__/api/tickets.test.ts
```

**기대 결과**: `docs/TEST_CASES.md`의 TC-API-002-1~3 시나리오가 모두 통과해야 한다.

## 수동 검증 (curl)

```bash
curl -s http://localhost:3000/api/tickets | jq
```

기대: `{ backlog: [], todo: [], inProgress: [], done: [] }` 형태의 4개 배열. 이미 생성된
티켓이 있다면 각자 상태에 맞는 배열에 position 오름차순으로 나타난다.

## 성공 기준 대조 (spec.md)

- SC-201: 응답의 각 칼럼이 실제 DB 상태·순서와 정확히 일치하면 충족.
- SC-202: `completedAt`이 24시간을 초과한 DONE 티켓이 `done` 배열에 없으면 충족.
