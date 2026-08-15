// SearchInput — Phase 1 (docs/COMPONENT_SPEC.md §2.2, MVP에서는 비활성 placeholder)
import { render, screen } from "@testing-library/react";
import { SearchInput } from "@/client/components/SearchInput";

describe("SearchInput", () => {
  it("disabled 속성이 적용된 input이 렌더링된다", () => {
    render(<SearchInput />);

    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("placeholder 텍스트가 표시된다", () => {
    render(<SearchInput />);

    expect(screen.getByPlaceholderText("검색 (2차 구현 예정)")).toBeInTheDocument();
  });
});
