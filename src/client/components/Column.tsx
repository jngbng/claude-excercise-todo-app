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

export const Column = ({ status, tickets, onTicketClick }: ColumnProps) => {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div ref={setNodeRef} className="flex min-h-full flex-col gap-2 rounded-card bg-surface-app p-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">{COLUMN_LABEL[status]}</h2>
        <span
          data-testid="column-count"
          className="rounded-full bg-surface-card px-2 py-0.5 text-xs text-text-secondary"
        >
          {tickets.length}
        </span>
      </div>

      <SortableContext items={tickets.map((ticket) => ticket.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {tickets.length === 0 ? (
            <p className="text-sm text-text-secondary">이 칼럼에 티켓이 없습니다</p>
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
