// Phase 5 page.tsx (FRONTEND_TASKS.md, TEST_CASES.md 미기재)
// 서버 컴포넌트(async function)이므로 직접 호출해 반환된 엘리먼트를 렌더링하는 방식으로 검증한다.
import { render, screen } from "@testing-library/react";
import BoardPage from "@/app/page";
import { getBoard } from "@/server/services/ticketService";
import type { BoardData } from "@/shared/types";

jest.mock("@/server/services/ticketService", () => ({
  getBoard: jest.fn(),
}));

const mockedGetBoard = getBoard as jest.MockedFunction<typeof getBoard>;

const sampleBoard: BoardData = {
  backlog: [
    {
      id: 1,
      title: "샘플 티켓",
      description: null,
      status: "BACKLOG",
      priority: "MEDIUM",
      position: 0,
      plannedStartDate: null,
      dueDate: null,
      startedAt: null,
      completedAt: null,
      createdAt: "2026-08-01T00:00:00.000Z",
      updatedAt: "2026-08-01T00:00:00.000Z",
      isOverdue: false,
    },
  ],
  todo: [],
  inProgress: [],
  done: [],
};

describe("BoardPage", () => {
  it("getBoard 성공 시 조회한 보드 데이터를 BoardContainer에 전달해 렌더링한다", async () => {
    mockedGetBoard.mockResolvedValue(sampleBoard);

    render(await BoardPage());

    expect(screen.getByText("샘플 티켓")).toBeInTheDocument();
  });

  it("getBoard 실패 시 페이지가 크래시하지 않고 빈 보드로 폴백한다", async () => {
    mockedGetBoard.mockRejectedValue(new Error("DB 연결 실패"));

    render(await BoardPage());

    expect(screen.getByText("BACKLOG")).toBeInTheDocument();
    expect(screen.getAllByText("이 칼럼에 티켓이 없습니다").length).toBeGreaterThan(0);
  });
});
