# CLAUDE-SDD.md - Tika 프로젝트 SDD(Spec-Driven Development) 워크플로

> CLAUDE.md에서 분리된 문서. spec-kit 기반 기능 개발(명세 작성 → 설계 → 태스크 분해 → 구현) 작업 시 참조한다.

## 관련 디렉터리
- specs/ : spec-kit으로 생성되는 기능 단위 SDD 산출물 (spec.md, plan.md, tasks.md)
- .specify/ : spec-kit 설정 (constitution, 템플릿, 스크립트)

## 명세 문서 경로
- 프로젝트 헌장(개발 원칙): /.specify/memory/constitution.md
- 기능별 SDD 산출물: /specs/<번호>-<기능명>/{spec.md, plan.md, tasks.md}

## 진행 순서
1. `/speckit.constitution` — 프로젝트 원칙 정의·수정 (`.specify/memory/constitution.md`)
2. `/speckit.specify` — 기능 명세 작성 (`specs/<번호>-<기능명>/spec.md`)
3. `/speckit.clarify` — 명세의 불명확한 부분 질문·보완 (plan 이전 권장)
4. `/speckit.plan` — 기술 설계 (`specs/<번호>-<기능명>/plan.md`)
5. `/speckit.tasks` — 실행 단위 작업 목록 생성 (`specs/<번호>-<기능명>/tasks.md`)
6. `/speckit.analyze`, `/speckit.checklist` — spec·plan·tasks 일관성 검증, 품질 체크리스트 (선택)
7. `/speckit.implement` — tasks.md를 순서대로 구현

## 반드시 지켜야 할 것
- 각 단계 산출물은 다음 단계로 넘어가기 전에 검토·승인
- specify → plan → tasks 단계를 건너뛰고 바로 구현 금지
- tasks.md의 각 태스크를 구현할 때도 CLAUDE.md의 TDD 사이클 규칙을 그대로 적용
- 구현 중 명세와 다른 결정이 필요해지면 코드보다 spec.md/plan.md를 먼저 수정
- 구현 누락이나 코드 드리프트가 발견되면 `/speckit.converge`로 tasks.md를 최신화한 뒤 이어서 진행

## 문서 체계
- `docs/` : PRD·TRD 등 프로젝트 전역 스펙 — SDD 도입 이전부터 유지되는 상위 문서, 항상 먼저 참조
- `specs/<번호>-<기능명>/` : spec-kit으로 생성되는 기능 단위 spec.md·plan.md·tasks.md
- `.specify/memory/constitution.md` : 프로젝트 개발 원칙
