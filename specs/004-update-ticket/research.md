# Research: 티켓 수정 (PATCH /api/tickets/:id)

**입력**: [spec.md](./spec.md), `.specify/memory/constitution.md`, `docs/API_SPECS.md`

## 수정용 Zod 스키마 설계 — 생성용과의 차이

**Decision**: 새 `updateTicketSchema`를 정의한다. 생성용 `createTicketSchema`와 달리 모든
필드를 `.optional()`로 두고, `title`에는 `required_error`/기본값을 두지 않으며, `priority`도
기본값(`MEDIUM`)을 적용하지 않는다(수정 시 기본값을 강제로 채우면 안 보낸 필드까지 덮어쓰게
된다).

```typescript
title: z.string().trim().min(1, ...).max(200, ...).optional()
description: z.string().max(1000, ...).nullable().optional()
priority: z.enum(['LOW','MEDIUM','HIGH'], ...).optional()  // 기본값 없음
plannedStartDate: dateString.nullable().optional()
dueDate: dateString.nullable().optional().refine(...)      // 오늘 이후 규칙은 동일
```

**Rationale**: `docs/API_SPECS.md`의 PATCH 필드 표가 모든 필드를 "필수 아님, 기본값 없음"으로
명시한다. 헌장 원칙 IV(Zod로만 검증)를 지키면서도 생성과 수정의 의미가 다르므로(수정은
"보낸 것만 바꾼다") 스키마를 분리해야 한다.

**Alternatives considered**: `createTicketSchema.partial()` 재사용 — `.partial()`은
`required_error`/`default()` 설정을 그대로 남겨 의도치 않게 `priority` 기본값을 채우는 등
동작이 달라질 위험이 있어 기각. 필드가 5개뿐이라 명시적으로 새로 작성하는 편이 더 명확하다.

## null(삭제) vs 미전송(유지) 구분

**Decision**: Zod 파싱 결과 객체에서 `'description' in parsed.data`처럼 **키의 존재 여부**로
판단한다. JSON에서 필드를 아예 보내지 않으면 파싱 결과에도 그 키가 없고, `null`을 명시적으로
보내면 키는 존재하되 값이 `null`이다. 서비스 함수 `update()`는 각 필드에 대해 `'field' in
input`을 확인해, 존재하는 필드만 DB `UPDATE`의 `SET` 대상에 포함시킨다(`description` 등
nullable 필드는 `input.description ?? null`로 매핑).

**Rationale**: Zod 객체 스키마는 입력에 없는 키를 기본적으로 결과에도 포함시키지 않으므로,
`in` 연산자로 "전송 여부"를 신뢰성 있게 구분할 수 있다. Drizzle의 `.set()`은 전달된 객체의
키만 컬럼을 갱신하므로, 이 방식이 "보낸 필드만 갱신"을 정확히 구현한다.

**Alternatives considered**: 모든 필드에 `undefined` 기본값을 주고 `!== undefined`로 검사 —
Zod가 이미 키 존재 여부로 이 구분을 제공하므로 불필요한 우회.

## 계층 분리·404 처리 (003과 동일 컨벤션)

**Decision**: `update(id, input)`은 존재하지 않으면 `null`을 반환하고, Route Handler가 이를
404로 변환한다 — 003에서 확정한 패턴을 그대로 재사용한다.

**Rationale**: 헌장 원칙 III, V. 003에서 만든 `parseId`/`notFoundResponse` 헬퍼를
`app/api/tickets/[id]/route.ts` 내에서 `PATCH`에도 그대로 재사용한다.
