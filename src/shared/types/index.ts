export const TICKET_STATUS = {
  BACKLOG: 'BACKLOG',
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const;

export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];

export const TICKET_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

export type TicketPriority = (typeof TICKET_PRIORITY)[keyof typeof TICKET_PRIORITY];

export type Ticket = {
  id: number;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  position: number;
  plannedStartDate: string | null;
  dueDate: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

// DB에는 없는 파생 필드(isOverdue)를 조회 시점에 덧붙인 타입. API 응답은 항상 이 형태다.
export type TicketWithMeta = Ticket & {
  isOverdue: boolean;
};

export type BoardData = {
  backlog: TicketWithMeta[];
  todo: TicketWithMeta[];
  inProgress: TicketWithMeta[];
  done: TicketWithMeta[];
};
