# Research: 티켓 삭제 (DELETE /api/tickets/:id)

**입력**: [spec.md](./spec.md), `.specify/memory/constitution.md`, `docs/API_SPECS.md`

## 삭제·404 처리 패턴 (003/004과 동일 컨벤션)

**Decision**: `remove(id)` 서비스 함수는 삭제된 행이 있으면 `true`, 없으면(존재하지 않음)
`false`를 반환한다. Route Handler는 003/004에서 이미 만든 `parseId`/`notFoundResponse`
헬퍼를 그대로 재사용해 `false`일 때 404로 변환하고, 성공 시 본문 없는 204를 반환한다.

**Rationale**: 헌장 원칙 III, V. 이 기능은 Zod 검증 대상(요청 바디)이 없고 새 로직도 거의
없어, 003/004이 이미 확립한 패턴을 그대로 따르는 것이 가장 단순하다.

**Alternatives considered**: 없음 — 이미 확정된 컨벤션을 그대로 적용.

## 204 응답 구현

**Decision**: `new NextResponse(null, { status: 204 })`로 본문 없는 응답을 반환한다.

**Rationale**: `docs/API_SPECS.md`가 "본문 없음"을 명시하며, `NextResponse.json(null, ...)`은
JSON `null` 리터럴을 본문으로 보내 "본문 없음"과 다르다.
