# Data Model: 티켓 생성 (POST /api/tickets)

**입력**: [spec.md](./spec.md) 주요 엔터티, `docs/DATA_MODEL.md`

## Ticket

칸반 보드의 작업 단위. 이 기능(생성)은 아래 필드 중 사용자가 입력 가능한 항목만 받아들이고,
나머지는 서버가 파생·자동 설정한다.

| 필드 | 타입 | 생성 시 출처 | 제약 |
|------|------|--------------|------|
| `id` | `number` | 서버 자동 생성 (DB sequence) | — |
| `title` | `string` | 사용자 입력 (필수) | trim 후 1~200자, 공백만 불가 |
| `description` | `string \| null` | 사용자 입력 (선택) | 최대 1000자, 미입력 시 `null` |
| `status` | `'BACKLOG' \| 'TODO' \| 'IN_PROGRESS' \| 'DONE'` | 서버 고정값 | 생성 시 항상 `BACKLOG` |
| `priority` | `'LOW' \| 'MEDIUM' \| 'HIGH'` | 사용자 입력 (선택) | 미입력 시 기본값 `MEDIUM` |
| `position` | `number` | 서버 계산 | BACKLOG 칼럼 최솟값 - 1024, 칼럼이 비어 있으면 `0` |
| `plannedStartDate` | `string \| null` (`YYYY-MM-DD`) | 사용자 입력 (선택) | 미입력 시 `null` |
| `dueDate` | `string \| null` (`YYYY-MM-DD`) | 사용자 입력 (선택) | 오늘 이후 날짜만 허용, 미입력 시 `null` |
| `startedAt` | `string \| null` (ISO 8601) | 서버 고정값 | 생성 시 항상 `null` |
| `completedAt` | `string \| null` (ISO 8601) | 서버 고정값 | 생성 시 항상 `null` |
| `createdAt` | `string` (ISO 8601) | 서버 자동 생성 | — |
| `updatedAt` | `string` (ISO 8601) | 서버 자동 생성 | — |
| `isOverdue` | `boolean` | 서버 파생(DB 미저장) | `dueDate < 오늘 && status !== 'DONE'` |

### 상태 전이 (이 기능 범위)

생성 시점에는 전이가 없다 — 티켓은 항상 `BACKLOG` 상태로 시작한다. 다른 상태로의 전이는 별도
기능(수정, 드래그앤드롭, 완료 처리)의 책임이며 이 계획의 범위 밖이다.

### 검증 규칙 (FR-001 ~ FR-002 매핑)

- `title`: trim 후 길이 1~200 (공백만 입력 시 길이 0으로 취급되어 거부됨)
- `description`: 길이 0~1000, `null`/미입력 허용
- `priority`: `LOW` \| `MEDIUM` \| `HIGH` 중 하나, 그 외 값은 거부
- `dueDate`: 형식이 `YYYY-MM-DD`이고 오늘 이후여야 함

기존 구현 참고: 위 규칙은 이미 `src/shared/validations/ticket.ts`의 `createTicketSchema`(Zod)로
구현되어 있으며, DB 테이블 정의는 `src/server/db/schema.ts`, 공유 타입은
`src/shared/types/index.ts`에 있다.
