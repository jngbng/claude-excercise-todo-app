<!--
Sync Impact Report
- Version change: TEMPLATE → 1.0.0 (initial ratification)
- Modified principles: N/A (first-time fill, not a rename)
- Added principles:
  - I. TypeScript Strict 모드 필수
  - II. API 응답 명세 준수
  - III. 에러 응답 형식 통일
  - IV. 요청 검증은 Zod로만
  - V. 비즈니스 로직의 서비스 계층 분리
- Added sections: 기술 스택 및 아키텍처 제약, 개발 워크플로, Governance
- Removed sections: none (template placeholders replaced)
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md — Constitution Check gate is derived dynamically from this file; no edit needed
  - ✅ .specify/templates/spec-template.md — no principle-specific hardcoding present; no edit needed
  - ✅ .specify/templates/tasks-template.md — task categories remain generic/compatible; no edit needed
  - ✅ CLAUDE.md — already documents these same rules under 코딩 컨벤션/개발 규칙; constitution now the ratified source of truth, no conflicting content found
  - ✅ CLAUDE-SDD.md — already documents SDD workflow referenced in Section "개발 워크플로"; no conflicting content found
- Follow-up TODOs: none — no placeholders deferred
-->

# Tika Constitution

## Core Principles

### I. TypeScript Strict 모드 필수
모든 TypeScript 코드는 strict 모드로 컴파일되어야 한다. `any` 타입 사용을 금지하며,
타입이 불확실한 값은 `unknown`으로 받은 뒤 타입 가드로 좁혀야 한다.

**근거**: 컴파일 타임에 타입 오류를 최대한 검출해 런타임 오류를 줄이고, `src/shared/`를
경계로 한 프론트엔드-백엔드 타입 계약을 명확하게 유지하기 위함이다.

### II. API 응답 명세 준수
모든 API 응답은 `docs/API_SPECS.md`에 정의된 형식을 정확히 따라야 한다. 필드 구성,
상태 코드, 페이로드 구조를 명세 없이 임의로 바꾸거나 확장할 수 없다. 구현상 명세와
다른 응답이 필요해지면 코드보다 `docs/API_SPECS.md`를 먼저 수정한다.

**근거**: 프론트엔드와 백엔드가 API 명세를 단일 진실 공급원으로 신뢰해야 통합 시점의
불일치 오류를 막을 수 있다.

### III. 에러 응답 형식 통일
모든 API 에러 응답은 예외 없이 `{ error: { code, message } }` 형식을 따른다. `code`는
`VALIDATION_ERROR`, `NOT_FOUND`, `INTERNAL_ERROR` 등 명세된 값만 사용하고, `message`는
사용자에게 그대로 노출 가능한 문자열이어야 한다.

**근거**: 클라이언트의 에러 처리 로직이 하나의 형식에만 의존하도록 해, 응답 형식이
흔들릴 때마다 늘어나는 방어 코드를 방지한다.

### IV. 요청 검증은 Zod로만
모든 API 요청 바디는 `src/shared/validations/`의 Zod 스키마로 검증한 뒤에만 처리한다.
프론트엔드와 백엔드는 동일한 스키마를 공유해 이중 검증을 보장하며, 수동 `if`문이나
타입 캐스팅으로 검증을 대체할 수 없다.

**근거**: 검증 로직의 중복 구현을 막고, 클라이언트·서버 간 검증 규칙이 어긋날 가능성을
원천 차단한다.

### V. 비즈니스 로직의 서비스 계층 분리
모든 비즈니스 로직은 `src/server/services/`에 작성한다. Route Handler(`app/api/`)는
요청 파싱 → 서비스 호출 → 응답 반환만 수행하며, DB 쿼리나 조건 분기 같은 로직을 직접
포함할 수 없다.

**근거**: 얇은 Route Handler는 테스트 용이성과 재사용성을 높이고, API 계층의 변경이
비즈니스 로직에 영향을 주지 않도록 격리한다.

## 기술 스택 및 아키텍처 제약

- Next.js 15 App Router 기반 단일 Vercel 프로젝트로 프론트엔드·백엔드·DB를 배포한다.
- 코드 수준에서 프론트엔드(`src/client/`)와 백엔드(`src/server/`, `app/api/`)를 분리하며,
  서로 직접 import할 수 없다. 공유 타입·검증 스키마·상수는 `src/shared/`로만 교환한다.
- DB 접근은 Drizzle ORM으로만 하며, raw SQL 작성을 금지한다.
- 상세 기술 스택 버전과 코딩 컨벤션은 `CLAUDE.md`를 따른다.

## 개발 워크플로

- 모든 구현은 TDD(Red-Green-Refactor) 사이클을 따른다: 테스트 작성 → 실패 확인 →
  최소 구현 → 리팩터링. 테스트 코드를 삭제하거나 skip 처리할 수 없다.
- 새 기능은 spec-kit 기반 SDD 워크플로(constitution → specify → clarify → plan → tasks
  → analyze/checklist → implement)를 따른다.
- 상세 규칙은 `CLAUDE.md`(코딩 컨벤션·TDD·경계 규칙)와 `CLAUDE-SDD.md`(SDD 워크플로 상세)를
  따른다.

## Guardrails (절대 준수 사항)

AI 코딩 에이전트가 위험한 작업을 수행하지 않도록 명시적으로 금지하는 규칙들이다.
**이 규칙들은 어떤 상황에서도 위반할 수 없다.**

### 데이터베이스 금지 명령어
- `DROP TABLE`, `DROP DATABASE` -- 절대 금지
- `TRUNCATE` -- 절대 금지
- `DELETE FROM` (WHERE 절 없이) -- 절대 금지
- `ALTER TABLE DROP COLUMN` -- 사용자 명시적 허가 필요

### 데이터베이스 안전 규칙
- 삭제/리셋 작업 시 반드시 사용자 승인 요청
- 삭제 전 백업 또는 복구 방법 안내
- 테스트 데이터 존재 시 DB 리셋 대신 SQL로 해결
- 운영 DB 자동 변경 절대 금지

### Git 금지 명령어
- `git push --force` -- 절대 금지
- `git reset --hard` -- 절대 금지
- `git clean -fd` -- 사용자 확인 필요
- `git branch -D` (main/master) -- 절대 금지

### 패키지 관리 금지 명령어
- `npm audit fix --force` -- 절대 금지
- `rm -rf node_modules && npm install` (또는 `yarn install`) -- 사용자 확인 필요
- 메이저 버전 자동 업그레이드 -- 절대 금지

### 파일 시스템 금지 명령어
- `rm -rf /` 또는 루트 경로 삭제 -- 절대 금지
- 프로젝트 외부 파일 수정 -- 절대 금지
- `.env` 파일 삭제 -- 사용자 확인 필요
- `src/` 디렉터리 전체 삭제 -- 절대 금지

### 안전 작업 원칙
- 파괴적 작업(삭제, 초기화) 전 반드시 사용자 확인
- 복구 불가능한 작업은 백업 방법 먼저 안내
- 자동화된 스크립트의 파괴적 명령 실행 금지
- 의심스러운 작업은 실행 전 사용자에게 설명 및 확인

## Governance

- 이 헌장은 `CLAUDE.md`, `CLAUDE-SDD.md`, `docs/`를 포함한 프로젝트의 다른 모든 관례보다
  우선한다. 상충이 발견되면 헌장을 기준으로 하위 문서를 수정한다.
- 개정(amendment)은 변경 사유와 영향받는 원칙을 명시하여 제안하며, 버전은 semantic
  versioning 규칙에 따라 갱신한다: 원칙의 하위 호환 불가능한 삭제·재정의는 MAJOR, 원칙
  추가나 실질적 가이드 확장은 MINOR, 표현 수정·오탈자 정정은 PATCH.
- 모든 PR/리뷰는 본 헌장 준수 여부를 확인해야 하며, 원칙에 어긋나는 복잡성은 plan.md의
  Complexity Tracking 표에 반드시 정당화되어야 한다.
- 런타임 개발 가이드는 `CLAUDE.md`(핵심 규칙)와 `CLAUDE-SDD.md`(SDD 워크플로)를 따른다.

**Version**: 1.0.0 | **Ratified**: 2026-07-23 | **Last Amended**: 2026-07-23
