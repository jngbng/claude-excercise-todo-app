/**
 * @jest-environment node
 */

// TC-API-003: GET /api/tickets/:id — 단건 조회 (docs/TEST_CASES.md, docs/API_SPECS.md 참조)
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/tickets/[id]/route';
import { POST } from '@/app/api/tickets/route';
import { closeDb } from '@/server/db';
import { cleanupTrackedTickets, trackTicketId } from '../helpers/ticketFixtures';

afterAll(async () => {
  await cleanupTrackedTickets();
  await closeDb();
});

const createTicket = async (body: unknown = { title: '테스트 티켓' }) => {
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

const getTicket = (id: number | string) =>
  GET(new NextRequest(`http://localhost/api/tickets/${id}`), {
    params: Promise.resolve({ id: String(id) }),
  });

describe('GET /api/tickets/:id', () => {
  it('TC-API-003-1: 존재하는 티켓을 조회하면 200과 함께 티켓 전체 객체를 반환한다', async () => {
    const ticket = await createTicket({ title: '단건 조회 대상' });

    const response = await getTicket(ticket.id);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ id: ticket.id, title: '단건 조회 대상', isOverdue: false });
  });

  it('TC-API-003-2: 존재하지 않는 ID를 조회하면 404와 NOT_FOUND를 반환한다', async () => {
    const response = await getTicket(999999);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });
});
