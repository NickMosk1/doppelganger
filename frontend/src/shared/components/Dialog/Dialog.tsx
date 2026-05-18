import { Modal } from '../../ui';
import { Button } from '../Button';
import { DialogContent, DialogMessage } from './Dialog.styles';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel?: () => void;  // 🔧 ДОБАВИТЬ
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
  onCancel,  // 🔧 ДОБАВИТЬ
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

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <DialogContent>
        <DialogMessage $type={type}>{message}</DialogMessage>
      </DialogContent>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
        <Button variant="outline" onClick={handleCancel}>{cancelText}</Button>
        <Button onClick={handleConfirm} style={{ background: type === 'danger' ? '#ef4444' : undefined }}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default Dialog;
