import { NextRequest, NextResponse } from 'next/server';
import { getById } from '@/server/services/ticketService';

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
