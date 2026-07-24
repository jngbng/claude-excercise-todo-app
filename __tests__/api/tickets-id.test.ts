/**
 * @jest-environment node
 */

// TC-API-003: GET /api/tickets/:id — 단건 조회 (docs/TEST_CASES.md, docs/API_SPECS.md 참조)
// TC-API-004: PATCH /api/tickets/:id — 티켓 수정 (docs/TEST_CASES.md, docs/API_SPECS.md 참조)
import { NextRequest } from 'next/server';
import { GET, PATCH } from '@/app/api/tickets/[id]/route';
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

const patchTicket = (id: number | string, body: unknown) =>
  PATCH(
    new NextRequest(`http://localhost/api/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id: String(id) }) },
  );

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

describe('PATCH /api/tickets/:id', () => {
  it('TC-API-004-1: title만 수정하면 200과 함께 title만 변경되고 나머지 필드는 유지된다', async () => {
    const ticket = await createTicket({ title: '원래 제목', priority: 'HIGH' });

    const response = await patchTicket(ticket.id, { title: '새 제목' });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.title).toBe('새 제목');
    expect(body.priority).toBe('HIGH');
  });

  it('TC-API-004-2: description을 null로 전송하면 200과 함께 description이 삭제된다', async () => {
    const ticket = await createTicket({ title: '설명 있음', description: '설명 내용' });

    const response = await patchTicket(ticket.id, { description: null });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.description).toBeNull();
  });

  it('TC-API-004-3: 복수 필드를 동시에 수정하면 200과 함께 전송한 필드가 모두 갱신된다', async () => {
    const ticket = await createTicket({ title: '원래 제목', priority: 'LOW' });

    const response = await patchTicket(ticket.id, {
      title: '복수 수정',
      priority: 'HIGH',
      dueDate: '2026-12-31',
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.title).toBe('복수 수정');
    expect(body.priority).toBe('HIGH');
    expect(body.dueDate).toBe('2026-12-31');
  });

  it('TC-API-004-4: 존재하지 않는 ID를 수정하려 하면 404와 NOT_FOUND를 반환한다', async () => {
    const response = await patchTicket(999999, { title: '아무거나' });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('TC-API-004-5: title이 200자를 초과하면 400과 VALIDATION_ERROR를 반환한다', async () => {
    const ticket = await createTicket();

    const response = await patchTicket(ticket.id, { title: 'a'.repeat(201) });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('TC-API-004-6: dueDate가 과거 날짜면 400과 VALIDATION_ERROR를 반환한다', async () => {
    const ticket = await createTicket();

    const response = await patchTicket(ticket.id, { dueDate: '2020-01-01' });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});
