"use client";

import { useMemo, useState } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import { TICKET_STATUS } from "@/shared/types";
import type { BoardData, TicketStatus, TicketWithMeta } from "@/shared/types";
import type { CreateTicketInput, UpdateTicketInput } from "@/shared/validations/ticket";
import { today } from "@/shared/utils/today";
import { useTickets } from "@/client/hooks/useTickets";
import { Board } from "@/client/components/Board";
import { BoardHeader } from "@/client/components/BoardHeader";
import { FilterBar } from "@/client/components/FilterBar";
import { TicketModal } from "@/client/components/TicketModal";
import { TicketForm } from "@/client/components/TicketForm";
import { Modal } from "@/client/components/ui/Modal";

type BoardContainerProps = {
  initialData: BoardData;
};

type ActiveFilter = "all" | "thisWeek" | "overdue";
type ColumnKey = keyof BoardData;
type ReorderableStatus = Exclude<TicketStatus, "DONE">;

const COLUMN_KEYS: ColumnKey[] = ["backlog", "todo", "inProgress", "done"];

const STATUS_TO_COLUMN: Record<TicketStatus, ColumnKey> = {
  [TICKET_STATUS.BACKLOG]: "backlog",
  [TICKET_STATUS.TODO]: "todo",
  [TICKET_STATUS.IN_PROGRESS]: "inProgress",
  [TICKET_STATUS.DONE]: "done",
};

const STATUS_VALUES = new Set<string>(Object.values(TICKET_STATUS));

const toDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getMonday = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  return result;
};

const getSunday = (date: Date): Date => {
  const monday = getMonday(date);
  const result = new Date(monday);
  result.setDate(monday.getDate() + 6);
  return result;
};

// COMPONENT_SPEC.md §2.3 필터 로직을 순수 함수로 분리 — board 상태와 무관하게 개별 단위 테스트 가능
export const isThisWeek = (ticket: TicketWithMeta, referenceDate: Date = today()): boolean => {
  if (!ticket.dueDate) return false;
  if (ticket.status === TICKET_STATUS.BACKLOG || ticket.status === TICKET_STATUS.DONE) return false;

  const monday = getMonday(referenceDate);
  const sunday = getSunday(referenceDate);
  return ticket.dueDate >= toDateString(monday) && ticket.dueDate <= toDateString(sunday);
};

export const isOverdueTicket = (ticket: TicketWithMeta): boolean => ticket.isOverdue;

const FILTER_PREDICATES: Record<Exclude<ActiveFilter, "all">, (ticket: TicketWithMeta) => boolean> = {
  thisWeek: (ticket) => isThisWeek(ticket),
  overdue: isOverdueTicket,
};

// BACKLOG/DONE에는 필터를 적용하지 않는다 — 필터 대상은 TODO/IN_PROGRESS뿐이다
// (COMPONENT_SPEC.md §2.3, FRONTEND_TASKS.md BoardContainer Red 항목).
const applyFilter = (board: BoardData, filter: ActiveFilter): BoardData => {
  if (filter === "all") return board;

  const predicate = FILTER_PREDICATES[filter];
  return {
    ...board,
    todo: board.todo.filter(predicate),
    inProgress: board.inProgress.filter(predicate),
  };
};

const findTicketInBoard = (board: BoardData, id: number): TicketWithMeta | undefined => {
  for (const key of COLUMN_KEYS) {
    const found = board[key].find((ticket) => ticket.id === id);
    if (found) return found;
  }
  return undefined;
};

type DropTarget = { status: TicketStatus; index: number };

// dnd-kit의 active/over id만으로 대상 칼럼과 삽입 인덱스를 계산한다. over가 칼럼 컨테이너 자체면
// 맨 끝에 삽입하고, 다른 카드 위라면 그 카드의 인덱스에 삽입한다(ticketService의 0-based 삽입
// 인덱스 계약과 일치, docs/TRD.md 드래그앤드롭 흐름 참고).
const resolveDropTarget = (
  board: BoardData,
  activeId: number,
  overId: string | number,
): DropTarget | null => {
  if (typeof overId === "string" && STATUS_VALUES.has(overId)) {
    const status = overId as TicketStatus;
    const siblings = board[STATUS_TO_COLUMN[status]].filter((ticket) => ticket.id !== activeId);
    return { status, index: siblings.length };
  }

  const overTicket = findTicketInBoard(board, Number(overId));
  if (!overTicket) return null;

  const siblings = board[STATUS_TO_COLUMN[overTicket.status]].filter((ticket) => ticket.id !== activeId);
  const index = siblings.findIndex((ticket) => ticket.id === overTicket.id);
  return { status: overTicket.status, index: index === -1 ? siblings.length : index };
};

export const BoardContainer = ({ initialData }: BoardContainerProps) => {
  const { board, error, create, update, remove, reorder, complete } = useTickets(initialData);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketWithMeta | null>(null);

  const filteredBoard = useMemo(() => applyFilter(board, activeFilter), [board, activeFilter]);

  const counts = useMemo(() => {
    const candidates = [...board.todo, ...board.inProgress];
    return {
      thisWeek: candidates.filter((ticket) => isThisWeek(ticket)).length,
      overdue: candidates.filter(isOverdueTicket).length,
    };
  }, [board]);

  // 대상 칼럼 판별/API 분기는 여기(BoardContainer)의 책임이다 — Board는 이벤트를 그대로 전달만 한다
  // (docs/COMPONENT_SPEC.md §2.1). 분기는 반드시 드롭 "대상(target)" 칼럼 기준이어야 한다 — 출발
  // 칼럼(예: DONE에서 드래그를 시작했는지)을 기준으로 삼으면 DONE 카드를 BACKLOG/TODO로 드롭해도
  // useTickets.complete()가 무조건 IN_PROGRESS로 토글해버려 드롭 위치를 무시하는 버그가 생긴다.
  // target === DONE일 때만 complete()를 호출하고, 그 외(BACKLOG/TODO/IN_PROGRESS)는 출발 칼럼과
  // 무관하게 항상 reorder()를 호출한다 (docs/COMPONENT_SPEC.md §5.1).
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = Number(active.id);
    const activeTicket = findTicketInBoard(board, activeId);
    if (!activeTicket) return;

    const target = resolveDropTarget(board, activeId, over.id);
    if (!target) return;

    if (target.status === TICKET_STATUS.DONE) {
      void complete(activeId);
      return;
    }

    void reorder(activeId, target.status as ReorderableStatus, target.index);
  };

  const handleCreateSubmit = (data: CreateTicketInput | UpdateTicketInput) => {
    void create(data as CreateTicketInput);
    setIsCreating(false);
  };

  const handleUpdate = (id: number, data: UpdateTicketInput) => {
    void update(id, data);
  };

  const handleDelete = (id: number) => {
    void remove(id);
    setSelectedTicket(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <BoardHeader onCreateClick={() => setIsCreating(true)} />
      <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} counts={counts} />

      {error && (
        <p role="alert" data-testid="board-error" className="text-sm text-danger">
          {error}
        </p>
      )}

      <Board board={filteredBoard} onTicketClick={setSelectedTicket} onDragEnd={handleDragEnd} />

      <Modal isOpen={isCreating} onClose={() => setIsCreating(false)}>
        <TicketForm
          mode="create"
          onSubmit={handleCreateSubmit}
          onCancel={() => setIsCreating(false)}
          isLoading={false}
        />
      </Modal>

      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          isOpen
          onClose={() => setSelectedTicket(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};
