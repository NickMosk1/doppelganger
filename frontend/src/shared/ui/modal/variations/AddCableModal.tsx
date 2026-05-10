import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { colors } from '../../../theme';
import { CableTypes } from '../../../types';
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

const FormRow3 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
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

interface AddCableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (cable: any) => void;
  defaultType?: CableTypes;
}

const cableTypeOptions = [
  { value: CableTypes.COPPER, label: '🔌 Медный', description: 'Стандартный медный кабель' },
  { value: CableTypes.FIBER, label: '💡 Оптоволокно', description: 'Высокоскоростной, помехозащищенный' },
  { value: CableTypes.TWISTED_PAIR, label: '🔄 Витая пара', description: 'UTP/FTP кабель' },
  { value: CableTypes.COAXIAL, label: '📺 Коаксиальный', description: 'Для видеонаблюдения' },
  { value: CableTypes.SHIELDED, label: '🛡️ Экранированный', description: 'Защита от помех' },
  { value: CableTypes.INDUSTRIAL, label: '🏭 Промышленный', description: 'Для тяжелых условий' },
];

const shieldingTypeOptions = [
  { value: 0, label: 'Без экрана' },
  { value: 1, label: 'Фольга' },
  { value: 2, label: 'Оплетка' },
  { value: 3, label: 'Двойной экран' },
];

export const AddCableModal: React.FC<AddCableModalProps> = ({ 
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
    if (!formData.name.trim()) {
      alert('Введите название кабеля');
      return;
    }
    
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Добавить кабель"
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
            placeholder="Например: UTP Cat6"
            fullWidth
          />
        </FormGroup>

        <FormRow>
          <FormGroup>
            <Label>
              Тип кабеля <RequiredMark>*</RequiredMark>
            </Label>
            <StyledSelect
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as CableTypes })}
            >
              {cableTypeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </StyledSelect>
            <HelperText>
              {cableTypeOptions.find(o => o.value === formData.type)?.description}
            </HelperText>
          </FormGroup>

          <FormGroup>
            <Label>Производитель</Label>
            <Input
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              placeholder="Belden, Corning..."
              fullWidth
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label>Модель</Label>
            <Input
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder="Модель кабеля"
              fullWidth
            />
          </FormGroup>

          <FormGroup>
            <Label>Макс. длина (м)</Label>
            <Input
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
            <Label>Затухание (дБ/км)</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              value={formData.attenuationDbPerKm}
              onChange={(e) => setFormData({ ...formData, attenuationDbPerKm: Number(e.target.value) })}
              fullWidth
            />
            <HelperText>Чем меньше, тем лучше</HelperText>
          </FormGroup>

          <FormGroup>
            <Label>Скорость распространения (%)</Label>
            <Input
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
            <Label>Импеданс (Ом)</Label>
            <Input
              type="number"
              step="5"
              min="0"
              value={formData.impedanceOhms}
              onChange={(e) => setFormData({ ...formData, impedanceOhms: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>

          <FormGroup>
            <Label>Диаметр жилы (мкм)</Label>
            <Input
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
            <Label>Помехоустойчивость (1-10)</Label>
            <Input
              type="number"
              min="1"
              max="10"
              value={formData.immunityRating}
              onChange={(e) => setFormData({ ...formData, immunityRating: Number(e.target.value) })}
              fullWidth
            />
            <HelperText>Чем выше, тем лучше</HelperText>
          </FormGroup>

          <FormGroup>
            <Label>Раб. температура (°C)</Label>
            <Input
              type="number"
              value={formData.temperatureRating}
              onChange={(e) => setFormData({ ...formData, temperatureRating: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>

          <FormGroup>
            <Label>Тип экранирования</Label>
            <StyledSelect
              value={formData.shieldingType}
              onChange={(e) => setFormData({ ...formData, shieldingType: Number(e.target.value) })}
            >
              {shieldingTypeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </StyledSelect>
          </FormGroup>
        </FormRow3>

        <FormRow>
          <FormGroup>
            <Label>Цена (₽/м)</Label>
            <Input
              type="number"
              step="5"
              min="0"
              value={formData.pricePerMeter}
              onChange={(e) => setFormData({ ...formData, pricePerMeter: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>
        </FormRow>

        <FormGroup>
          <Label>Описание</Label>
          <Input
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Краткое описание кабеля..."
            fullWidth
          />
        </FormGroup>
      </ModalContent>
    </Modal>
  );
};

export default AddCableModal;
