import { useState } from 'react';
import styled from 'styled-components';
import { DeviceCategories, DeviceTypes } from '../../../types';
import Modal from '../Modal';
import { Button, Input } from '../../../components';

const FormGroup = styled.div`
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
}

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: DeviceTypes.CUSTOM,
    manufacturer: '',
    category: DeviceCategories.ROUTERS,
    baseLatencyMs: 1,
    maxThroughputMbps: 100,
    description: '',
  });

  const handleSubmit = () => {
    onAdd({
      ...formData,
      id: `custom-${Date.now()}`,
      icon: '🔧',
      isCustom: true,
    });
    onClose();
    setFormData({
      name: '',
      type: DeviceTypes.CUSTOM,
      manufacturer: '',
      category: DeviceCategories.ROUTERS,
      baseLatencyMs: 1,
      maxThroughputMbps: 100,
      description: '',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="➕ Добавить устройство"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSubmit}>Добавить</Button>
        </>
      }
    >
      <FormGroup>
        <Input
          label="Название"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          fullWidth
        />
      </FormGroup>
      <FormGroup>
        <label>Тип</label>
        <Select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as DeviceTypes })}>
          <option value={DeviceTypes.ROUTER}>Маршрутизатор</option>
          <option value={DeviceTypes.SWITCH}>Коммутатор</option>
          <option value={DeviceTypes.PLC}>ПЛК</option>
          <option value={DeviceTypes.SERVER}>Сервер</option>
          <option value={DeviceTypes.WORKSTATION}>Рабочая станция</option>
          <option value={DeviceTypes.FIREWALL}>Фаервол</option>
          <option value={DeviceTypes.CUSTOM}>Пользовательское</option>
        </Select>
      </FormGroup>
      <FormGroup>
        <Input
          label="Производитель"
          value={formData.manufacturer}
          onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
          fullWidth
        />
      </FormGroup>
    </Modal>
  );
};

export default AddDeviceModal;
