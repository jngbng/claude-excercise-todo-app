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
