import { NextRequest, NextResponse } from 'next/server';
import { reorderTicketSchema } from '@/shared/validations/ticket';
import { reorder } from '@/server/services/ticketService';

export const PATCH = async (request: NextRequest) => {
  const body: unknown = await request.json();
  const parsed = reorderTicketSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0].message,
        },
      },
      { status: 400 },
    );
  }

  const ticket = await reorder(parsed.data);

  if (!ticket) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: '티켓을 찾을 수 없습니다' } },
      { status: 404 },
    );
  }

  return NextResponse.json(ticket, { status: 200 });
};
