# Research: 칸반 보드 전체 조회 (GET /api/tickets)

**입력**: [spec.md](./spec.md) 요구사항, `.specify/memory/constitution.md`, `docs/API_SPECS.md`,
`docs/DATA_MODEL.md`

001과 마찬가지로 이미 확정된 헌장·명세 문서가 모든 결정을 지정하고 있어 `NEEDS CLARIFICATION`
항목은 없다.

## 계층 분리 (001과 동일 컨벤션)

**Decision**: 001에서 확립한 Route Handler(파싱→서비스 호출→응답) / 서비스 계층 분리를
그대로 따른다. 이 엔드포인트는 요청 검증이 필요 없으므로(파라미터 없음) Zod 스키마는 추가하지
않는다.

**Rationale**: 헌장 원칙 V. 요청 바디가 없는 GET 엔드포인트에 Zod 스키마를 추가하는 것은
불필요한 코드다.

## 보드 조회 쿼리 전략

**Decision**: 전체 티켓을 `position` 오름차순 한 번의 쿼리로 조회한 뒤, JS에서 `status`별로
4개 배열(backlog/todo/inProgress/done)로 분류한다. `DONE` 티켓은 `completedAt`이 현재 시각
기준 24시간 이내인 것만 포함한다.

**Rationale**: `docs/DATA_MODEL.md`의 "Done 칼럼 24시간 필터" 규칙과 일치하며, MVP 규모(단일
사용자, 소량 데이터)에서는 한 번의 쿼리 후 메모리 분류가 4번의 개별 쿼리보다 단순하다.

**Alternatives considered**: 칼럼별 4번 쿼리 — 인덱스(`idx_tickets_status_position`)를 활용할
수 있지만 코드 복잡도 대비 이득이 없어 기각.

## 001의 `toTicket` 매퍼 재사용

**Decision**: 001에서 이미 `src/server/services/ticketService.ts`에 정의된 `create()`의
응답 변환 로직을 `toTicket(row)` 헬퍼로 추출해 이 기능의 `getBoard()`에서도 재사용한다.

**Rationale**: 001의 `create()`와 이 기능의 `getBoard()`가 동일한 DB row → API 응답 변환
로직(isOverdue 계산, 날짜 직렬화 등)을 필요로 한다. 추출하지 않으면 로직이 중복된다.

## 테스트 데이터 격리 전략

**Decision**: 통합 테스트는 실제 Postgres(`tika_test`)에 대해 수행한다. 새 헬퍼
`__tests__/helpers/ticketFixtures.ts`를 도입해, 테스트가 생성한 티켓의 id를 추적하고
`afterAll`에서 `DELETE ... WHERE id IN (...)`로만 정리한다. "빈 보드 조회" 테스트는 이 파일의
다른 어떤 테스트보다 먼저(맨 앞에) 선언해, 아직 아무 데이터도 쓰지 않은 시점에 실행되도록 한다
— Jest는 한 파일 내에서 `describe`/`it`을 선언 순서대로 순차 실행하므로 순서를 보장할 수 있다.

**Rationale**: "빈 보드 조회" 시나리오(SC-201 관련)는 실행 시점에 다른 테스트나 이전 실행이
남긴 데이터가 없어야 성립한다. 헌장 가드레일이 테이블 전체 TRUNCATE·조건 없는 DELETE를 절대
금지하므로, 매 실행마다 자기 자신이 만든 데이터만 targeted delete로 정리하는 방식만이 사용자
승인 없이도 반복 실행 가능한 유일한 방법이다.

**Alternatives considered**:
- 테스트 DB 전체 TRUNCATE — 헌장 가드레일에서 절대 금지, 매번 사용자 승인 필요해 지속 가능하지
  않음.
- 마커(marker) 접두사로 생성한 티켓만 필터링해 부분집합으로 비교 — "빈 보드"를 직접 검증하지
  못하고 근사치만 확인하게 되어 명세 충실도가 떨어짐. 파일 내 실행 순서를 이용하는 방식이 실제로
  "완전히 빈 배열"을 검증할 수 있어 더 낫다고 판단해 채택하지 않음.
