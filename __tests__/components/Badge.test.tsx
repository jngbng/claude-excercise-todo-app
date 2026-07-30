// Badge — 공통 UI 프리미티브 (docs/COMPONENT_SPEC.md §3 Badge, docs/FRONTEND_TASKS.md Phase 0 참조)
// TEST_CASES.md 미기재 컴포넌트 — 아래 priority별 클래스 매핑은 이 테스트가 정의하는 계약이며,
// Green 단계 구현은 이 클래스를 그대로 적용해야 한다.
import { render, screen } from "@testing-library/react";
import { Badge } from "@/client/components/Badge";

const PRIORITY_CLASSES = {
  LOW: ["bg-priority-low/10", "text-priority-low"],
  MEDIUM: ["bg-priority-medium/10", "text-priority-medium"],
  HIGH: ["bg-priority-high/10", "text-priority-high"],
} as const;

describe("Badge", () => {
  describe.each(Object.entries(PRIORITY_CLASSES))("priority=%s", (priority, classes) => {
    it(`priority="${priority}"이면 해당 색상 클래스와 "${priority}" 텍스트가 표시된다`, () => {
      render(<Badge priority={priority as keyof typeof PRIORITY_CLASSES} />);

      const badge = screen.getByText(priority);
      expect(badge).toHaveClass(...classes);
    });
  });
});
