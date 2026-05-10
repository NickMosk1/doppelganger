import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { colors } from '../../../theme';
import { DeviceTypes } from '../../../types';
import { Button, Input } from '../../../components';
import Modal from '../Modal';

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
  margin-bottom: 20px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: ${colors.textLight};
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid ${colors.border};
  border-radius: 10px;
  font-size: 14px;
  background: ${colors.white};
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px ${colors.primaryLight}40;
  }
  
  &:hover {
    border-color: ${colors.primaryLight};
  }
`;

const RequiredMark = styled.span`
  color: #ef4444;
  margin-left: 4px;
`;

const HelperText = styled.div`
  font-size: 11px;
  color: ${colors.textLighter};
  margin-top: 4px;
`;

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (device: any) => void;
  defaultType?: string;
}

const deviceTypeOptions = [
  { value: DeviceTypes.ROUTER, label: '🌐 Маршрутизатор', description: 'Для соединения сетей' },
  { value: DeviceTypes.SWITCH, label: '🔌 Коммутатор', description: 'Для объединения устройств' },
  { value: DeviceTypes.PLC, label: '⚙️ ПЛК', description: 'Программируемый логический контроллер' },
  { value: DeviceTypes.SERVER, label: '🖥️ Сервер', description: 'Высокопроизводительный сервер' },
  { value: DeviceTypes.WORKSTATION, label: '💻 Рабочая станция', description: 'Компьютер сотрудника' },
  { value: DeviceTypes.FIREWALL, label: '🛡️ Фаервол', description: 'Защита сети' },
  { value: DeviceTypes.ACCESS_POINT, label: '📡 Точка доступа', description: 'Wi-Fi точка' },
  { value: DeviceTypes.CUSTOM, label: '🔧 Пользовательское', description: 'Свой тип устройства' },
];

export const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd,
  defaultType = DeviceTypes.CUSTOM 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: defaultType,
    manufacturer: '',
    portCount: 4,
    baseLatencyMs: 1,
    maxThroughputMbps: 100,
    tempCoefficient: 1.0,
    emiCoefficient: 1.0,
    vibrationCoefficient: 1.0,
    dustCoefficient: 1.0,
    description: '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({ 
        ...prev, 
        type: defaultType,
        name: '',
      }));
    }
  }, [defaultType, isOpen]);

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert('Введите название устройства');
      return;
    }
    
    onAdd({
      name: formData.name,
      type: formData.type,
      manufacturer: formData.manufacturer || null,
      portCount: formData.portCount,
      baseLatencyMs: formData.baseLatencyMs,
      maxThroughputMbps: formData.maxThroughputMbps,
      tempCoefficient: formData.tempCoefficient,
      emiCoefficient: formData.emiCoefficient,
      vibrationCoefficient: formData.vibrationCoefficient,
      dustCoefficient: formData.dustCoefficient,
      description: formData.description || null,
      iconUrl: null,
      isActive: true,
      isCustom: true,
    });
    onClose();
    setFormData({
      name: '',
      type: defaultType,
      manufacturer: '',
      portCount: 4,
      baseLatencyMs: 1,
      maxThroughputMbps: 100,
      tempCoefficient: 1.0,
      emiCoefficient: 1.0,
      vibrationCoefficient: 1.0,
      dustCoefficient: 1.0,
      description: '',
    });
  };

  const handleClose = () => {
    onClose();
    setFormData({
      name: '',
      type: defaultType,
      manufacturer: '',
      portCount: 4,
      baseLatencyMs: 1,
      maxThroughputMbps: 100,
      tempCoefficient: 1.0,
      emiCoefficient: 1.0,
      vibrationCoefficient: 1.0,
      dustCoefficient: 1.0,
      description: '',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Добавить устройство"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>Отмена</Button>
          <Button onClick={handleSubmit}>Добавить</Button>
        </>
      }
    >
      <ModalContent>
        <FormGroup>
          <Label>
            Название <RequiredMark>*</RequiredMark>
          </Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Например: Cisco ISR 4321"
            fullWidth
          />
        </FormGroup>

        <FormRow>
          <FormGroup>
            <Label>
              Тип устройства <RequiredMark>*</RequiredMark>
            </Label>
            <StyledSelect 
              value={formData.type} 
              onChange={(e) => setFormData({ ...formData, type: e.target.value as DeviceTypes })}
            >
              {deviceTypeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </StyledSelect>
            <HelperText>
              {deviceTypeOptions.find(o => o.value === formData.type)?.description}
            </HelperText>
          </FormGroup>

          <FormGroup>
            <Label>Производитель</Label>
            <Input
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              placeholder="Cisco, Siemens, Dell..."
              fullWidth
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label>Кол-во портов</Label>
            <Input
              type="number"
              min="0"
              value={formData.portCount}
              onChange={(e) => setFormData({ ...formData, portCount: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>

          <FormGroup>
            <Label>Базовая задержка (мс)</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              value={formData.baseLatencyMs}
              onChange={(e) => setFormData({ ...formData, baseLatencyMs: Number(e.target.value) })}
              fullWidth
            />
            <HelperText>Время обработки пакета</HelperText>
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label>Макс. пропускная способность (Мбит/с)</Label>
            <Input
              type="number"
              step="100"
              min="0"
              value={formData.maxThroughputMbps}
              onChange={(e) => setFormData({ ...formData, maxThroughputMbps: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>
        </FormRow>

        <FormGroup>
          <Label>Описание</Label>
          <Input
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Краткое описание устройства..."
            fullWidth
          />
        </FormGroup>
      </ModalContent>
    </Modal>
  );
};

export default AddDeviceModal;
