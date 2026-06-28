# TRD - Tika (Technical Requirements Document)

> 최종 수정: 2026-06-28
> 버전: 1.0 (MVP)

---

## 1. 시스템 아키텍처

### 전체 구조

Vercel 단일 프로젝트로 프론트엔드·백엔드·DB를 통합 배포한다. Next.js App Router가 페이지(RSC)와 API Route Handler를 모두 처리하며, Vercel Postgres(Neon)를 서버리스 DB로 사용한다.

**핵심 설계 원칙: 프론트엔드와 백엔드의 논리적 분리**

배포는 단일 Vercel 프로젝트지만, 코드는 디렉토리 수준에서 프론트엔드(`src/client/`)와 백엔드(`src/server/`)를 엄격히 분리한다. 두 계층은 HTTP API(Route Handler)를 유일한 통신 경계로 사용하며, 코드 레벨에서 상호 import를 금지한다. 공유가 필요한 타입·검증 스키마·상수는 `src/shared/`에서만 관리한다.

이 원칙의 목적은:
- 백엔드 변경이 프론트엔드 번들에 포함되지 않도록 격리
- 프론트엔드에서 DB 접근이 불가능한 구조적 보장
- 계층 간 의존 방향을 단방향(클라이언트 → API → 서버)으로 고정

### 아키텍처 다이어그램

```
[Browser]
    │  HTTP (fetch)
    ▼
[Next.js App Router — Vercel Serverless]
├── app/page.tsx           (Board Page / RSC)
│       │  import
│       └── src/client/    (컴포넌트, 훅, ticketApi.ts)
│
└── app/api/tickets/       (Route Handlers — 요청 파싱 + 응답)
            │  call
            ▼
       src/server/services/ (비즈니스 로직)
            │  query
            ▼
       src/server/db/       (Drizzle ORM 스키마 + 쿼리)
            │  SQL
            ▼
       [Vercel Postgres / Neon]

src/shared/ ←── 양쪽에서 import (타입, Zod 스키마, 상수)
```

---

## 2. 디렉토리 구조

```
app/
├── api/
│   └── tickets/
│       ├── route.ts              # GET /api/tickets, POST /api/tickets
│       ├── [id]/
│       │   ├── route.ts          # GET, PATCH, DELETE /api/tickets/:id
│       │   └── complete/
│       │       └── route.ts      # PATCH /api/tickets/:id/complete
│       └── reorder/
│           └── route.ts          # PATCH /api/tickets/reorder
├── page.tsx                      # 칸반 보드 페이지 (RSC)
└── layout.tsx
src/
├── client/                       # [프론트엔드] — src/server/ import 금지
│   ├── components/               # React 컴포넌트 (PascalCase)
│   ├── hooks/                    # 커스텀 훅
│   └── api/
│       └── ticketApi.ts          # API 호출 함수 (유일한 진입점)
├── server/                       # [백엔드] — src/client/ import 금지
│   ├── services/
│   │   └── ticketService.ts      # 비즈니스 로직
│   ├── db/
│   │   ├── schema.ts             # Drizzle 테이블 스키마
│   │   └── index.ts              # DB 연결
│   └── middleware/               # 공통 미들웨어 (에러 핸들링 등)
└── shared/                       # [공유] — 양쪽에서 import 가능
    ├── types/
    │   └── index.ts              # 공유 타입 (Ticket, BoardData 등)
    ├── validations/
    │   └── ticketSchema.ts       # Zod 검증 스키마
    └── constants/
        └── index.ts              # TICKET_STATUS, TICKET_PRIORITY 상수
docs/
```

---

## 3. 기술 스택 상세

### 프론트엔드 (`src/client/`)

| 기술 | 버전 | 대안 | 선택 이유 |
|------|------|------|-----------|
| **React** | 19.x | Vue, Svelte | Concurrent Features, Server Components, 생태계 표준 |
| **Tailwind CSS** | 4.x | CSS Modules, styled-components | 유틸리티 우선으로 반응형 빠르게 구현, 커스텀 디자인 시스템 불필요 |
| **@dnd-kit** | 6.x | react-beautiful-dnd, dnd | 접근성(aria) 내장, 헤드리스 구조로 커스텀 UI 자유도, 터치 이벤트 지원 |
| **Jest + React Testing Library** | 29.x / 14.x | Vitest, Playwright | React 생태계 표준, 컴포넌트 단위 TDD 지원 |

### 백엔드 (`src/server/`, `app/api/`)

| 기술 | 버전 | 대안 | 선택 이유 |
|------|------|------|-----------|
| **Drizzle ORM** | 0.3x | Prisma, Kysely | 코드 생성 불필요, TypeScript-first 스키마, 서버리스 환경 최적화, 번들 경량 |
| **Vercel Postgres (Neon)** | - | PlanetScale, Supabase | Vercel 네이티브 연동, 서버리스 커넥션 풀 자동 관리, 콜드스타트 빠름 |
| **Jest** | 29.x | Vitest | 서비스·DB 레이어 단위 테스트 |

### 공유 계층 (`src/shared/`)

| 기술 | 버전 | 대안 | 선택 이유 |
|------|------|------|-----------|
| **Zod** | 3.x | Yup, class-validator | 프론트·백 동일 스키마 공유(`src/shared/validations/`), TypeScript 타입 추론 내장, 이중 검증 보장 |

### 인프라 / 공통

| 기술 | 버전 | 대안 | 선택 이유 |
|------|------|------|-----------|
| **Next.js** (App Router) | 15.x | Remix, Vite + Express | RSC + API Route 통합, Vercel 네이티브 지원, 단일 레포로 프론트·백 분리 관리 |
| **TypeScript** (strict) | 5.x | JavaScript | 컴파일타임 타입 오류 검출, `src/shared/`로 프론트-백 타입 계약 명시화 |
| **Vercel** | - | AWS, Railway | git push 자동 배포, PR별 Preview 환경 자동 생성, HTTPS 기본 제공 |

### 런타임 환경

- **Node.js**: 20.x LTS (Vercel Serverless Functions)
- **패키지 매니저**: npm
- **빌드**: Next.js 내장 빌드 (`next build`)

---

## 4. 데이터 흐름

### 읽기 흐름 (보드 조회)

```
BoardPage (RSC)
  └─ ticketApi.ts: getBoard()
        └─ GET /api/tickets
              └─ ticketService.getBoard()
                    └─ Drizzle: SELECT * FROM tickets ORDER BY position ASC
                          └─ 칼럼별 그룹화 + isOverdue 파생 필드 계산
                                └─ 200 OK { backlog: [], todo: [], inProgress: [], done: [] }
```

### 쓰기 흐름 (티켓 생성)

```
TicketCreateForm
  └─ 클라이언트 Zod 검증 (createTicketSchema)
        └─ ticketApi.ts: createTicket(data)
              └─ POST /api/tickets
                    └─ 서버 Zod 검증 (동일 스키마)
                          └─ ticketService.create(data)
                                └─ Drizzle: INSERT INTO tickets ...
                                      └─ 201 Created + 생성된 티켓
                                            └─ UI 상태 갱신 (보드 재조회 또는 낙관적 추가)
```

### 드래그 앤 드롭 흐름 (FR-007)

```
onDragEnd 이벤트
  └─ 낙관적 업데이트: UI 상태 즉시 반영 (position + status 변경)
        └─ ticketApi.ts: reorderTicket({ ticketId, status, position })
              └─ PATCH /api/tickets/reorder
                    └─ ticketService.reorder()
                          ├─ position 재계산 (prev + next) / 2
                          │    └─ 간격 < 1이면 칼럼 전체 재정렬
                          ├─ TODO 이동 시: startedAt 자동 기록
                          ├─ TODO → BACKLOG 시: startedAt 초기화
                          └─ DB 업데이트 (트랜잭션)
                                ├─ 성공: 확정 (낙관적 상태 유지)
                                └─ 실패: 이전 상태 롤백
```

### 완료 처리 흐름 (FR-005)

```
카드 → Done 칼럼 드롭
  └─ PATCH /api/tickets/:id/complete
        └─ ticketService.complete(id)
              ├─ status = DONE, completedAt = NOW()
              └─ Done → 다른 칼럼: completedAt = null
```

---

## 5. 프론트엔드 아키텍처

### 컴포넌트 계층 구조

```
app/page.tsx (BoardPage — RSC, 초기 데이터 패치)
└── src/client/components/
    ├── KanbanBoard             # 보드 전체 레이아웃, DndContext 루트
    │   ├── BoardColumn         # 칼럼 단위 (Backlog / TODO / In Progress / Done)
    │   │   ├── ColumnHeader    # 칼럼명 + 카드 수 뱃지
    │   │   └── TicketCard      # 개별 티켓 카드 (드래그 가능)
    │   └── FilterBar           # 이번 주 업무 / 만기일 지난 업무 필터 버튼
    ├── TicketModal             # 티켓 상세 보기 / 수정 오버레이
    │   └── TicketForm          # 생성·수정 공용 폼
    └── ConfirmDialog           # 삭제 확인 다이얼로그
```

### 상태 관리

외부 상태 관리 라이브러리(Redux, Zustand 등)를 사용하지 않는다. React 내장 훅(`useState`, `useReducer`, `useOptimistic`)으로 로컬 상태를 관리한다.

| 상태 | 위치 | 관리 방법 |
|------|------|-----------|
| 보드 전체 티켓 목록 | `KanbanBoard` | `useState<BoardData>` |
| 드래그 중 임시 상태 | `KanbanBoard` | `useOptimistic` (낙관적 업데이트) |
| 모달 열림/닫힘 | `KanbanBoard` | `useState<TicketId \| null>` |
| 필터 선택 상태 | `FilterBar` | `useState<FilterType \| null>` |
| 폼 입력값 | `TicketForm` | `useState<FormData>` |

### 커스텀 훅

| 훅 | 위치 | 역할 |
|----|------|------|
| `useBoard` | `hooks/useBoard.ts` | 보드 데이터 패치, 티켓 CRUD 액션, 낙관적 업데이트 조율 |
| `useDragAndDrop` | `hooks/useDragAndDrop.ts` | @dnd-kit 이벤트 핸들러, reorder 호출, 롤백 처리 |
| `useTicketFilter` | `hooks/useTicketFilter.ts` | 이번 주 / 오버듀 필터 로직, 파생 티켓 목록 계산 |

### API 호출 단일 진입점 (`ticketApi.ts`)

프론트엔드의 모든 API 호출은 `src/client/api/ticketApi.ts`를 통해서만 한다. 컴포넌트나 훅에서 `fetch`를 직접 호출하지 않는다.

```typescript
// src/client/api/ticketApi.ts 제공 함수 목록
getBoard()                         // GET  /api/tickets
getTicket(id)                      // GET  /api/tickets/:id
createTicket(data)                 // POST /api/tickets
updateTicket(id, data)             // PATCH /api/tickets/:id
completeTicket(id)                 // PATCH /api/tickets/:id/complete
deleteTicket(id)                   // DELETE /api/tickets/:id
reorderTicket(ticketId, status, position) // PATCH /api/tickets/reorder
```

### 낙관적 업데이트 패턴

드래그앤드롭·생성·삭제는 API 응답을 기다리지 않고 UI를 즉시 반영한다.

```
사용자 액션
  └─ 이전 상태 스냅샷 저장
        └─ UI 즉시 반영 (낙관적)
              └─ API 호출
                    ├─ 성공: 스냅샷 폐기 (UI 유지)
                    └─ 실패: 스냅샷으로 UI 롤백 + 에러 메시지 표시
```

### 드래그 앤 드롭 (@dnd-kit)

- `DndContext`: `KanbanBoard` 루트에 배치, `onDragEnd`에서 `useDragAndDrop` 훅 호출
- `SortableContext`: 각 `BoardColumn`에 적용, `position` 기준 정렬 유지
- `useSortable`: 각 `TicketCard`에 적용, 드래그 핸들 및 transform 스타일 제공
- 칼럼 간 이동: `active.data.current.sortable.containerId`로 출발 칼럼 판별

---

## 6. 계층 간 경계 규칙

### import 허용 규칙

| 방향 | 허용 여부 |
|------|-----------|
| `src/client/` → `src/shared/` | ✅ 허용 |
| `src/server/` → `src/shared/` | ✅ 허용 |
| `src/client/` → `src/server/` | ❌ 금지 |
| `src/server/` → `src/client/` | ❌ 금지 |
| `src/client/` → DB 직접 접근 | ❌ 금지 |
| `src/server/` → React 코드 작성 | ❌ 금지 |

### 하지 말아야 하는 것 (상호 참조 금지)

**백엔드 작업 중 (`app/api/`, `src/server/`)**
- `src/client/`의 컴포넌트·훅·API 함수 import 금지
- React, JSX 관련 코드 작성 금지
- 프론트엔드 상태 관리 코드 참조 금지

**프론트엔드 작업 중 (`src/client/`)**
- `src/server/`의 서비스·DB 코드 import 금지
- Drizzle ORM, DB 연결 코드 직접 사용 금지
- 컴포넌트 내에서 `fetch`로 DB 직접 호출 금지

**공통**
- `src/shared/` 외의 경로를 프론트·백 양쪽에서 cross-import 금지
- Route Handler에서 비즈니스 로직 직접 작성 금지 (서비스 레이어로 위임)
- `src/client/api/ticketApi.ts`를 우회하여 컴포넌트에서 `fetch` 직접 호출 금지

### 양쪽에 영향을 주는 변경 시 작업 순서

타입·검증 스키마·상수 변경처럼 프론트엔드와 백엔드 모두에 영향을 줄 때는 반드시 아래 순서를 따른다.

```
1단계: src/shared/ 수정
  ├─ types/index.ts        — 공유 타입 변경
  ├─ validations/*.ts      — Zod 스키마 변경
  └─ constants/index.ts    — 상수 변경

      ↓ 공유 계층 변경 완료 후

2단계: src/server/ 반영   (백엔드)
  ├─ services/             — 서비스 로직 수정
  └─ db/schema.ts          — DB 스키마 수정 + 마이그레이션

3단계: src/client/ 반영   (프론트엔드)
  ├─ api/ticketApi.ts      — API 호출 함수 수정
  └─ components/           — UI 컴포넌트 수정
```

> 2단계와 3단계는 순서가 바뀌어도 되지만, **반드시 1단계(shared) 변경이 먼저 완료된 후** 각각 독립적으로 진행한다. 두 단계를 동시에 수정하면 타입 불일치가 숨겨질 수 있다.

### Route Handler 역할 제한

Route Handler(`app/api/`)는 얇게 유지한다.

```typescript
// ✅ 올바른 패턴
export async function POST(req: Request) {
  const body = await req.json();                     // 요청 파싱
  const data = createTicketSchema.parse(body);       // Zod 검증
  const ticket = await ticketService.create(data);   // 서비스 호출
  return NextResponse.json(ticket, { status: 201 }); // 응답 반환
}

// ❌ 금지 패턴 — Route Handler에 비즈니스 로직 직접 작성
export async function POST(req: Request) {
  const body = await req.json();
  const position = await db.select()...  // DB 직접 쿼리
  if (body.dueDate < new Date()) { ... } // 비즈니스 규칙 직접 처리
}
```

---

## 7. API 설계 원칙

### URL 설계 규칙

- 리소스 이름은 복수 명사 소문자 사용: `/api/tickets`
- 계층 관계는 경로로 표현: `/api/tickets/:id/complete`
- 동사 사용 금지 (예외: 특정 동작을 명시해야 할 때 — `reorder`, `complete`)
- 쿼리 파라미터는 필터링·정렬에만 사용

```
GET    /api/tickets              # 전체 티켓 목록 (보드 데이터)
POST   /api/tickets              # 티켓 생성
GET    /api/tickets/:id          # 티켓 단건 조회
PATCH  /api/tickets/:id          # 티켓 부분 수정
DELETE /api/tickets/:id          # 티켓 삭제
PATCH  /api/tickets/:id/complete # 티켓 완료 처리
PATCH  /api/tickets/reorder      # 순서/상태 변경 (드래그앤드롭)
```

### HTTP 메서드 규칙

| 메서드 | 용도 | 멱등성 |
|--------|------|--------|
| `GET` | 조회 (부작용 없음) | ✅ |
| `POST` | 생성 | ❌ |
| `PATCH` | 부분 수정 | ✅ |
| `DELETE` | 삭제 | ✅ |

> `PUT`(전체 교체)은 사용하지 않는다. 티켓 수정은 항상 전송된 필드만 업데이트하는 `PATCH`를 사용한다.

### 요청 형식

- Content-Type: `application/json`
- 날짜 형식: ISO 8601 (`2026-06-28`)
- 빈 값 삭제: `null` 전송으로 해당 필드를 명시적으로 삭제

### 성공 응답 형식

```typescript
// 단건 응답 (생성·수정·조회)
{ id, title, status, priority, position, ... }

// 목록 응답 (보드 조회)
{
  backlog: Ticket[],
  todo: Ticket[],
  inProgress: Ticket[],
  done: Ticket[]
}

// 삭제 성공 (204 No Content)
// — 응답 본문 없음
```

### 에러 응답 형식

모든 에러 응답은 아래 형식을 따른다.

```typescript
{ error: { code: string; message: string } }

// 예시
{ error: { code: "VALIDATION_ERROR", message: "제목을 입력해주세요" } }
{ error: { code: "NOT_FOUND", message: "티켓을 찾을 수 없습니다" } }
{ error: { code: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다" } }
```

### HTTP 상태 코드

| 코드 | 용도 |
|------|------|
| 200 | 조회·수정 성공 |
| 201 | 생성 성공 |
| 204 | 삭제 성공 (본문 없음) |
| 400 | 요청 검증 실패 (Zod 에러) |
| 404 | 리소스 없음 |
| 500 | 서버 내부 오류 |

### 클라이언트 에러 처리

- API 실패 시 토스트 또는 인라인 에러 메시지 표시
- 드래그앤드롭 실패 시 이전 보드 상태로 롤백 (낙관적 업데이트 취소)
- 400 에러: 검증 실패 메시지를 폼 필드 옆에 표시
- 404 에러: "티켓을 찾을 수 없습니다" 토스트 표시 후 보드 재조회
- 500 에러: "일시적인 오류가 발생했습니다. 다시 시도해주세요" 토스트 표시

---

## 8. 개발 환경 설정

### 초기 설정

```bash
npm install
vercel env pull .env.local   # Vercel Postgres 환경 변수 가져오기
npm run db:push              # Drizzle 스키마를 DB에 반영 (개발)
npm run dev                  # 개발 서버 실행 (localhost:3000)
```

### 환경 변수

| 변수명 | 설명 |
|--------|------|
| `DATABASE_URL` | Vercel Postgres 연결 문자열 |
| `DATABASE_URL_UNPOOLED` | 마이그레이션용 직접 연결 |

### DB 마이그레이션

| 명령 | 용도 |
|------|------|
| `drizzle-kit push` | 개발 환경 스키마 즉시 반영 |
| `drizzle-kit generate` | 마이그레이션 파일 생성 |
| `drizzle-kit migrate` | 프로덕션 마이그레이션 실행 |

### 테스트

```bash
npm test               # 전체 테스트 실행
npm test -- --watch    # 워치 모드
npm test -- --coverage # 커버리지 리포트
```

### Lint / 포맷

```bash
npm run lint    # ESLint 검사
npm run format  # Prettier 포맷
```

---

## 9. 배포 전략

### 환경 구분

| 환경 | 트리거 | URL |
|------|--------|-----|
| Production | `main` 브랜치 push | `https://tika.vercel.app` |
| Preview | PR 생성 / 커밋 push | `https://tika-<hash>.vercel.app` |

### 배포 흐름

```
git push origin main
  └─ Vercel CI: next build
        ├─ 빌드 성공 → 프로덕션 배포
        └─ 빌드 실패 → 배포 중단 (이전 버전 유지)
```

### 환경 변수 관리

- Vercel Dashboard → Settings → Environment Variables에서 관리
- Production / Preview / Development 환경별 분리 설정
- `.env.local`은 로컬 전용, git에 커밋하지 않음 (`.gitignore` 포함)

### DB 마이그레이션 정책

- 프로덕션 배포 전 마이그레이션 수동 실행 (`drizzle-kit migrate`)
- 스키마 변경은 항상 하위 호환성을 유지하거나 다운타임 없는 순차적 방식으로 적용

---

## 10. 코딩 컨벤션 요약

> 상세 내용은 `CLAUDE.md` 참조

| 항목 | 규칙 |
|------|------|
| TypeScript | strict 모드, `any` 금지, `unknown` + 타입 가드 사용 |
| 타입명 | I 접두사 없이 명사 (예: `Ticket`, `BoardData`) |
| enum 대체 | `const` 객체 + `typeof` 패턴 |
| 컴포넌트 | 함수 컴포넌트 + 화살표 함수, 파일명 PascalCase |
| 공유 타입 | 반드시 `@/shared/types`에서 import |
| TDD | Red → Green → Refactor 단계 엄수 |
