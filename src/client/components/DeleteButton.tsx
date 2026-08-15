import { Button } from "@/client/components/ui/Button";

type DeleteButtonProps = {
  onClick: () => void;
};

export const DeleteButton = ({ onClick }: DeleteButtonProps) => {
  return (
    <Button variant="danger" onClick={onClick}>
      삭제
    </Button>
  );
};
