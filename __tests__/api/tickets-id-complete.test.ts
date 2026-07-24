/**
 * @jest-environment node
 */

// TC-API-005: PATCH /api/tickets/:id/complete — 완료 처리 (docs/TEST_CASES.md, docs/API_SPECS.md 참조)
import { NextRequest } from 'next/server';
import { PATCH } from '@/app/api/tickets/[id]/complete/route';
import { POST } from '@/app/api/tickets/route';
import { closeDb } from '@/server/db';
import { cleanupTrackedTickets, trackTicketId } from '../helpers/ticketFixtures';

afterAll(async () => {
  await cleanupTrackedTickets();
  await closeDb();
});

const createTicket = async (body: unknown = { title: '완료 처리 대상' }) => {
  const response = await POST(
    new NextRequest('http://localhost/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );
  const created = await response.json();
  trackTicketId(created.id);

  return created as { id: number };
};

const completeTicket = (id: number | string) =>
  PATCH(new NextRequest(`http://localhost/api/tickets/${id}/complete`, { method: 'PATCH' }), {
    params: Promise.resolve({ id: String(id) }),
  });

describe('PATCH /api/tickets/:id/complete', () => {
  it('TC-API-005-1: DONE이 아닌 티켓을 완료 처리하면 200과 함께 status=DONE, completedAt이 설정된다', async () => {
    const ticket = await createTicket();

    const response = await completeTicket(ticket.id);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('DONE');
    expect(body.completedAt).toEqual(expect.any(String));
  });

  it('TC-API-005-2: DONE 티켓을 다시 호출하면 200과 함께 status=IN_PROGRESS, completedAt=null로 복귀한다', async () => {
    const ticket = await createTicket();
    await completeTicket(ticket.id);

    const response = await completeTicket(ticket.id);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('IN_PROGRESS');
    expect(body.completedAt).toBeNull();
  });

  it('TC-API-005-3: 존재하지 않는 ID를 완료 처리하려 하면 404와 NOT_FOUND를 반환한다', async () => {
    const response = await completeTicket(999999);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });
});
