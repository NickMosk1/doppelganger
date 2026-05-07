import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DeviceTypes } from '../../../types';
import Modal from '../Modal';
import { Button, Input } from '../../../components';

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
`;

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (device: any) => void;
  defaultType?: string;
}

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ 
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
    // Отправляем все поля, которые ожидает бэкенд
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
      title="➕ Добавить устройство"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>Отмена</Button>
          <Button onClick={handleSubmit}>Добавить</Button>
        </>
      }
    >
      <FormGroup>
        <Input
          label="Название"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Например: Cisco ISR 4321"
          required
          fullWidth
        />
      </FormGroup>

      <FormRow>
        <FormGroup>
          <label>Тип устройства *</label>
          <Select 
            value={formData.type} 
            onChange={(e) => setFormData({ ...formData, type: e.target.value as DeviceTypes })}
          >
            <option value={DeviceTypes.ROUTER}>🌐 Маршрутизатор</option>
            <option value={DeviceTypes.SWITCH}>🔌 Коммутатор</option>
            <option value={DeviceTypes.PLC}>⚙️ ПЛК</option>
            <option value={DeviceTypes.SERVER}>🖥️ Сервер</option>
            <option value={DeviceTypes.WORKSTATION}>💻 Рабочая станция</option>
            <option value={DeviceTypes.FIREWALL}>🛡️ Фаервол</option>
            <option value={DeviceTypes.ACCESS_POINT}>📡 Точка доступа</option>
            <option value={DeviceTypes.CUSTOM}>🔧 Пользовательское</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Input
            label="Производитель"
            value={formData.manufacturer}
            onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
            placeholder="Cisco, Siemens, Dell..."
            fullWidth
          />
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup>
          <Input
            label="Кол-во портов"
            type="number"
            min="0"
            value={formData.portCount}
            onChange={(e) => setFormData({ ...formData, portCount: Number(e.target.value) })}
            fullWidth
          />
        </FormGroup>

        <FormGroup>
          <Input
            label="Базовая задержка (мс)"
            type="number"
            step="0.1"
            min="0"
            value={formData.baseLatencyMs}
            onChange={(e) => setFormData({ ...formData, baseLatencyMs: Number(e.target.value) })}
            fullWidth
          />
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup>
          <Input
            label="Макс. пропускная способность (Мбит/с)"
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
        <Input
          label="Описание"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Краткое описание устройства..."
          fullWidth
        />
      </FormGroup>
    </Modal>
  );
};

export default AddDeviceModal;
