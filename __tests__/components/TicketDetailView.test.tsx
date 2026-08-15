// TicketDetailView — Phase 1 (docs/COMPONENT_SPEC.md §2.7 표시 필드 기준, 읽기 전용 필드)
import { render, screen } from "@testing-library/react";
import { TicketDetailView } from "@/client/components/TicketDetailView";

describe("TicketDetailView", () => {
  it("status, startedAt, completedAt, createdAt 값이 화면에 표시된다", () => {
    render(
      <TicketDetailView
        status="IN_PROGRESS"
        startedAt="2026-08-01T09:00:00.000Z"
        completedAt="2026-08-10T18:00:00.000Z"
        createdAt="2026-07-30T12:00:00.000Z"
      />,
    );

    expect(screen.getByText("IN_PROGRESS")).toBeInTheDocument();
    expect(screen.getByText("2026-08-01")).toBeInTheDocument();
    expect(screen.getByText("2026-08-10")).toBeInTheDocument();
    expect(screen.getByText("2026-07-30")).toBeInTheDocument();
  });

  it("startedAt/completedAt이 null이면 '-'로 표시된다", () => {
    render(
      <TicketDetailView
        status="BACKLOG"
        startedAt={null}
        completedAt={null}
        createdAt="2026-07-30T12:00:00.000Z"
      />,
    );

    expect(screen.getAllByText("-")).toHaveLength(2);
  });

  it("편집 UI(입력/버튼)가 전혀 없다", () => {
    render(
      <TicketDetailView
        status="DONE"
        startedAt="2026-08-01T09:00:00.000Z"
        completedAt="2026-08-10T18:00:00.000Z"
        createdAt="2026-07-30T12:00:00.000Z"
      />,
    );

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
