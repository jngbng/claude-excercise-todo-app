# Research: 티켓 완료 처리 (PATCH /api/tickets/:id/complete)

**입력**: [spec.md](./spec.md), `.specify/memory/constitution.md`, `docs/API_SPECS.md`

## 새 동적 라우트 파일과 404 패턴의 관계

**Decision**: `app/api/tickets/[id]/complete/route.ts`는 003/004/005가
`app/api/tickets/[id]/route.ts`에서 확립한 `parseId`/`notFoundResponse` 로직과 동일한
개념을 사용하지만, Next.js 라우팅 구조상 `[id]/complete/`는 `[id]/`와 별개의 파일이므로
헬퍼를 import로 공유할 수 없다(서로 다른 디렉터리의 route.ts는 서로를 import하는 관계가
아니다). 따라서 이 기능에서는 동일한 패턴(작은 `parseId` 함수 + 동일한 404 JSON 형식)을 이
파일 안에 독립적으로 다시 작성한다.

**Rationale**: 헌장 원칙 III(에러 응답 형식 통일)은 "형식"의 일관성을 요구하는 것이지, 코드
재사용을 강제하지 않는다. 두 파일이 각각 10줄 미만의 동일한 헬퍼를 갖는 것은, 디렉터리 간
import로 결합도를 높이는 것보다 단순하다.

**Alternatives considered**: `src/server/` 또는 `src/shared/`에 공통 `parseId`/
`notFoundResponse` 유틸리티를 추출 — 파일이 2~3개뿐이고 각각 10줄 미만인 상황에서는 조기
추상화로 판단해 기각. 향후 reorder(007)까지 포함해 유사 패턴이 3번째 반복되면 그때
추출을 재고한다.

## `complete()` 서비스 함수의 토글 로직

**Decision**: `complete(id)`는 먼저 현재 상태를 조회하고, `DONE`이 아니면
`{ status: 'DONE', completedAt: now() }`로, `DONE`이면 `{ status: 'IN_PROGRESS',
completedAt: null }`로 갱신한다. 존재하지 않으면 `null`을 반환한다.

**Rationale**: `docs/API_SPECS.md`의 처리 규칙 표를 그대로 코드로 옮긴 것이다. 조회와 갱신을
분리된 두 단계로 처리하는 이유는, 갱신할 값이 "현재 상태"에 의존하기 때문에(단순
`UPDATE ... SET status = 'DONE'`만으로는 토글을 표현할 수 없음) 먼저 상태를 읽어야 한다.

**Alternatives considered**: SQL `CASE WHEN` 표현식으로 단일 쿼리에서 토글 — Drizzle에서
가능하지만 가독성이 떨어지고, 이 프로젝트 규모(단일 사용자, 저빈도 호출)에서 조회 1회 추가는
성능에 영향이 없어 기각.
