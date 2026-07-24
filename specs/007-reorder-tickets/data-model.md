# Data Model: 드래그앤드롭 상태·순서 변경 (PATCH /api/tickets/reorder)

## 상태 전이 (이 기능 범위)

```text
BACKLOG ──(reorder: TODO)──▶ TODO ──(reorder: IN_PROGRESS)──▶ IN_PROGRESS
   ▲                            │
   └────(reorder: BACKLOG)──────┘
```

`DONE`으로의 진입·복귀는 이 기능의 범위 밖이다(별도 완료 처리 기능, `specs/006-complete-ticket/`).

## 파생 필드 갱신 규칙

| 필드 | 갱신 조건 | 값 |
|------|-----------|-----|
| `startedAt` | 어느 상태에서든 `TODO` 진입 | 현재 시각 |
| `startedAt` | `TODO`에서 `BACKLOG` 복귀 | `null` |
| `startedAt` | 그 외 이동 | 변경 없음(필드 자체를 갱신 대상에서 제외) |
| `updatedAt` | 모든 이동 | Drizzle `$onUpdate`로 자동 갱신 |

## position 재계산

입력: `ticketId`(이동 대상), `status`(대상 칼럼), `position`(대상 칼럼 내 0-based 삽입
인덱스 — 이동 대상 자신은 제외한 기존 카드 기준. `research.md` 참고).

```text
1. 대상 칼럼(status)에서 ticketId를 제외한 카드들을 position 오름차순으로 조회 → neighbors
2. index를 [0, neighbors.length] 범위로 clamp
3. prev = neighbors[index-1] (있으면), next = neighbors[index] (있으면)
4. prev도 next도 없음        → position = 0
5. prev만 없음 (맨 앞 삽입)   → position = next.position - 1024
6. next만 없음 (맨 뒤 삽입)   → position = prev.position + 1024
7. 둘 다 있고 간격 >= 1       → position = round((prev.position + next.position) / 2)
8. 둘 다 있고 간격 < 1        → 재정렬: neighbors에 ticketId를 index 위치에 끼워 넣은 뒤
                                 전체를 0, 1024, 2048 ... 순으로 재배치
                                 (ticketId 자신의 최종 position도 이 재배치 결과를 따른다)
```

이 계산과 이후의 상태·startedAt 갱신은 하나의 DB 트랜잭션으로 묶인다.

## 검증 실패 조건 (400 VALIDATION_ERROR)

- `status`가 `DONE`이거나 `BACKLOG`/`TODO`/`IN_PROGRESS`/`DONE` 중 어디에도 속하지 않는 값

## 404 조건

- `ticketId`에 해당하는 티켓이 존재하지 않음
