---
name: "changelog"
description: "코드 변경 후 CHANGELOG.md에 상세 작업 이력을 기록한다. 프롬프트 내용, 변경 파일, 브랜치/일시, 테스트 결과를 자동 수집한다."
argument-hint: "이번 변경에 대한 한 줄 요약 (예: \"로그인 버그 수정\")"
user-invocable: true
disable-model-invocation: true
---

## 목적

`/changelog "요약"` 명령이 실행되었을 때만 동작한다. Hook이 아니라 Skill이므로 코드를 수정하거나
git에 반영할 때마다 자동으로 실행되지 않는다 — 사용자가 명시적으로 호출했을 때만 이력을 기록한다.

이 스킬은 **CHANGELOG.md만** 수정한다. `app/`, `src/` 등 실제 소스 코드는 절대 건드리지
않는다. 또한 git add/commit을 대신 수행하지 않는다 — 기록만 남기고, 커밋 여부는 사용자가 결정한다.

## User Input

```text
$ARGUMENTS
```

`$ARGUMENTS`는 이번 변경에 대한 한 줄 요약이다 (예: `"로그인 버그 수정"`). 비어 있으면 3번 단계에서
대화 맥락으로부터 요약을 생성한다.

## Execution Steps

### 1. 기본 정보 수집

병렬로 실행:
- `git branch --show-current` → 브랜치명
- `date '+%Y-%m-%d %H:%M'` → 타임스탬프
- `git status --porcelain` → 작업 트리 상태 (dirty 여부 판단용)

### 2. 변경 범위 결정

- 작업 트리에 staged/unstaged 변경이 있으면(dirty): `git diff HEAD --name-status` 로 워킹 트리 vs
  HEAD 차이를 사용한다.
- 작업 트리가 깨끗하면(clean, 즉 이미 커밋됨): 가장 최근 커밋 하나를 대상으로
  `git diff HEAD~1 HEAD --name-status` 를 사용한다.
- 두 경우 모두 변경 파일이 없으면(즉 기록할 것이 없으면) 사용자에게 "기록할 변경사항이 없습니다"라고
  알리고 중단한다. 이 스킬을 억지로 실행하지 않는다.

### 3. Prompt 내용 정리

현재 세션의 대화 이력을 돌아보고, 이번에 기록할 코드 변경을 유발한 사용자의 원래 요청을 찾는다.
- `$ARGUMENTS`가 있으면: 그것을 요약 타이틀로 삼고, 대화에서 찾은 실제 원 요청 문장을 함께
  인용문으로 정리한다 (너무 길면 핵심만 남기고 축약, 원문 어조는 유지).
- `$ARGUMENTS`가 없으면: 대화 맥락에서 이번 변경의 의도를 한두 문장으로 요약해 인용문처럼 작성한다.
- 절대 지어내지 않는다 — 대화에서 실제로 확인되지 않는 요청을 인용문으로 만들지 않는다.

### 4. Changes 섹션 구성

`git diff --name-status` 결과의 상태 코드(A/M/D/R)를 기준으로 분류한다:
- `A` → **Added**
- `M` → **Modified**
- `D` → **Deleted**
- `R...` → **Renamed** (`old → new`)

각 파일에 대해, 세션 대화 맥락을 근거로 "무엇이 왜 바뀌었는지"를 한 줄로 작성한다. 대화에서 근거를
찾을 수 없는 파일은 diff 내용만 보고 최대한 사실 기반으로 짧게 설명하되 추측은 명시한다.

### 5. Test Results 섹션 (선택적 — 있는 경우에만)

이번 세션에서 이미 실행한 테스트 명령(`npm test`, `npx jest`, `jest` 등)의 결과가 대화 기록에
있으면 pass/fail 개수와 명령을 요약해 기록한다. **이 스킬은 테스트를 새로 실행하지 않는다** —
세션에 기록이 없으면 이 섹션 전체를 생략한다 (억지로 "N/A"를 쓰지 않고 섹션 자체를 뺀다).

### 6. CHANGELOG.md 갱신

- 파일이 없으면 `# Changelog\n\n` 로 새로 만든다.
- 새 항목은 **최상단(헤더 바로 아래)**에 삽입한다 — 최신 항목이 위로 오도록 유지한다.
- 기존 항목은 절대 삭제·수정하지 않는다. append가 아니라 prepend라는 점에 유의.
- 항목 형식은 정확히 아래를 따른다 (Test Results는 5번 단계에서 내용이 있을 때만 포함):

```markdown
## [브랜치명] - YYYY-MM-DD HH:MM

### Prompt
> "사용자가 입력한 요청"

### Changes
- **Added**: 새 기능 설명 (`파일경로`)
- **Modified**: 수정 내용 설명 (`파일경로`)
- **Deleted**: 삭제 내용 설명 (`파일경로`)

### Test Results
- ✅ 12 passed, 0 failed (`npm test`)
```

### 7. 결과 보고

CHANGELOG.md에 추가한 항목 미리보기(제목 줄)를 사용자에게 짧게 보고한다. git add/commit은
수행하지 않았음을 함께 알린다.
