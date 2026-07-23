/**
 * @jest-environment node
 */

// TC-API-001: POST /api/tickets — 티켓 생성 (docs/TEST_CASES.md, docs/API_SPECS.md 참조)
// TC-API-002: GET /api/tickets — 보드 전체 조회 (docs/TEST_CASES.md, docs/API_SPECS.md 참조)
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/tickets/route';
import { closeDb, db } from '@/server/db';
import { tickets } from '@/server/db/schema';
import { cleanupTrackedTickets, trackTicketId } from '../helpers/ticketFixtures';

afterAll(async () => {
  await cleanupTrackedTickets();
  await closeDb();
});

// 생성에 성공한 티켓의 id는 자동으로 추적되어, 이 파일의 테스트가 끝나면(afterAll) 정리된다.
const postTickets = async (body: unknown) => {
  const response = await POST(
    new NextRequest('http://localhost/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );

  if (response.status === 201) {
    const created = await response.clone().json();
    trackTicketId(created.id);
  }

  return response;
};

// GET 테스트는 "빈 보드 조회"(TC-API-002-1)를 검증해야 하므로, 아직 아무것도 쓰지 않은 이
// 파일의 맨 앞(POST 테스트보다 먼저)에서 실행되어야 한다 — Jest는 한 파일 내에서
// describe/it을 선언 순서대로 순차 실행하므로 순서를 보장할 수 있다.
describe('GET /api/tickets', () => {
  it('TC-API-002-1: 빈 보드를 조회하면 200과 함께 모든 칼럼이 빈 배열인 객체를 반환한다', async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ backlog: [], todo: [], inProgress: [], done: [] });
  });

  it('TC-API-002-2: 티켓이 있는 보드를 조회하면 각 칼럼에 position 오름차순으로 정렬된 티켓 배열을 반환한다', async () => {
    await postTickets({ title: '첫 번째' });
    await postTickets({ title: '두 번째' });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.backlog.map((ticket: { title: string }) => ticket.title)).toEqual([
      '두 번째',
      '첫 번째',
    ]);
    expect(body.backlog[0].position).toBeLessThan(body.backlog[1].position);
  });

  it('TC-API-002-3: completedAt이 25시간 지난 DONE 티켓은 done 배열에 포함되지 않는다', async () => {
    const createResponse = await postTickets({ title: '오래된 완료 티켓' });
    const created = await createResponse.json();
    const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);

    await db
      .update(tickets)
      .set({ status: 'DONE', completedAt: twentyFiveHoursAgo })
      .where(eq(tickets.id, created.id));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.done.find((ticket: { id: number }) => ticket.id === created.id)).toBeUndefined();
  });
});

describe('POST /api/tickets', () => {
  // 1. 모든 필드를 포함한 정상 생성 -> 201
  it('TC-API-001-2: 전체 필드로 생성 성공 시 201과 입력 필드가 모두 포함된 티켓을 반환한다', async () => {
    const requestBody = {
      title: '로그인 페이지 디자인',
      description: 'OAuth 소셜 로그인 포함',
      priority: 'HIGH',
      plannedStartDate: '2026-07-01',
      dueDate: '2026-12-31',
    };

    const response = await postTickets(requestBody);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toMatchObject({
      title: requestBody.title,
      description: requestBody.description,
      status: 'BACKLOG',
      priority: 'HIGH',
      plannedStartDate: requestBody.plannedStartDate,
      dueDate: requestBody.dueDate,
      startedAt: null,
      completedAt: null,
      isOverdue: false,
    });
    expect(body.id).toEqual(expect.any(Number));
    expect(body.position).toBeLessThanOrEqual(0);
    expect(body.createdAt).toEqual(expect.any(String));
    expect(body.updatedAt).toEqual(expect.any(String));
  });

  // 2. 제목만으로 최소 생성 -> 201, priority가 MEDIUM
  it('TC-API-001-1: title만으로 생성 성공 시 201과 함께 status=BACKLOG, priority=MEDIUM을 반환한다', async () => {
    const response = await postTickets({ title: '할 일' });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.title).toBe('할 일');
    expect(body.status).toBe('BACKLOG');
    expect(body.priority).toBe('MEDIUM');
    expect(body.position).toBeLessThanOrEqual(0);
  });

  // 3. 제목 누락 -> 400, "제목을 입력해주세요"
  it('TC-API-001-3: title이 없으면 400과 "제목을 입력해주세요" 메시지를 반환한다', async () => {
    const response = await postTickets({});
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toBe('제목을 입력해주세요');
  });

  // 4. 제목 공백만 입력 -> 400
  it('TC-API-001-4: title이 공백 문자로만 구성되면 400과 "제목을 입력해주세요" 메시지를 반환한다', async () => {
    const response = await postTickets({ title: '   ' });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toBe('제목을 입력해주세요');
  });

  // 5. 제목 200자 초과 -> 400
  it('TC-API-001-5: title이 200자를 초과하면 400과 "제목은 200자 이내로 입력해주세요" 메시지를 반환한다', async () => {
    const response = await postTickets({ title: 'a'.repeat(201) });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toBe('제목은 200자 이내로 입력해주세요');
  });

  // 6. 설명 1000자 초과 -> 400
  it('TC-API-001-6: description이 1000자를 초과하면 400과 "설명은 1000자 이내로 입력해주세요" 메시지를 반환한다', async () => {
    const response = await postTickets({ title: 't', description: 'a'.repeat(1001) });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toBe('설명은 1000자 이내로 입력해주세요');
  });

  // 7. 과거 마감일 -> 400
  it('TC-API-001-8: dueDate가 과거 날짜면 400과 "종료예정일은 오늘 이후 날짜를 선택해주세요" 메시지를 반환한다', async () => {
    const response = await postTickets({ title: 't', dueDate: '2020-01-01' });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toBe('종료예정일은 오늘 이후 날짜를 선택해주세요');
  });

  // 8. 잘못된 우선순위 값 -> 400
  it('TC-API-001-7: priority가 유효하지 않으면 400과 "우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요" 메시지를 반환한다', async () => {
    const response = await postTickets({ title: 't', priority: 'URGENT' });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toBe('우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요');
  });
});
