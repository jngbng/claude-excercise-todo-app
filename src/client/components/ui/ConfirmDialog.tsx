import { Modal } from "@/client/components/ui/Modal";
import { Button } from "@/client/components/ui/Button";

type ConfirmDialogProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({ isOpen, onConfirm, onCancel }: ConfirmDialogProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <p>정말 삭제하시겠습니까?</p>
      <Button variant="secondary" onClick={onCancel}>
        취소
      </Button>
      <Button variant="danger" onClick={onConfirm}>
        삭제
      </Button>
    </Modal>
  );
};
