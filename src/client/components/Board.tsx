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
  // 우측 상단 48px 필터 영역에 렌더링할 FilterBar. BoardContainer가 필터 상태를 소유하므로
  // Board는 그 내용을 몰라도 되도록 슬롯으로만 받는다.
  filterSlot?: React.ReactNode;
};

const COLUMNS: { key: keyof BoardData; status: TicketStatus }[] = [
  { key: "backlog", status: "BACKLOG" },
  { key: "todo", status: "TODO" },
  { key: "inProgress", status: "IN_PROGRESS" },
  { key: "done", status: "DONE" },
];

const MAIN_COLUMNS = COLUMNS.filter(({ status }) => status !== "BACKLOG");

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
    <p className="truncate text-sm font-bold text-text-primary">{ticket.title}</p>
    <div className="mt-2 flex items-center gap-2">
      <PriorityBadge priority={ticket.priority} />
      {ticket.dueDate && <DueDateBadge dueDate={ticket.dueDate} isOverdue={ticket.isOverdue} />}
    </div>
  </div>
);

export const Board = ({ board, onTicketClick, onDragEnd, filterSlot }: BoardProps) => {
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
      {/*
        docs/COMPONENT_SPEC.md §1 레이아웃: Backlog는 좌측에 전체 높이로 고정, 우측은
        48px 필터 영역(상단) + TODO/In Progress/Done 3칼럼(하단)으로 나뉜다.
        구분선 4개 = ①Backlog|우측 영역 ②필터 영역|3칼럼 그리드 ③④3칼럼 사이 2개.
        768px 미만에서는 Backlog를 숨기고 단일 컬럼으로 쌓는다.
      */}
      <div className="flex flex-col overflow-hidden rounded-card border border-border-column-divider md:flex-row md:divide-x md:divide-border-column-divider">
        <div className="hidden shrink-0 md:block md:w-[272px]">
          <Column status="BACKLOG" tickets={board.backlog} onTicketClick={onTicketClick} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col divide-y divide-border-column-divider">
          <div className="flex h-12 shrink-0 items-center gap-2 bg-surface-header px-4">{filterSlot}</div>

          <div className="grid flex-1 grid-cols-1 divide-y divide-border-column-divider md:grid-cols-3 md:divide-x md:divide-y-0">
            {MAIN_COLUMNS.map(({ key, status }) => (
              <Column key={status} status={status} tickets={board[key]} onTicketClick={onTicketClick} />
            ))}
          </div>
        </div>
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
