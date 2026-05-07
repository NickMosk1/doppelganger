import { useState, useEffect } from 'react';
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

const FormRow3 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
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
  defaultType?: CableTypes;
}

const AddCableModal: React.FC<AddCableModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd,
  defaultType = CableTypes.COPPER 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: defaultType,
    manufacturer: '',
    model: '',
    maxLengthM: 100,
    attenuationDbPerKm: 20,
    propagationSpeed: 0.65,
    impedanceOhms: 100,
    coreDiameterUm: null as number | null,
    immunityRating: 5,
    temperatureRating: 60,
    shieldingType: 0,
    pricePerMeter: 10,
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
      model: formData.model || null,
      maxLengthM: formData.maxLengthM,
      attenuationDbPerKm: formData.attenuationDbPerKm,
      propagationSpeed: formData.propagationSpeed,
      impedanceOhms: formData.impedanceOhms,
      coreDiameterUm: formData.coreDiameterUm,
      immunityRating: formData.immunityRating,
      temperatureRating: formData.temperatureRating,
      shieldingType: formData.shieldingType,
      pricePerMeter: formData.pricePerMeter,
      description: formData.description || null,
      isActive: true,
      isCustom: true,
    });
    onClose();
    setFormData({
      name: '',
      type: defaultType,
      manufacturer: '',
      model: '',
      maxLengthM: 100,
      attenuationDbPerKm: 20,
      propagationSpeed: 0.65,
      impedanceOhms: 100,
      coreDiameterUm: null,
      immunityRating: 5,
      temperatureRating: 60,
      shieldingType: 0,
      pricePerMeter: 10,
      description: '',
    });
  };

  const handleClose = () => {
    onClose();
    setFormData({
      name: '',
      type: defaultType,
      manufacturer: '',
      model: '',
      maxLengthM: 100,
      attenuationDbPerKm: 20,
      propagationSpeed: 0.65,
      impedanceOhms: 100,
      coreDiameterUm: null,
      immunityRating: 5,
      temperatureRating: 60,
      shieldingType: 0,
      pricePerMeter: 10,
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

  const shieldingTypeOptions = [
    { value: 0, label: 'Без экрана' },
    { value: 1, label: 'Фольга' },
    { value: 2, label: 'Оплетка' },
    { value: 3, label: 'Двойной экран' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="➕ Добавить кабель"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>Отмена</Button>
          <Button onClick={handleSubmit}>Добавить</Button>
        </>
      }
    >
      <FormGroup>
        <Input
          label="Название *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Например: UTP Cat6"
          required
          fullWidth
        />
      </FormGroup>

      <FormRow>
        <FormGroup>
          <Label>Тип кабеля *</Label>
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
            label="Производитель"
            value={formData.manufacturer}
            onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
            placeholder="Belden, Corning..."
            fullWidth
          />
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup>
          <Input
            label="Модель"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            placeholder="Модель кабеля"
            fullWidth
          />
        </FormGroup>

        <FormGroup>
          <Input
            label="Макс. длина (м)"
            type="number"
            step="10"
            min="0"
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
            min="0"
            value={formData.attenuationDbPerKm}
            onChange={(e) => setFormData({ ...formData, attenuationDbPerKm: Number(e.target.value) })}
            fullWidth
          />
        </FormGroup>

        <FormGroup>
          <Input
            label="Скорость распространения (%)"
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={formData.propagationSpeed}
            onChange={(e) => setFormData({ ...formData, propagationSpeed: Number(e.target.value) })}
            fullWidth
          />
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup>
          <Input
            label="Импеданс (Ом)"
            type="number"
            step="5"
            min="0"
            value={formData.impedanceOhms}
            onChange={(e) => setFormData({ ...formData, impedanceOhms: Number(e.target.value) })}
            fullWidth
          />
        </FormGroup>

        <FormGroup>
          <Input
            label="Диаметр жилы (мкм)"
            type="number"
            step="0.1"
            min="0"
            value={formData.coreDiameterUm || ''}
            onChange={(e) => setFormData({ ...formData, coreDiameterUm: e.target.value ? Number(e.target.value) : null })}
            fullWidth
          />
        </FormGroup>
      </FormRow>

      <FormRow3>
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

        <FormGroup>
          <Label>Тип экранирования</Label>
          <Select
            value={formData.shieldingType}
            onChange={(e) => setFormData({ ...formData, shieldingType: Number(e.target.value) })}
          >
            {shieldingTypeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </FormGroup>
      </FormRow3>

      <FormGroup>
        <Input
          label="Цена (₽/м)"
          type="number"
          step="5"
          min="0"
          value={formData.pricePerMeter}
          onChange={(e) => setFormData({ ...formData, pricePerMeter: Number(e.target.value) })}
          fullWidth
        />
      </FormGroup>

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
