import { inArray } from 'drizzle-orm';
import { db } from '@/server/db';
import { tickets } from '@/server/db/schema';

// 통합 테스트가 실제 DB에 남긴 자기 자신의 데이터만 정리하기 위한 헬퍼.
// 헌장 가드레일(전체 DELETE·TRUNCATE 금지)을 지키기 위해 생성한 id만 targeted delete로 제거한다.
const createdIds: number[] = [];

export const trackTicketId = (id: number): void => {
  createdIds.push(id);
};

export const cleanupTrackedTickets = async (): Promise<void> => {
  if (createdIds.length === 0) return;
  await db.delete(tickets).where(inArray(tickets.id, createdIds));
  createdIds.length = 0;
};

// POST/PATCH API는 dueDate 과거 값이나 임의 status를 검증에서 막기 때문에,
// isOverdue 파생 필드처럼 API 경계를 우회한 데이터 상태가 필요한 테스트를 위한 직접 insert 헬퍼.
export const insertTicketRow = async (
  overrides: Partial<typeof tickets.$inferInsert> = {},
): Promise<typeof tickets.$inferSelect> => {
  const [row] = await db
    .insert(tickets)
    .values({
      title: '오버듀 테스트 티켓',
      status: 'BACKLOG',
      priority: 'MEDIUM',
      position: 0,
      ...overrides,
    })
    .returning();

  trackTicketId(row.id);

  return row;
};
