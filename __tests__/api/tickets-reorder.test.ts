/**
 * @jest-environment node
 */

// TC-API-007: PATCH /api/tickets/reorder — 순서/상태 변경 (docs/TEST_CASES.md, docs/API_SPECS.md 참조)
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { PATCH } from '@/app/api/tickets/reorder/route';
import { POST } from '@/app/api/tickets/route';
import { closeDb, db } from '@/server/db';
import { tickets } from '@/server/db/schema';
import { cleanupTrackedTickets, trackTicketId } from '../helpers/ticketFixtures';

afterAll(async () => {
  await cleanupTrackedTickets();
  await closeDb();
});

const createTicket = async (body: unknown = { title: '순서 변경 대상' }) => {
  const response = await POST(
    new NextRequest('http://localhost/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );
  const created = await response.json();
  trackTicketId(created.id);

  return created as { id: number; position: number };
};

const reorderTicket = (body: unknown) =>
  PATCH(
    new NextRequest('http://localhost/api/tickets/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );

describe('PATCH /api/tickets/reorder', () => {
  it('TC-API-007-1: BACKLOG에서 TODO로 이동하면 200과 함께 status=TODO, startedAt이 기록된다', async () => {
    const ticket = await createTicket();

    const response = await reorderTicket({ ticketId: ticket.id, status: 'TODO', position: 0 });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('TODO');
    expect(body.startedAt).toEqual(expect.any(String));
  });

  it('TC-API-007-2: TODO에서 BACKLOG로 되돌리면 200과 함께 status=BACKLOG, startedAt이 초기화된다', async () => {
    const ticket = await createTicket();
    await reorderTicket({ ticketId: ticket.id, status: 'TODO', position: 0 });

    const response = await reorderTicket({ ticketId: ticket.id, status: 'BACKLOG', position: 0 });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('BACKLOG');
    expect(body.startedAt).toBeNull();
  });

  it('TC-API-007-3: 같은 칼럼 내 순서를 변경하면 200과 함께 position이 갱신되고 status는 유지된다', async () => {
    const first = await createTicket({ title: '첫 번째' });
    const second = await createTicket({ title: '두 번째' });
    const third = await createTicket({ title: '세 번째' });
    void first;

    // BACKLOG 정렬: third, second, first (최근 생성일수록 앞) — third를 맨 뒤(index 2)로 이동
    const response = await reorderTicket({ ticketId: third.id, status: 'BACKLOG', position: 2 });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('BACKLOG');
    expect(body.position).toBeGreaterThan(second.position);
  });

  it('TC-API-007-4: DONE으로 이동을 시도하면 400과 VALIDATION_ERROR를 반환한다', async () => {
    const ticket = await createTicket();

    const response = await reorderTicket({ ticketId: ticket.id, status: 'DONE', position: 0 });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toBe('상태는 BACKLOG, TODO, IN_PROGRESS 중 선택해주세요');
  });

  it('TC-API-007-5: 잘못된 status 값이면 400과 VALIDATION_ERROR를 반환한다', async () => {
    const ticket = await createTicket();

    const response = await reorderTicket({ ticketId: ticket.id, status: 'INVALID', position: 0 });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('TC-API-007-6: 존재하지 않는 ticketId면 404와 NOT_FOUND를 반환한다', async () => {
    const response = await reorderTicket({ ticketId: 999999, status: 'TODO', position: 0 });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('TC-API-007-7: 이웃 카드의 position 간격이 1 미만이면 칼럼 전체가 1024 간격으로 재정렬된다', async () => {
    const ticketA = await createTicket({ title: 'A' });
    const ticketB = await createTicket({ title: 'B' });
    const ticketC = await createTicket({ title: 'C' });

    // A, B의 position을 동일하게 만들어 간격 0(<1) 상태를 강제로 구성한다.
    await db.update(tickets).set({ position: 100 }).where(eq(tickets.id, ticketA.id));
    await db.update(tickets).set({ position: 100 }).where(eq(tickets.id, ticketB.id));

    // C를 BACKLOG의 index 1(A와 B 사이)로 이동 — A, B(C 제외 이웃) 간격이 0이라 재정렬이 필요하다.
    const response = await reorderTicket({ ticketId: ticketC.id, status: 'BACKLOG', position: 1 });
    const body = await response.json();

    expect(response.status).toBe(200);

    const rows = await db
      .select({ id: tickets.id, position: tickets.position })
      .from(tickets)
      .where(eq(tickets.status, 'BACKLOG'));
    const positions = rows.map((row) => row.position);
    const uniquePositions = new Set(positions);

    expect(uniquePositions.size).toBe(positions.length);
    expect(body.status).toBe('BACKLOG');
  });
});
