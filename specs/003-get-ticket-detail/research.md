# Research: 티켓 단건 조회 (GET /api/tickets/:id)

**입력**: [spec.md](./spec.md), `.specify/memory/constitution.md`, `docs/API_SPECS.md`

## Next.js 15 동적 라우트 파라미터

**Decision**: `app/api/tickets/[id]/route.ts`는 Next.js 15의 비동기 `params`
(`Promise<{ id: string }>`)를 `await`하여 사용한다. `id`는 `Number()` 변환 후
`Number.isInteger()`로 검증하고, 정수가 아니면 즉시 "찾을 수 없음"으로 처리한다(DB에 정수가
아닌 값으로 쿼리를 보내 500 오류가 나는 상황을 방지).

**Rationale**: Next.js 15부터 Route Handler의 `params`가 Promise로 변경되었다. path
parameter 형식 검증은 명세에 명시되어 있지 않지만, 시스템 경계에서의 최소 방어다.

**Alternatives considered**: Zod로 `id` 파라미터를 검증 — 이 기능은 요청 바디가 없고
path parameter 하나뿐이라 Zod 스키마를 추가하는 것은 과도한 추상화로 판단해 기각. 간단한
`Number.isInteger` 검사로 충분하다.

## 404 처리 패턴

**Decision**: 서비스 함수 `getById(id)`는 존재하지 않으면 `null`을 반환한다. Route Handler가
`null`을 확인해 `{ error: { code: 'NOT_FOUND', message: '티켓을 찾을 수 없습니다' } }` 404
응답으로 변환한다.

**Rationale**: 헌장 원칙 III(에러 응답 형식 통일), V(서비스 계층 분리)를 그대로 적용하며,
예외 기반 제어 흐름 대신 반환값 기반으로 처리해 001이 확립한 코드 스타일과 일관성을 유지한다.
이후 PATCH/DELETE/complete/reorder 기능들도 동일한 패턴(`null`/`false` 반환)을 따를 것이므로,
이 기능에서 그 컨벤션을 확정한다.

**Alternatives considered**: 커스텀 `NotFoundError` 예외 — 프로젝트에 예외 기반 패턴이 전혀
없는 상태에서 새로 도입하는 것은 불필요한 복잡성으로 기각.

## `toTicket` 매퍼 재사용

**Decision**: 002에서 추출한 `src/server/services/ticketService.ts`의 `toTicket(row)`
헬퍼를 그대로 재사용한다.

**Rationale**: 이미 `create()`, `getBoard()`가 공유하는 로직이며, `getById()`도 동일한
DB row → API 응답 변환이 필요하다. 새로 만들 필요가 없다.
