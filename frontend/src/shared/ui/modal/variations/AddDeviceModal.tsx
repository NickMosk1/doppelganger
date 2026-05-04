import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DeviceTypes } from '../../../types';
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
  defaultType?: string;  // Добавлен параметр
}

// Маппинг типов для иконок
const getIconForType = (type: string): string => {
  const icons: Record<string, string> = {
    ROUTER: "🌐",
    SWITCH: "🔌",
    PLC: "⚙️",
    SERVER: "🖥️",
    WORKSTATION: "💻",
    FIREWALL: "🛡️",
    CUSTOM: "🔧",
  };
  return icons[type] || "🔧";
};

// Маппинг типов для категорий (если нужно)
const getCategoryForType = (type: string): string => {
  const categories: Record<string, string> = {
    ROUTER: "ROUTERS",
    SWITCH: "SWITCHES",
    PLC: "PLCS",
    SERVER: "SERVERS",
    WORKSTATION: "WORK_STATIONS",
    FIREWALL: "FIRE_WALLS",
    CUSTOM: "CUSTOM",
  };
  return categories[type] || "CUSTOM";
};

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
    baseLatencyMs: 1,
    maxThroughputMbps: 100,
    description: '',
  });

  // Обновляем тип когда меняется defaultType (при открытии из разных категорий)
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({ 
        ...prev, 
        type: defaultType,
        // Сбрасываем название при смене категории
        name: '',
      }));
    }
  }, [defaultType, isOpen]);

  const handleSubmit = () => {
    onAdd({
      ...formData,
      id: `custom-${Date.now()}`,
      icon: getIconForType(formData.type),
      category: getCategoryForType(formData.type),
      isCustom: true,
    });
    onClose();
    // Сбрасываем форму
    setFormData({
      name: '',
      type: defaultType,
      manufacturer: '',
      baseLatencyMs: 1,
      maxThroughputMbps: 100,
      description: '',
    });
  };

  const handleClose = () => {
    onClose();
    // Сбрасываем форму при закрытии
    setFormData({
      name: '',
      type: defaultType,
      manufacturer: '',
      baseLatencyMs: 1,
      maxThroughputMbps: 100,
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
      <FormGroup>
        <Input
          label="Название"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Например: Cisco ISR 4321"
          fullWidth
        />
      </FormGroup>

      <FormGroup>
        <label>Тип устройства</label>
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
          <option value={DeviceTypes.CUSTOM}>🔧 Пользовательское</option>
        </Select>
      </FormGroup>

      <FormGroup>
        <Input
          label="Производитель"
          value={formData.manufacturer}
          onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
          placeholder="Например: Cisco, Siemens, Dell"
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
