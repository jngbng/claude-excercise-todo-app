// DueDateBadge — 공통 UI 프리미티브 (docs/COMPONENT_SPEC.md §3 DueDateBadge 참조)
// TEST_CASES.md 미기재 컴포넌트 — 아래 계약은 이 테스트가 정의하며,
// Green 단계 구현은 이 클래스를 그대로 적용해야 한다.
import { render, screen } from "@testing-library/react";
import { DueDateBadge } from "@/client/components/ui/DueDateBadge";

describe("DueDateBadge", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-08-15"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("dueDate를 YYYY-MM-DD 형식으로 표시한다", () => {
    render(<DueDateBadge dueDate="2026-08-20" />);

    expect(screen.getByText("2026-08-20")).toBeInTheDocument();
  });

  it("dueDate가 오늘보다 이전이면(over-due) 붉은색 텍스트 클래스가 적용된다", () => {
    render(<DueDateBadge dueDate="2026-08-14" />);

    expect(screen.getByText("2026-08-14")).toHaveClass("text-danger");
  });

  it("dueDate가 오늘이거나 이후면(before-due) 회색 텍스트 클래스가 적용된다", () => {
    render(<DueDateBadge dueDate="2026-08-15" />);

    expect(screen.getByText("2026-08-15")).toHaveClass("text-text-secondary");
  });
});
