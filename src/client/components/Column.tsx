"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { TicketStatus, TicketWithMeta } from "@/shared/types";
import { TicketCard } from "@/client/components/TicketCard";

type ColumnProps = {
  status: TicketStatus;
  tickets: TicketWithMeta[];
  onTicketClick: (ticket: TicketWithMeta) => void;
};

const COLUMN_LABEL: Record<TicketStatus, string> = {
  BACKLOG: "BACKLOG",
  TODO: "TODO",
  IN_PROGRESS: "IN PROGRESS",
  DONE: "DONE",
};

// 칼럼별 파스텔 배경 (docs/DESIGN_SYSTEM.md §4, src/shared/design/colors.json)
const COLUMN_BG: Record<TicketStatus, string> = {
  BACKLOG: "bg-column-backlog",
  TODO: "bg-column-todo",
  IN_PROGRESS: "bg-column-in-progress",
  DONE: "bg-column-done",
};

const COLUMN_ACCENT_TEXT: Record<TicketStatus, string> = {
  BACKLOG: "text-column-accent-backlog",
  TODO: "text-column-accent-todo",
  IN_PROGRESS: "text-column-accent-in-progress",
  DONE: "text-column-accent-done",
};

export const Column = ({ status, tickets, onTicketClick }: ColumnProps) => {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div ref={setNodeRef} className={`flex min-h-full flex-col gap-2 rounded-card ${COLUMN_BG[status]} p-3`}>
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold tracking-wide text-text-primary">{COLUMN_LABEL[status]}</h2>
        <span
          data-testid="column-count"
          className={`min-w-[1.375rem] rounded-full bg-surface-card px-2 py-0.5 text-center text-xs font-semibold shadow-card ${COLUMN_ACCENT_TEXT[status]}`}
        >
          {tickets.length}
        </span>
      </div>

      <SortableContext items={tickets.map((ticket) => ticket.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {tickets.length === 0 ? (
            <p className="px-1 text-sm text-text-secondary">이 칼럼에 티켓이 없습니다</p>
          ) : (
            tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} onClick={() => onTicketClick(ticket)} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
};
