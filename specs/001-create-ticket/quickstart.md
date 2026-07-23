# Quickstart: 티켓 생성 (POST /api/tickets) 검증

계약은 [contracts/post-tickets.md](./contracts/post-tickets.md), 데이터 모델은
[data-model.md](./data-model.md) 참고.

## 사전 준비

```bash
docker compose up -d        # 로컬 Postgres 컨테이너 기동
npm run db:push             # Drizzle 스키마 반영 (.env.local의 DATABASE_URL 사용)
npm run dev                 # http://localhost:3000
```

## 자동 테스트로 검증

```bash
npm test -- __tests__/api/tickets.test.ts
```

**기대 결과**: `docs/TEST_CASES.md`의 TC-API-001-1 ~ TC-API-001-8 시나리오가 모두 통과해야 한다
(계획 수립 시점 기준 TC-API-001-4, -6은 테스트 미작성 — tasks.md에서 추가 예정).

## 수동 검증 (curl)

**시나리오 1 — 제목만으로 생성 (사용자 스토리 1)**

```bash
curl -i -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"title": "할 일"}'
```

기대: `201`, `status: "BACKLOG"`, `priority: "MEDIUM"`, `position <= 0`.

**시나리오 2 — 전체 필드로 생성 (사용자 스토리 2)**

```bash
curl -i -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"title":"로그인 페이지 디자인","description":"OAuth 포함","priority":"HIGH","plannedStartDate":"2026-08-01","dueDate":"2026-08-10"}'
```

기대: `201`, 요청한 필드가 응답에 그대로 반영됨.

**시나리오 3 — 잘못된 입력 (사용자 스토리 3)**

```bash
curl -i -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"title": "   "}'
```

기대: `400`, `{ "error": { "code": "VALIDATION_ERROR", "message": "제목을 입력해주세요" } }`.

## 성공 기준 대조 (spec.md)

- SC-001: 시나리오 1이 성공하면 충족.
- SC-002: 시나리오 3 및 `docs/API_SPECS.md`의 모든 오류 케이스가 각각 올바른 message를 반환하면 충족.
- SC-003: 시나리오 1·2에서 반환된 `position`이 기존 Backlog 티켓들의 최솟값보다 작으면 충족.
- SC-004: 시나리오 2의 응답 필드가 요청 본문과 완전히 일치하면 충족.
