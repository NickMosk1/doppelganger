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

const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.text};
  margin: 16px 0 12px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid ${colors.border};
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
    // Новые поля
    bendingRadiusMm: 50,
    tensileStrengthN: 100,
    operatingTensionMaxN: 50,
    capacitancePerKmNf: 50,
    resistancePerKmOhms: 85,
    maxFrequencyMhz: 250,
    signalToNoiseRatioDb: 30,
    oilResistance: false,
    uvResistance: false,
    chemicalResistance: '',
    expectedLifetimeYears: 10,
    degradationRatePerYear: 2.0,
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
      // Новые поля
      bendingRadiusMm: formData.bendingRadiusMm,
      tensileStrengthN: formData.tensileStrengthN,
      operatingTensionMaxN: formData.operatingTensionMaxN,
      capacitancePerKmNf: formData.capacitancePerKmNf,
      resistancePerKmOhms: formData.resistancePerKmOhms,
      maxFrequencyMhz: formData.maxFrequencyMhz,
      signalToNoiseRatioDb: formData.signalToNoiseRatioDb,
      oilResistance: formData.oilResistance,
      uvResistance: formData.uvResistance,
      chemicalResistance: formData.chemicalResistance || null,
      expectedLifetimeYears: formData.expectedLifetimeYears,
      degradationRatePerYear: formData.degradationRatePerYear,
      description: formData.description || null,
      isActive: true,
      isCustom: true,
    });
    onClose();
    resetForm();
  };

  const resetForm = () => {
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
      bendingRadiusMm: 50,
      tensileStrengthN: 100,
      operatingTensionMaxN: 50,
      capacitancePerKmNf: 50,
      resistancePerKmOhms: 85,
      maxFrequencyMhz: 250,
      signalToNoiseRatioDb: 30,
      oilResistance: false,
      uvResistance: false,
      chemicalResistance: '',
      expectedLifetimeYears: 10,
      degradationRatePerYear: 2.0,
      description: '',
    });
  };

  const handleClose = () => {
    onClose();
    resetForm();
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
        {/* Основная информация */}
        <SectionTitle>📋 Основная информация</SectionTitle>
        
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

        {/* Физические характеристики */}
        <SectionTitle>📐 Физические характеристики</SectionTitle>

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
            <Label>Мин. радиус изгиба (мм)</Label>
            <Input
              type="number"
              step="5"
              min="10"
              max="200"
              value={formData.bendingRadiusMm}
              onChange={(e) => setFormData({ ...formData, bendingRadiusMm: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>

          <FormGroup>
            <Label>Прочность на разрыв (Н)</Label>
            <Input
              type="number"
              step="10"
              min="20"
              max="500"
              value={formData.tensileStrengthN}
              onChange={(e) => setFormData({ ...formData, tensileStrengthN: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label>Макс. рабочее натяжение (Н)</Label>
            <Input
              type="number"
              step="10"
              min="10"
              max="300"
              value={formData.operatingTensionMaxN}
              onChange={(e) => setFormData({ ...formData, operatingTensionMaxN: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>
        </FormRow>

        {/* Электрические параметры */}
        <SectionTitle>⚡ Электрические параметры</SectionTitle>

        <FormRow>
          <FormGroup>
            <Label>Импеданс (Ом)</Label>
            <Input
              type="number"
              step="5"
              min="50"
              max="150"
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
              min="0.1"
              max="10"
              value={formData.coreDiameterUm || ''}
              onChange={(e) => setFormData({ ...formData, coreDiameterUm: e.target.value ? Number(e.target.value) : null })}
              fullWidth
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label>Ёмкость (нФ/км)</Label>
            <Input
              type="number"
              step="5"
              min="30"
              max="100"
              value={formData.capacitancePerKmNf}
              onChange={(e) => setFormData({ ...formData, capacitancePerKmNf: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>

          <FormGroup>
            <Label>Сопротивление (Ом/км)</Label>
            <Input
              type="number"
              step="5"
              min="20"
              max="200"
              value={formData.resistancePerKmOhms}
              onChange={(e) => setFormData({ ...formData, resistancePerKmOhms: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>
        </FormRow>

        {/* Частотные характеристики */}
        <SectionTitle>📡 Частотные характеристики</SectionTitle>

        <FormRow>
          <FormGroup>
            <Label>Макс. частота (МГц)</Label>
            <Input
              type="number"
              step="10"
              min="10"
              max="1000"
              value={formData.maxFrequencyMhz}
              onChange={(e) => setFormData({ ...formData, maxFrequencyMhz: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>

          <FormGroup>
            <Label>SNR (дБ)</Label>
            <Input
              type="number"
              step="1"
              min="10"
              max="60"
              value={formData.signalToNoiseRatioDb}
              onChange={(e) => setFormData({ ...formData, signalToNoiseRatioDb: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>
        </FormRow>

        {/* Промышленная устойчивость */}
        <SectionTitle>🏭 Промышленная устойчивость</SectionTitle>

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
              step="5"
              min="-40"
              max="125"
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

        <FormRow3>
          <FormGroup>
            <Label>Маслостойкость</Label>
            <StyledSelect
              value={formData.oilResistance ? "true" : "false"}
              onChange={(e) => setFormData({ ...formData, oilResistance: e.target.value === "true" })}
            >
              <option value="false">❌ Нет</option>
              <option value="true">✅ Да</option>
            </StyledSelect>
          </FormGroup>

          <FormGroup>
            <Label>УФ-устойчивость</Label>
            <StyledSelect
              value={formData.uvResistance ? "true" : "false"}
              onChange={(e) => setFormData({ ...formData, uvResistance: e.target.value === "true" })}
            >
              <option value="false">❌ Нет</option>
              <option value="true">✅ Да</option>
            </StyledSelect>
          </FormGroup>

          <FormGroup>
            <Label>Хим. стойкость</Label>
            <Input
              value={formData.chemicalResistance}
              onChange={(e) => setFormData({ ...formData, chemicalResistance: e.target.value })}
              placeholder="Кислоты, Щёлочи..."
              fullWidth
            />
          </FormGroup>
        </FormRow3>

        {/* Срок службы */}
        <SectionTitle>⏳ Срок службы</SectionTitle>

        <FormRow>
          <FormGroup>
            <Label>Ожидаемый срок (лет)</Label>
            <Input
              type="number"
              step="1"
              min="1"
              max="50"
              value={formData.expectedLifetimeYears}
              onChange={(e) => setFormData({ ...formData, expectedLifetimeYears: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>

          <FormGroup>
            <Label>Деградация (%/год)</Label>
            <Input
              type="number"
              step="0.5"
              min="0"
              max="20"
              value={formData.degradationRatePerYear}
              onChange={(e) => setFormData({ ...formData, degradationRatePerYear: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>
        </FormRow>

        {/* Стоимость и описание */}
        <SectionTitle>💰 Стоимость</SectionTitle>

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
