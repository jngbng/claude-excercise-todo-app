import { NextRequest, NextResponse } from 'next/server';
import { complete } from '@/server/services/ticketService';

type RouteContext = { params: Promise<{ id: string }> };

export const PATCH = async (_request: NextRequest, { params }: RouteContext) => {
  const { id } = await params;
  const numericId = Number(id);
  const ticket = Number.isInteger(numericId) ? await complete(numericId) : null;

  if (!ticket) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: '티켓을 찾을 수 없습니다' } },
      { status: 404 },
    );
  }

  return NextResponse.json(ticket, { status: 200 });
};
