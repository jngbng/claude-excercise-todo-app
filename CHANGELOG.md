# Changelog

이 파일은 `/changelog "요약"` 명령으로 자동 기록된다. 새 항목은 항상 최상단에 추가되며, 기존 항목은
삭제·수정하지 않는다. CLAUDE.md의 "최근 변경 이력" 섹션은 이 파일에서 최근 14일 항목만 요약한 것이다.

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
