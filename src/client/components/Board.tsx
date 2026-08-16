"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { BoardData, TicketStatus, TicketWithMeta } from "@/shared/types";
import { Column } from "@/client/components/Column";
import { PriorityBadge } from "@/client/components/ui/PriorityBadge";
import { DueDateBadge } from "@/client/components/ui/DueDateBadge";

type BoardProps = {
  board: BoardData;
  onTicketClick: (ticket: TicketWithMeta) => void;
  onDragEnd: (event: DragEndEvent) => void;
};

const COLUMNS: { key: keyof BoardData; status: TicketStatus }[] = [
  { key: "backlog", status: "BACKLOG" },
  { key: "todo", status: "TODO" },
  { key: "inProgress", status: "IN_PROGRESS" },
  { key: "done", status: "DONE" },
];

const findTicketById = (board: BoardData, id: number): TicketWithMeta | null => {
  for (const { key } of COLUMNS) {
    const found = board[key].find((ticket) => ticket.id === id);
    if (found) return found;
  }
  return null;
};

// DragOverlay는 원본 카드와 별개의 시각적 복제본이다. TicketCard를 그대로 재사용하면
// useSortable이 같은 티켓 id로 두 번(원본 + 복제본) 등록되어 dnd-kit 내부 draggableNodes가
// 충돌하므로, 정렬 로직 없이 모양만 복제하는 프리젠테이션 컴포넌트를 따로 둔다.
const TicketCardPreview = ({ ticket }: { ticket: TicketWithMeta }) => (
  <div className="rounded-card bg-surface-card p-3 shadow-card-dragging">
    <p className="truncate text-sm font-medium text-text-primary">{ticket.title}</p>
    <div className="mt-2 flex items-center gap-2">
      <PriorityBadge priority={ticket.priority} />
      {ticket.dueDate && <DueDateBadge dueDate={ticket.dueDate} isOverdue={ticket.isOverdue} />}
    </div>
  </div>
);

export const Board = ({ board, onTicketClick, onDragEnd }: BoardProps) => {
  const [activeId, setActiveId] = useState<number | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const activeTicket = activeId === null ? null : findTicketById(board, activeId);

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(Number(active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    onDragEnd(event);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map(({ key, status }) =>
          // 768px 미만에서는 Backlog를 숨긴다 — md 이상에서는 display:contents로 그리드에서
          // 원래 자리(2컬럼/4컬럼)를 그대로 차지하도록 복원한다.
          status === "BACKLOG" ? (
            <div key={status} className="hidden md:contents">
              <Column status={status} tickets={board[key]} onTicketClick={onTicketClick} />
            </div>
          ) : (
            <Column key={status} status={status} tickets={board[key]} onTicketClick={onTicketClick} />
          ),
        )}
      </div>
      <DragOverlay>
        {activeTicket ? (
          <div data-testid="drag-overlay-card">
            <TicketCardPreview ticket={activeTicket} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
