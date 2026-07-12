import { NextRequest, NextResponse } from 'next/server';
import { createTicketSchema } from '@/shared/validations/ticket';
import { create } from '@/server/services/ticketService';

export const POST = async (request: NextRequest) => {
  const body: unknown = await request.json();
  const parsed = createTicketSchema.safeParse(body);

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

  const ticket = await create(parsed.data);

  return NextResponse.json(ticket, { status: 201 });
};
