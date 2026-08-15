import { Button } from "@/client/components/ui/Button";

type CreateTicketButtonProps = {
  onClick: () => void;
};

export const CreateTicketButton = ({ onClick }: CreateTicketButtonProps) => {
  return (
    <Button variant="primary" onClick={onClick}>
      새 업무
    </Button>
  );
};
