/**
 * @jest-environment node
 */

// TC-API-001: POST /api/tickets — 티켓 생성 (docs/TEST_CASES.md, docs/API_SPECS.md 참조)
// 구현 전 Red 단계 테스트 — app/api/tickets/route.ts가 아직 없으므로 전부 실패해야 한다.
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/tickets/route';

const postTickets = (body: unknown) =>
  POST(
    new NextRequest('http://localhost/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );

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
