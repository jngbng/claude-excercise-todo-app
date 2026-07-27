/**
 * @jest-environment node
 */

// TC-API-008: isOverdue 파생 필드 (docs/TEST_CASES.md, docs/API_SPECS.md 참조)
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/tickets/[id]/route';
import { closeDb } from '@/server/db';
import { cleanupTrackedTickets, insertTicketRow } from '../helpers/ticketFixtures';

afterAll(async () => {
  await cleanupTrackedTickets();
  await closeDb();
});

const getTicket = (id: number) =>
  GET(new NextRequest(`http://localhost/api/tickets/${id}`), {
    params: Promise.resolve({ id: String(id) }),
  });

describe('isOverdue 파생 필드', () => {
  it('TC-API-008-1: dueDate가 지났고 미완료 상태면 isOverdue=true', async () => {
    const row = await insertTicketRow({ status: 'IN_PROGRESS', dueDate: '2020-01-01' });

    const response = await getTicket(row.id);
    const body = await response.json();

    expect(body.isOverdue).toBe(true);
  });

  it('TC-API-008-2: dueDate가 지났어도 DONE 상태면 isOverdue=false', async () => {
    const row = await insertTicketRow({
      status: 'DONE',
      dueDate: '2020-01-01',
      completedAt: new Date(),
    });

    const response = await getTicket(row.id);
    const body = await response.json();

    expect(body.isOverdue).toBe(false);
  });

  it('TC-API-008-3: dueDate가 없으면 isOverdue=false', async () => {
    const row = await insertTicketRow({ status: 'IN_PROGRESS', dueDate: null });

    const response = await getTicket(row.id);
    const body = await response.json();

    expect(body.isOverdue).toBe(false);
  });

  it('TC-API-008-4: dueDate가 오늘 이후면 isOverdue=false', async () => {
    const row = await insertTicketRow({ status: 'BACKLOG', dueDate: '2099-01-01' });

    const response = await getTicket(row.id);
    const body = await response.json();

    expect(body.isOverdue).toBe(false);
  });
});
