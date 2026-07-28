# Changelog

이 파일은 `/changelog "요약"` 명령으로 자동 기록된다. 새 항목은 항상 최상단에 추가되며, 기존 항목은
삭제·수정하지 않는다. CLAUDE.md의 "최근 변경 이력" 섹션은 이 파일에서 최근 14일 항목만 요약한 것이다.

## [main] - 2026-07-29 08:16

### Prompt
> "프론트엔드 실습을 위해 COMPONENT_SPEC.md를 책의 예제에 맞춤"
>
> 세션 내 실제 요청: "COMPONENT_SPEC.md 파일을 업데이트했는데, 다른 문서와 비교해서 오류가 없는지
> 검토해줘." → "TEST_CASES.md와 TRD.md를 COMPONENT_SPEC.md 기준으로 맞춰줘. Ticket에 isOverDue가
> 포함된게 문제야. DB 타입에 맞추기 위해 isOverDue가 빠져야 하고, 파생 필드를 덧붙이기 위해
> TicketWithMeta 타입이 필요해." → "PRD.md 필터 버튼 문구도 COMPONENT_SPEC.md 기준으로 맞춰줘." →
> "ReorderableStatus는 client에서만 쓰이는 타입이니깐 공용 shared/type에 선언하면 안돼. 공용 모델에
> 클라이언트 로직이 섞이면 안돼지."

### Changes
- **Modified**: `Ticket`에서 파생 필드 `isOverdue`를 분리하고 `TicketWithMeta = Ticket & { isOverdue }`
  신설, `BoardData`를 `TicketWithMeta[]` 기준으로 변경 (`src/shared/types/index.ts`)
- **Modified**: `toTicket`/`create`/`getById`/`update`/`complete`/`reorder` 반환 타입을 `TicketWithMeta`로
  갱신 (`src/server/services/ticketService.ts`)
- **Modified**: `Ticket`/`TicketWithMeta` 타입 문서화 및 `ReorderableStatus`는 클라이언트 전용이라 공유
  타입에서 제외한다는 안내 추가 (`docs/DATA_MODEL.md`)
- **Modified**: `Ticket` 공통 구조를 `TicketWithMeta` 기준으로 재정의 (`docs/API_SPECS.md`)
- **Modified**: 프론트엔드 아키텍처 절(컴포넌트 계층 `BoardContainer/Board/Column`, 상태 관리, 단일
  `useTickets` 훅)을 COMPONENT_SPEC.md 기준으로 재작성 (`docs/TRD.md`)
- **Modified**: `TC-COMP-*` 테스트 케이스의 컴포넌트명·prop명(`onCardClick`→`onClick`)·필터 값 표기
  (`'THIS_WEEK'`→`'thisWeek'` 등)를 COMPONENT_SPEC.md 기준으로 정렬 (`docs/TEST_CASES.md`)
- **Modified**: 필터 버튼 문구를 COMPONENT_SPEC.md 기준("이번주 업무"/"일정 초과")으로 통일 (`docs/PRD.md`)
- **Modified**: 컴포넌트 계층을 새 구조(`BoardContainer`/`Board`/`Column` 등, 책 예제 기준)로 재작성하고
  `ReorderableStatus`는 `useTickets.ts`에 로컬 정의한다는 각주 추가 (`docs/COMPONENT_SPEC.md`)
- **Modified**: 세션 중 입력한 프롬프트가 자동으로 이어서 기록됨 (추정 — 자동 로깅 파일로 보이며 이번
  세션에서 직접 수정한 적은 없음) (`prompt.log`)

### Files Modified
- `docs/API_SPECS.md` (+5, -2 lines)
- `docs/COMPONENT_SPEC.md` (+344, -746 lines)
- `docs/DATA_MODEL.md` (+13, -5 lines)
- `docs/PRD.md` (+2, -2 lines)
- `docs/TEST_CASES.md` (+17, -17 lines)
- `docs/TRD.md` (+35, -28 lines)
- `prompt.log` (+23, -0 lines)
- `src/server/services/ticketService.ts` (+10, -7 lines)
- `src/shared/types/index.ts` (+8, -4 lines)

### Test Results
- ✅ 36 passed, 0 failed (`npx jest`)

## [main] - 2026-07-28 20:44

### Prompt
> "매번 프롬프트 입력 후 코드를 수정하고 git에 반영할 때, 프롬프트 내용/변경 파일/라인 수/브랜치명/일시/테스트
> 결과를 CHANGELOG.md에 상세 기록하고 CLAUDE.md에 최근 7-14일 변경사항을 요약하는 시스템을 만들어줘.
> `/changelog "요약"` 명령으로 실행되며, Hook이 아닌 Skill 방식(사용자가 원할 때만 실행)으로 구현할 것."

### Changes
- **Added**: `/changelog` 명령 정의 및 실행 절차 — 브랜치/일시/변경 파일/테스트 결과 수집, CHANGELOG.md
  최상단 삽입, CLAUDE.md 자동 요약 블록 갱신 로직 (`.claude/skills/changelog/SKILL.md`)
- **Added**: 변경 이력을 누적 기록할 CHANGELOG.md 신설 (`CHANGELOG.md`)
- **Modified**: "변경 이력 기록" 절 및 `CHANGELOG:AUTO-GENERATED` 마커 블록 추가 (`CLAUDE.md`)

### Files Modified
- `.claude/skills/changelog/SKILL.md` (+130, -0 lines)
- `CHANGELOG.md` (+4, -0 lines)
- `CLAUDE.md` (+12, -0 lines)
