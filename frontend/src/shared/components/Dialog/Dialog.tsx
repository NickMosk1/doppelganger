import { Modal } from '../../ui';
import { Button } from '../Button';
import { DialogContent, DialogMessage } from './Dialog.styles';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  type = 'warning',
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <DialogContent>
        <DialogMessage $type={type}>{message}</DialogMessage>
      </DialogContent>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
        <Button variant="outline" onClick={onClose}>{cancelText}</Button>
        <Button onClick={handleConfirm} style={{ background: type === 'danger' ? '#ef4444' : undefined }}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default Dialog;
