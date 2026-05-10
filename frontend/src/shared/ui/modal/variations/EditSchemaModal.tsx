import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { colors } from '../../../theme';
import Modal from '../Modal';
import { Button, Input } from '../../../components';

const ModalContent = styled.div`
  max-height: 70vh;
  overflow-y: auto;
  padding: 4px 0;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${colors.background};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${colors.border};
    border-radius: 3px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: ${colors.textLight};
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid ${colors.border};
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  transition: all 0.2s ease;
  background: ${colors.white};
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px ${colors.primaryLight}40;
  }
  
  &:hover {
    border-color: ${colors.primaryLight};
  }
`;

const HelperText = styled.div`
  font-size: 11px;
  color: ${colors.textLighter};
  margin-top: 6px;
`;

interface EditSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
  initialName: string;
  initialDescription: string;
}

const EditSchemaModal: React.FC<EditSchemaModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave,
  initialName,
  initialDescription,
}) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setDescription(initialDescription);
    }
  }, [isOpen, initialName, initialDescription]);

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Введите название схемы');
      return;
    }
    onSave(name, description);
    onClose();
  };

  const handleClose = () => {
    setName(initialName);
    setDescription(initialDescription);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Редактирование схемы"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>Отмена</Button>
          <Button onClick={handleSubmit}>Сохранить</Button>
        </>
      }
    >
      <ModalContent>
        <FormGroup>
          <Label>Название схемы</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Введите название схемы"
            fullWidth
          />
          <HelperText>Уникальное имя для вашей схемы</HelperText>
        </FormGroup>

        <FormGroup>
          <Label>Описание</Label>
          <StyledTextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Введите описание схемы..."
          />
          <HelperText>Краткое описание назначения и содержимого схемы</HelperText>
        </FormGroup>
      </ModalContent>
    </Modal>
  );
};

export default EditSchemaModal;
