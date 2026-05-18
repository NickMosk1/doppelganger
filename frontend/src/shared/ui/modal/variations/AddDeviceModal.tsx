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

const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.text};
  margin: 16px 0 12px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid ${colors.border};
`;

const IpRatingSelect = styled.select`
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

const ipRatingOptions = [
  { value: 'IP20', label: 'IP20 (Обычная)' },
  { value: 'IP30', label: 'IP30 (Базовая защита)' },
  { value: 'IP40', label: 'IP40 (Защита от частиц)' },
  { value: 'IP54', label: 'IP54 (Пылезащита)' },
  { value: 'IP65', label: 'IP65 (Пыле-влагозащита)' },
  { value: 'IP67', label: 'IP67 (Полная защита)' },
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
    model: '',
    portCount: 4,
    baseLatencyMs: 1,
    maxThroughputMbps: 100,
    // Промышленные коэффициенты
    tempCoefficient: 1.0,
    emiCoefficient: 1.0,
    vibrationCoefficient: 1.0,
    dustCoefficient: 1.0,
    // Допустимые диапазоны
    maxOperatingTemp: 70,
    minOperatingTemp: 0,
    maxEmiTolerance: 80,
    maxVibrationTolerance: 100,
    // Надежность
    mtbfHours: 50000,
    mttrMinutes: 30,
    warmUpTimeSeconds: 10,
    // Экономика
    replacementCost: 0,
    repairCost: 0,
    // Энергопотребление и защита
    powerConsumptionWatts: 100,
    heatGenerationWatts: 80,
    ipRating: 'IP20',
    operatingHumidityMax: 85,
    needsCooling: false,
    hasRedundantPower: false,
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
      model: formData.model || null,
      portCount: formData.portCount,
      baseLatencyMs: formData.baseLatencyMs,
      maxThroughputMbps: formData.maxThroughputMbps,
      tempCoefficient: formData.tempCoefficient,
      emiCoefficient: formData.emiCoefficient,
      vibrationCoefficient: formData.vibrationCoefficient,
      dustCoefficient: formData.dustCoefficient,
      maxOperatingTemp: formData.maxOperatingTemp,
      minOperatingTemp: formData.minOperatingTemp,
      maxEmiTolerance: formData.maxEmiTolerance,
      maxVibrationTolerance: formData.maxVibrationTolerance,
      mtbfHours: formData.mtbfHours,
      mttrMinutes: formData.mttrMinutes,
      warmUpTimeSeconds: formData.warmUpTimeSeconds,
      replacementCost: formData.replacementCost,
      repairCost: formData.repairCost,
      powerConsumptionWatts: formData.powerConsumptionWatts,
      heatGenerationWatts: formData.heatGenerationWatts,
      ipRating: formData.ipRating,
      operatingHumidityMax: formData.operatingHumidityMax,
      needsCooling: formData.needsCooling,
      hasRedundantPower: formData.hasRedundantPower,
      description: formData.description || null,
      iconUrl: null,
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
      portCount: 4,
      baseLatencyMs: 1,
      maxThroughputMbps: 100,
      tempCoefficient: 1.0,
      emiCoefficient: 1.0,
      vibrationCoefficient: 1.0,
      dustCoefficient: 1.0,
      maxOperatingTemp: 70,
      minOperatingTemp: 0,
      maxEmiTolerance: 80,
      maxVibrationTolerance: 100,
      mtbfHours: 50000,
      mttrMinutes: 30,
      warmUpTimeSeconds: 10,
      replacementCost: 0,
      repairCost: 0,
      powerConsumptionWatts: 100,
      heatGenerationWatts: 80,
      ipRating: 'IP20',
      operatingHumidityMax: 85,
      needsCooling: false,
      hasRedundantPower: false,
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
      title="Добавить устройство"
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
            <Label>Модель</Label>
            <Input
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder="Модель устройства"
              fullWidth
            />
          </FormGroup>

          <FormGroup>
            <Label>Кол-во портов</Label>
            <Input
              type="number"
              min="0"
              max="48"
              value={formData.portCount}
              onChange={(e) => setFormData({ ...formData, portCount: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>
        </FormRow>

        {/* Сетевые параметры */}
        <SectionTitle>🌐 Сетевые параметры</SectionTitle>

        <FormRow>
          <FormGroup>
            <Label>Базовая задержка (мс)</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.baseLatencyMs}
              onChange={(e) => setFormData({ ...formData, baseLatencyMs: Number(e.target.value) })}
              fullWidth
            />
            <HelperText>Время обработки пакета</HelperText>
          </FormGroup>

          <FormGroup>
            <Label>Макс. пропускная способность (Мбит/с)</Label>
            <Input
              type="number"
              step="100"
              min="0"
              max="100000"
              value={formData.maxThroughputMbps}
              onChange={(e) => setFormData({ ...formData, maxThroughputMbps: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>
        </FormRow>

        {/* Промышленные коэффициенты */}
        <SectionTitle>🏭 Промышленные коэффициенты</SectionTitle>

        <FormRow>
          <FormGroup>
            <Label>Чувствительность к температуре</Label>
            <Input
              type="number"
              step="0.1"
              min="0.5"
              max="3"
              value={formData.tempCoefficient}
              onChange={(e) => setFormData({ ...formData, tempCoefficient: Number(e.target.value) })}
              fullWidth
            />
            <HelperText>1.0 = норма, выше = более чувствительный</HelperText>
          </FormGroup>

          <FormGroup>
            <Label>Чувствительность к ЭМИ</Label>
            <Input
              type="number"
              step="0.1"
              min="0.5"
              max="3"
              value={formData.emiCoefficient}
              onChange={(e) => setFormData({ ...formData, emiCoefficient: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label>Чувствительность к вибрации</Label>
            <Input
              type="number"
              step="0.1"
              min="0.5"
              max="3"
              value={formData.vibrationCoefficient}
              onChange={(e) => setFormData({ ...formData, vibrationCoefficient: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>

          <FormGroup>
            <Label>Чувствительность к пыли</Label>
            <Input
              type="number"
              step="0.1"
              min="0.5"
              max="3"
              value={formData.dustCoefficient}
              onChange={(e) => setFormData({ ...formData, dustCoefficient: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>
        </FormRow>

        {/* Допустимые диапазоны */}
        <SectionTitle>⚠️ Допустимые диапазоны</SectionTitle>

        <FormRow>
          <FormGroup>
            <Label>Макс. температура (°C)</Label>
            <Input
              type="number"
              step="5"
              min="-40"
              max="100"
              value={formData.maxOperatingTemp}
              onChange={(e) => setFormData({ ...formData, maxOperatingTemp: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>

          <FormGroup>
            <Label>Мин. температура (°C)</Label>
            <Input
              type="number"
              step="5"
              min="-40"
              max="50"
              value={formData.minOperatingTemp}
              onChange={(e) => setFormData({ ...formData, minOperatingTemp: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label>Макс. ЭМИ (dBm)</Label>
            <Input
              type="number"
              step="5"
              min="20"
              max="120"
              value={formData.maxEmiTolerance}
              onChange={(e) => setFormData({ ...formData, maxEmiTolerance: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>

          <FormGroup>
            <Label>Макс. вибрация (Hz)</Label>
            <Input
              type="number"
              step="10"
              min="20"
              max="200"
              value={formData.maxVibrationTolerance}
              onChange={(e) => setFormData({ ...formData, maxVibrationTolerance: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>
        </FormRow>

        {/* Надежность */}
        <SectionTitle>🔧 Надежность</SectionTitle>

        <FormRow>
          <FormGroup>
            <Label>MTBF (часы)</Label>
            <Input
              type="number"
              step="10000"
              min="1000"
              max="500000"
              value={formData.mtbfHours}
              onChange={(e) => setFormData({ ...formData, mtbfHours: Number(e.target.value) })}
              fullWidth
            />
            <HelperText>Среднее время между отказами</HelperText>
          </FormGroup>

          <FormGroup>
            <Label>MTTR (минуты)</Label>
            <Input
              type="number"
              step="5"
              min="5"
              max="240"
              value={formData.mttrMinutes}
              onChange={(e) => setFormData({ ...formData, mttrMinutes: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label>Время прогрева (сек)</Label>
            <Input
              type="number"
              step="1"
              min="0"
              max="120"
              value={formData.warmUpTimeSeconds}
              onChange={(e) => setFormData({ ...formData, warmUpTimeSeconds: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>
        </FormRow>

        {/* Экономические показатели */}
        <SectionTitle>💰 Экономические показатели</SectionTitle>

        <FormRow>
          <FormGroup>
            <Label>Стоимость замены (₽)</Label>
            <Input
              type="number"
              step="1000"
              min="0"
              max="10000000"
              value={formData.replacementCost}
              onChange={(e) => setFormData({ ...formData, replacementCost: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>

          <FormGroup>
            <Label>Стоимость ремонта (₽)</Label>
            <Input
              type="number"
              step="1000"
              min="0"
              max="5000000"
              value={formData.repairCost}
              onChange={(e) => setFormData({ ...formData, repairCost: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>
        </FormRow>

        {/* Энергопотребление и защита */}
        <SectionTitle>⚡ Энергопотребление и защита</SectionTitle>

        <FormRow>
          <FormGroup>
            <Label>Энергопотребление (Вт)</Label>
            <Input
              type="number"
              step="10"
              min="0"
              max="2000"
              value={formData.powerConsumptionWatts}
              onChange={(e) => setFormData({ ...formData, powerConsumptionWatts: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>

          <FormGroup>
            <Label>Тепловыделение (Вт)</Label>
            <Input
              type="number"
              step="10"
              min="0"
              max="2000"
              value={formData.heatGenerationWatts}
              onChange={(e) => setFormData({ ...formData, heatGenerationWatts: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label>IP защита</Label>
            <IpRatingSelect
              value={formData.ipRating}
              onChange={(e) => setFormData({ ...formData, ipRating: e.target.value })}
            >
              {ipRatingOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </IpRatingSelect>
          </FormGroup>

          <FormGroup>
            <Label>Макс. влажность (%)</Label>
            <Input
              type="number"
              step="5"
              min="0"
              max="100"
              value={formData.operatingHumidityMax}
              onChange={(e) => setFormData({ ...formData, operatingHumidityMax: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label>Требуется охлаждение</Label>
            <StyledSelect
              value={formData.needsCooling ? "true" : "false"}
              onChange={(e) => setFormData({ ...formData, needsCooling: e.target.value === "true" })}
            >
              <option value="false">❌ Нет</option>
              <option value="true">✅ Да</option>
            </StyledSelect>
          </FormGroup>

          <FormGroup>
            <Label>Резервное питание</Label>
            <StyledSelect
              value={formData.hasRedundantPower ? "true" : "false"}
              onChange={(e) => setFormData({ ...formData, hasRedundantPower: e.target.value === "true" })}
            >
              <option value="false">❌ Нет</option>
              <option value="true">✅ Да</option>
            </StyledSelect>
          </FormGroup>
        </FormRow>

        {/* Описание */}
        <SectionTitle>📝 Описание</SectionTitle>

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
