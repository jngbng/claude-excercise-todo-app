import { BoardContainer } from "@/client/components/BoardContainer";
import { getBoard } from "@/server/services/ticketService";
import type { BoardData } from "@/shared/types";

const EMPTY_BOARD: BoardData = { backlog: [], todo: [], inProgress: [], done: [] };

const BoardPage = async () => {
  const board = await getBoard().catch(() => EMPTY_BOARD);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <BoardContainer initialData={board} />
    </main>
  );
};

export default BoardPage;
