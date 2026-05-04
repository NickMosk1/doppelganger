import { useState } from 'react';
import styled from 'styled-components';
import { CableTypes } from '../../../types';
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

const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #666;
  margin-bottom: 6px;
`;

interface AddCableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (cable: any) => void;
}

const AddCableModal: React.FC<AddCableModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: CableTypes.COPPER,
    maxLengthM: 100,
    attenuationDbPerKm: 20,
    pricePerMeter: 10,
    immunityRating: 5,
    temperatureRating: 60,
    description: '',
  });

  const handleSubmit = () => {
    const iconMap: Record<CableTypes, string> = {
      [CableTypes.COPPER]: '🔌',
      [CableTypes.FIBER]: '💡',
      [CableTypes.TWISTED_PAIR]: '🔄',
      [CableTypes.COAXIAL]: '📺',
      [CableTypes.SHIELDED]: '🛡️',
      [CableTypes.INDUSTRIAL]: '🏭',
    };

    onAdd({
      ...formData,
      id: `cable-${Date.now()}`,
      icon: iconMap[formData.type],
      isCustom: true,
    });
    onClose();
    setFormData({
      name: '',
      type: CableTypes.COPPER,
      maxLengthM: 100,
      attenuationDbPerKm: 20,
      pricePerMeter: 10,
      immunityRating: 5,
      temperatureRating: 60,
      description: '',
    });
  };

  const cableTypeOptions = [
    { value: CableTypes.COPPER, label: 'Медный' },
    { value: CableTypes.FIBER, label: 'Оптоволокно' },
    { value: CableTypes.TWISTED_PAIR, label: 'Витая пара' },
    { value: CableTypes.COAXIAL, label: 'Коаксиальный' },
    { value: CableTypes.SHIELDED, label: 'Экранированный' },
    { value: CableTypes.INDUSTRIAL, label: 'Промышленный' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Добавить кабель"
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
          placeholder="Например: Кабель СИП-4 2х16"
          fullWidth
        />
      </FormGroup>

      <FormRow>
        <FormGroup>
          <Label>Тип кабеля</Label>
          <Select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as CableTypes })}
          >
            {cableTypeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Input
            label="Макс. длина (м)"
            type="number"
            value={formData.maxLengthM}
            onChange={(e) => setFormData({ ...formData, maxLengthM: Number(e.target.value) })}
            fullWidth
          />
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup>
          <Input
            label="Затухание (дБ/км)"
            type="number"
            step="0.1"
            value={formData.attenuationDbPerKm}
            onChange={(e) => setFormData({ ...formData, attenuationDbPerKm: Number(e.target.value) })}
            fullWidth
          />
        </FormGroup>

        <FormGroup>
          <Input
            label="Цена (₽/м)"
            type="number"
            value={formData.pricePerMeter}
            onChange={(e) => setFormData({ ...formData, pricePerMeter: Number(e.target.value) })}
            fullWidth
          />
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup>
          <Input
            label="Помехоустойчивость (1-10)"
            type="number"
            min="1"
            max="10"
            value={formData.immunityRating}
            onChange={(e) => setFormData({ ...formData, immunityRating: Number(e.target.value) })}
            fullWidth
          />
        </FormGroup>

        <FormGroup>
          <Input
            label="Раб. температура (°C)"
            type="number"
            value={formData.temperatureRating}
            onChange={(e) => setFormData({ ...formData, temperatureRating: Number(e.target.value) })}
            fullWidth
          />
        </FormGroup>
      </FormRow>

      <FormGroup>
        <Input
          label="Описание"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Краткое описание кабеля..."
          fullWidth
        />
      </FormGroup>
    </Modal>
  );
};

export default AddCableModal;
