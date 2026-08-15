// FilterBar — Phase 1 (docs/COMPONENT_SPEC.md §2.3, TC-COMP-007)
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterBar } from "@/client/components/FilterBar";

describe("FilterBar", () => {
  it("TC-COMP-007-1: [이번주 업무]/[일정 초과] 두 버튼이 렌더링된다", () => {
    render(
      <FilterBar
        activeFilter="all"
        onFilterChange={jest.fn()}
        counts={{ thisWeek: 0, overdue: 0 }}
      />,
    );

    expect(screen.getByRole("button", { name: /이번주 업무/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /일정 초과/ })).toBeInTheDocument();
  });

  it("TC-COMP-007-2: [이번주 업무] 클릭 시 onFilterChange('thisWeek')가 호출되고 강조 스타일이 적용된다", async () => {
    const user = userEvent.setup();
    const handleFilterChange = jest.fn();
    render(
      <FilterBar
        activeFilter="all"
        onFilterChange={handleFilterChange}
        counts={{ thisWeek: 0, overdue: 0 }}
      />,
    );

    await user.click(screen.getByRole("button", { name: /이번주 업무/ }));

    expect(handleFilterChange).toHaveBeenCalledWith("thisWeek");
  });

  it("활성 필터 버튼은 primary variant(강조 스타일)로 렌더링된다", () => {
    render(
      <FilterBar
        activeFilter="thisWeek"
        onFilterChange={jest.fn()}
        counts={{ thisWeek: 0, overdue: 0 }}
      />,
    );

    expect(screen.getByRole("button", { name: /이번주 업무/ })).toHaveClass("bg-brand-500", "text-white");
    expect(screen.getByRole("button", { name: /일정 초과/ })).not.toHaveClass("bg-brand-500");
  });

  it("TC-COMP-007-3: 이미 활성화된 필터를 재클릭하면 onFilterChange('all')이 호출된다", async () => {
    const user = userEvent.setup();
    const handleFilterChange = jest.fn();
    render(
      <FilterBar
        activeFilter="thisWeek"
        onFilterChange={handleFilterChange}
        counts={{ thisWeek: 0, overdue: 0 }}
      />,
    );

    await user.click(screen.getByRole("button", { name: /이번주 업무/ }));

    expect(handleFilterChange).toHaveBeenCalledWith("all");
  });

  it("TC-COMP-007-4: 다른 필터로 전환하면 onFilterChange('overdue')가 호출된다", async () => {
    const user = userEvent.setup();
    const handleFilterChange = jest.fn();
    render(
      <FilterBar
        activeFilter="thisWeek"
        onFilterChange={handleFilterChange}
        counts={{ thisWeek: 0, overdue: 0 }}
      />,
    );

    await user.click(screen.getByRole("button", { name: /일정 초과/ }));

    expect(handleFilterChange).toHaveBeenCalledWith("overdue");
  });

  it("counts prop 값이 각 버튼에 표시된다", () => {
    render(
      <FilterBar
        activeFilter="all"
        onFilterChange={jest.fn()}
        counts={{ thisWeek: 3, overdue: 5 }}
      />,
    );

    expect(screen.getByRole("button", { name: /이번주 업무/ })).toHaveTextContent("3");
    expect(screen.getByRole("button", { name: /일정 초과/ })).toHaveTextContent("5");
  });
});
