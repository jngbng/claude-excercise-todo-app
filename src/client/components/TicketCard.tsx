"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TicketWithMeta } from "@/shared/types";
import { PriorityBadge } from "@/client/components/ui/PriorityBadge";
import { DueDateBadge } from "@/client/components/ui/DueDateBadge";

type TicketCardProps = {
  ticket: TicketWithMeta;
  onClick: () => void;
};

const BASE_CLASS = "rounded-card bg-surface-card p-3 shadow-card hover:shadow-card-hover";
const DRAGGING_CLASS = "opacity-50 shadow-card-dragging";
const OVERDUE_CLASS = "border border-danger";

export const TicketCard = ({ ticket, onClick }: TicketCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ticket.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      onClick();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      aria-label={`티켓: ${ticket.title}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={[BASE_CLASS, isDragging && DRAGGING_CLASS, ticket.isOverdue && OVERDUE_CLASS]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="truncate text-sm font-bold text-text-primary">{ticket.title}</p>
      <div className="mt-2 flex items-center gap-2">
        <PriorityBadge priority={ticket.priority} />
        {ticket.dueDate && <DueDateBadge dueDate={ticket.dueDate} isOverdue={ticket.isOverdue} />}
        {ticket.isOverdue && (
          <span data-testid="overdue-warning" className="text-xs text-danger" aria-hidden="true">
            ⚠
          </span>
        )}
        {ticket.status === "DONE" && (
          <span data-testid="ticket-complete-mark" className="text-xs text-priority-low">
            완료 ✓
          </span>
        )}
      </div>
    </div>
  );
};
