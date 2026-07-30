# Changelog

이 파일은 `/changelog "요약"` 명령으로 자동 기록된다. 새 항목은 항상 최상단에 추가되며, 기존 항목은
삭제·수정하지 않는다.

## [main] - 2026-07-31 08:30

### Prompt
> "docs/FRONTEND_TASKS.md 의 Phase 1 나머지 컴포넌트를 TDD로 구현해줘 — Badge, Modal,
> ConfirmDialog(5개 테스트: 메시지표시, 확인->onConfirm, 취소->onCancel). 각 컴포넌트마다
> Red -> Green -> Refactor 사이클을 적용하고, 작업을 마칠 때마다 커밋해줘."

### Changes
- **Added**: `ConfirmDialog` 컴포넌트 테스트 — TC-COMP-006-1(확인 메시지 + [취소]/[삭제] 버튼
  표시), TC-COMP-006-2([취소] 클릭 → onCancel 호출), TC-COMP-006-3([삭제] 클릭 → onConfirm 호출),
  isOpen=false 시 미표시, [삭제] 버튼 danger variant 클래스 검증
  (`__tests__/components/ConfirmDialog.test.tsx`)
- **Added**: `ConfirmDialog` 컴포넌트 구현 — `Modal` + `Button`(secondary 취소/danger 삭제)
  조합으로 "정말 삭제하시겠습니까?" 확인 다이얼로그 구현, 메시지는 스펙상 고정 문구라 하드코딩
  유지 (`src/client/components/ConfirmDialog.tsx`)

### Test Results
- ✅ 5 passed, 0 failed (`npx jest __tests__/components/ConfirmDialog.test.tsx`)
- ✅ `npx tsc --noEmit` 에러 없음

## [main] - 2026-07-31 08:14

### Prompt
> "changelog 스킬에서 CLAUDE.md 파일 끝에 최신 변경이력을 업데이트 하는 부분을 제거해줘. 기존에
> 생성된 내용도 지워줘."

### Changes
- **Modified**: `/changelog` 스킬에서 CLAUDE.md 최근 변경사항 요약 갱신 단계(옛 7단계)를 삭제하고
  description/목적 문구에서 CLAUDE.md 언급 제거 — 이제 CHANGELOG.md만 수정함
  (`.claude/skills/changelog/SKILL.md`)
- **Modified**: `<!-- CHANGELOG:AUTO-GENERATED:START/END -->` 마커와 그 안의 최근 변경 이력 요약
  블록을 파일 끝에서 삭제 (`CLAUDE.md`)

## [main] - 2026-07-31 08:09

### Prompt
> "__tests__/components/Button.test.tsx의 테스트를 통과하는 Button 컴포넌트를 구현해줘. 파일:
> src/client/components/Button.tsx, globals.css 클래스 사용, 최소한의 구현으로 테스트만 통과하면 돼."

### Changes
- **Modified**: Button 컴포넌트 Green 단계 구현 — variant(primary/secondary/danger/ghost)·
  size(sm/md/lg)별 클래스 매핑, 기본값 primary/md, onClick 연결, isLoading일 때 버튼 비활성화 +
  "처리중..." 텍스트 표시로 테스트 12건 모두 통과 (`src/client/components/Button.tsx`)
- **Modified**: 세션 프롬프트 자동 기록 갱신 (`prompt.log`)

### Test Results
- ✅ 12 passed, 0 failed (`npx jest __tests__/components/Button.test.tsx`)

## [main] - 2026-07-31 07:53

### Prompt
> "Button 컴포넌트 테스트를 작성해줘 (아직 구현 없이, variant/size별 클래스·기본값(primary/md)·
> onClick 호출·isLoading 비활성화 및 '처리중...' 표시·children 렌더링 검증). 이후 방금 만든
> 테스트는 컴포넌트 파일이 없어서 실패하는데, 최소한 모듈을 찾지 못하는 에러로 실패하진 않게
> 해줘 — 파일 만들고 더미 Button 컴포넌트까지는 만들어줘."

### Changes
- **Added**: Button 컴포넌트 Red 단계 테스트 — variant(primary/secondary/danger/ghost)별 클래스,
  size(sm/md/lg)별 클래스, 기본값 primary/md, onClick 1회 호출, isLoading일 때 비활성화 +
  "처리중..." 표시 및 클릭 무시, children 렌더링을 검증 (`__tests__/components/Button.test.tsx`)
- **Added**: 테스트 스위트가 "모듈을 찾을 수 없음" 에러 없이 실행되도록 하는 더미 Button 스텁 —
  variant/size/isLoading 로직은 아직 구현하지 않은 최소 컴포넌트 (`src/client/components/Button.tsx`)
- **Modified**: 세션 프롬프트 자동 기록 갱신 (`prompt.log`)

### Test Results
- ⚠️ 2 passed, 10 failed (`npx jest __tests__/components/Button.test.tsx`) — 더미 스텁이라
  variant/size/isLoading 관련 assertion은 의도적으로 실패 중 (Green 단계에서 통과 예정)

## [main] - 2026-07-31 07:37

### Prompt
> "changelog 스킬에서 변경된 파일 리스팅 하는 부분 제거해줘. 기존에 생성된 CHANGELOG.md 에서도 해당
> 부분 제거해줘."

### Changes
- **Modified**: 항목 생성 절차에서 "Files Modified" 섹션(numstat 기반 변경 파일·라인 수 리스팅)을
  제거하고, 이에 맞춰 실행 단계 번호를 재정렬(9단계 → 8단계)하고 더 이상 필요 없는
  `git diff --numstat` 호출도 함께 제거 (`.claude/skills/changelog/SKILL.md`)
- **Modified**: 기존 4개 항목(2026-07-31 07:30, 2026-07-30, 2026-07-29, 2026-07-28)에서
  "Files Modified" 섹션을 모두 삭제 — 나머지 내용(Prompt/Changes/Test Results)은 그대로 보존
  (`CHANGELOG.md`)

## [main] - 2026-07-31 07:30

### Prompt
> "프런트엔드 컴포넌트를 개발하면서 시각적으로 확인할 프리뷰 페이지를 만들어줘.
> - app/preview/page.tsx (클라이언트 컴포넌트)
> - 목(mock) 데이터로 개별 컴포넌트를 렌더링하는 갤러리 형식
> - 지금은 빈 컨테이너만 만들고, Phase별로 컴포넌트를 추가해 나갈 거야.
> - DB 연결 없이 `yarn dev`로 `localhost:3000/preview`에서 확인 가능해야 해.
> - 각 Phase 개발이 완료되면 run test 후 화면 확인 후 다음 과정으로 넘어가는 거야."

### Changes
- **Added**: 목 데이터로 개별 컴포넌트를 갤러리 형식으로 렌더링할 클라이언트 컴포넌트 프리뷰 페이지 신설.
  `PreviewSection` 헬퍼로 Phase 1/2/3 섹션 뼈대만 구성했고, 각 Phase의 컴포넌트가 구현되기 전까지는
  "아직 구현된 컴포넌트가 없습니다" 안내만 표시됨. DB 연결 없이 `yarn dev`로 `/preview`에서 확인 가능
  (`app/preview/page.tsx`)
- **Modified**: 세션 중 입력한 프롬프트가 자동으로 이어서 기록됨 (추정 — 자동 로깅 파일로 보이며 이번
  세션에서 직접 수정한 적은 없음) (`prompt.log`)

## [main] - 2026-07-30 07:32

### Prompt
> "이제 프런트엔드 화면을 개발할 거야. reference/image/트렐로.png 와 reference/image/tika-wireframe.png 를
> 살펴보고 이 화면 구성에 맞는 핵심 스타일을 app/globals.css 에 정의해줘. 화면 관련 스펙은
> docs/COMPONENT_SPEC.md 참고, 요구사항 정의는 docs/REQUIREMENTS.md 참고"

### Changes
- **Modified**: Tailwind CSS 4 `@theme` 디렉티브로 디자인 토큰(brand/surface/border/text 색상, 우선순위별
  색상 `priority-low/medium/high` — REQUIREMENTS.md §6 매핑, danger, radius, shadow, 모달 열림
  애니메이션 `overlay-in`/`modal-in`)을 정의하고, body 기본 스타일·포커스 아웃라인(NFR-003)·모달 스크롤
  잠금(`body-scroll-locked`)·칼럼 스크롤바(`scrollbar-thin`) 유틸리티 추가. 트렐로 스크린샷의 카드/칼럼
  비주얼과 tika-wireframe.png의 Backlog 사이드바 + 3칼럼 레이아웃(COMPONENT_SPEC.md §1)을 기준으로 설계
  (`app/globals.css`)
- **Modified**: 세션 중 입력한 프롬프트가 자동으로 이어서 기록됨 (추정 — 자동 로깅 파일로 보이며 이번
  세션에서 직접 수정한 적은 없음) (`prompt.log`)

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
