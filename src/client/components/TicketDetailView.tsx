import type { TicketStatus } from "@/shared/types";

type TicketDetailViewProps = {
  status: TicketStatus;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
};

const formatDate = (value: string | null) => (value ? value.slice(0, 10) : "-");

export const TicketDetailView = ({ status, startedAt, completedAt, createdAt }: TicketDetailViewProps) => {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
      <dt className="text-text-secondary">상태</dt>
      <dd className="text-text-primary">{status}</dd>

      <dt className="text-text-secondary">시작일</dt>
      <dd className="text-text-primary">{formatDate(startedAt)}</dd>

      <dt className="text-text-secondary">종료일</dt>
      <dd className="text-text-primary">{formatDate(completedAt)}</dd>

      <dt className="text-text-secondary">생성일</dt>
      <dd className="text-text-primary">{formatDate(createdAt)}</dd>
    </dl>
  );
};
