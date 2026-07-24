import { NextRequest, NextResponse } from 'next/server';
import { updateTicketSchema } from '@/shared/validations/ticket';
import { getById, remove, update } from '@/server/services/ticketService';

type RouteContext = { params: Promise<{ id: string }> };

const parseId = async (params: RouteContext['params']): Promise<number | null> => {
  const { id } = await params;
  const numericId = Number(id);

  return Number.isInteger(numericId) ? numericId : null;
};

const notFoundResponse = () =>
  NextResponse.json(
    { error: { code: 'NOT_FOUND', message: '티켓을 찾을 수 없습니다' } },
    { status: 404 },
  );

export const GET = async (_request: NextRequest, { params }: RouteContext) => {
  const id = await parseId(params);
  const ticket = id === null ? null : await getById(id);

  if (!ticket) {
    return notFoundResponse();
  }

  return NextResponse.json(ticket, { status: 200 });
};

export const PATCH = async (request: NextRequest, { params }: RouteContext) => {
  const id = await parseId(params);
  const body: unknown = await request.json();
  const parsed = updateTicketSchema.safeParse(body);

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

  const ticket = id === null ? null : await update(id, parsed.data);

  if (!ticket) {
    return notFoundResponse();
  }

  return NextResponse.json(ticket, { status: 200 });
};

export const DELETE = async (_request: NextRequest, { params }: RouteContext) => {
  const id = await parseId(params);
  const deleted = id === null ? false : await remove(id);

  if (!deleted) {
    return notFoundResponse();
  }

  return new NextResponse(null, { status: 204 });
};
