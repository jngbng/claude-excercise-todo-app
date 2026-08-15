import type { TicketPriority } from "@/shared/types";

type PriorityBadgeProps = {
  priority: TicketPriority;
};

const BASE_CLASS = "text-xs px-2 py-0.5 rounded-full font-medium";

const PRIORITY_CLASS: Record<TicketPriority, string> = {
  LOW: "bg-priority-low/10 text-priority-low",
  MEDIUM: "bg-priority-medium/10 text-priority-medium",
  HIGH: "bg-priority-high/10 text-priority-high",
};

export const PriorityBadge = ({ priority }: PriorityBadgeProps) => {
  return <span className={`${BASE_CLASS} ${PRIORITY_CLASS[priority]}`}>{priority}</span>;
};
