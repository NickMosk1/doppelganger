import React, { useEffect } from 'react';
import { useState } from 'react';
import styled from 'styled-components';
import { Button, Input } from '../../../components';
import Modal from '../Modal';

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

const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 16px 0 12px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid #e2e8f0;
`;

const HelperText = styled.div`
  font-size: 11px;
  color: #999;
  margin-top: 4px;
`;

interface AddFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (factor: any) => void;
  defaultType?: string;
}

const factorTypeOptions = [
  { value: "TEMPERATURE", label: "🌡️ Температура", unit: "°C", defaultRadius: 15, min: -50, max: 200 },
  { value: "EMI", label: "⚡ Электромагнитные помехи", unit: "dBm", defaultRadius: 20, min: 0, max: 120 },
  { value: "VIBRATION", label: "📳 Вибрация", unit: "Hz", defaultRadius: 10, min: 0, max: 200 },
  { value: "DUST", label: "🏭 Запыленность", unit: "mg/m³", defaultRadius: 12, min: 0, max: 100 },
];

const changePatternOptions = [
  { value: "NONE", label: "Постоянное" },
  { value: "LINEAR", label: "Линейное" },
  { value: "SINE", label: "Синусоидальное" },
  { value: "STEP", label: "Ступенчатое" },
  { value: "RANDOM", label: "Случайное" },
];

const falloffTypeOptions = [
  { value: "NONE", label: "Отсутствует" },
  { value: "LINEAR", label: "Линейное" },
  { value: "INVERSE_SQUARE", label: "Обратный квадрат" },
  { value: "STEP", label: "Ступенчатое" },
];

const AddFactorModal: React.FC<AddFactorModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  defaultType = "TEMPERATURE"
}) => {
  const selectedTypeInfo = factorTypeOptions.find(opt => opt.value === defaultType) || factorTypeOptions[0];

  const getDefaultValue = (type: string): number => {
    switch (type) {
      case "TEMPERATURE": return 25;
      case "EMI": return 20;
      case "VIBRATION": return 10;
      case "DUST": return 15;
      default: return 25;
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    factorType: defaultType,
    factorValue: getDefaultValue(defaultType),
    factorUnit: selectedTypeInfo.unit,
    factorRadius: selectedTypeInfo.defaultRadius,
    // Динамика изменения
    changeRatePerSecond: 0,
    minValue: undefined as number | undefined,
    maxValue: undefined as number | undefined,
    valueChangePattern: 'NONE',
    frequencyHz: 0,
    // Временные характеристики
    startTimeSeconds: 0,
    durationSeconds: undefined as number | undefined,
    // Пространственное распределение
    falloffType: 'NONE',
    falloffExponent: 2.0,
    // Пороги
    warningThreshold: undefined as number | undefined,
    criticalThreshold: undefined as number | undefined,
    failureThreshold: undefined as number | undefined,
    // Приоритет
    priority: 5,
    description: '',
  });

  useEffect(() => {
    const typeInfo = factorTypeOptions.find(opt => opt.value === formData.factorType) || factorTypeOptions[0];
    setFormData(prev => ({
      ...prev,
      factorUnit: typeInfo.unit,
      factorRadius: typeInfo.defaultRadius,
    }));
  }, [formData.factorType]);

  useEffect(() => {
    if (isOpen) {
      const typeInfo = factorTypeOptions.find(opt => opt.value === defaultType) || factorTypeOptions[0];
      setFormData({
        name: '',
        factorType: defaultType,
        factorValue: getDefaultValue(defaultType),
        factorUnit: typeInfo.unit,
        factorRadius: typeInfo.defaultRadius,
        changeRatePerSecond: 0,
        minValue: undefined,
        maxValue: undefined,
        valueChangePattern: 'NONE',
        frequencyHz: 0,
        startTimeSeconds: 0,
        durationSeconds: undefined,
        falloffType: 'NONE',
        falloffExponent: 2.0,
        warningThreshold: undefined,
        criticalThreshold: undefined,
        failureThreshold: undefined,
        priority: 5,
        description: '',
      });
    }
  }, [defaultType, isOpen]);

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert('Введите название фактора');
      return;
    }

    const getIcon = () => {
      switch (formData.factorType) {
        case "TEMPERATURE": return "🌡️";
        case "EMI": return "⚡";
        case "VIBRATION": return "📳";
        case "DUST": return "🏭";
        default: return "📊";
      }
    };

    onAdd({
      ...formData,
      id: `factor-${Date.now()}`,
      icon: getIcon(),
      isCustom: true,
    });
    onClose();
  };

  const currentTypeInfo = factorTypeOptions.find(opt => opt.value === formData.factorType) || factorTypeOptions[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Добавить промышленный фактор"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSubmit}>Добавить</Button>
        </>
      }
    >
      {/* Основная информация */}
      <SectionTitle>📋 Основная информация</SectionTitle>

      <FormGroup>
        <Input
          label="Название"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Например: Печь №3, Электродвигатель М1"
          fullWidth
        />
      </FormGroup>

      <FormRow>
        <FormGroup>
          <Label>Тип фактора</Label>
          <Select
            value={formData.factorType}
            onChange={(e) => setFormData({ ...formData, factorType: e.target.value })}
          >
            {factorTypeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Input
            label={`Интенсивность (${currentTypeInfo.unit})`}
            type="number"
            step="1"
            min={currentTypeInfo.min}
            max={currentTypeInfo.max}
            value={formData.factorValue}
            onChange={(e) => setFormData({ ...formData, factorValue: Number(e.target.value) })}
            fullWidth
          />
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup>
          <Input
            label="Радиус влияния (м)"
            type="number"
            step="1"
            min="1"
            max="100"
            value={formData.factorRadius}
            onChange={(e) => setFormData({ ...formData, factorRadius: Number(e.target.value) })}
            fullWidth
          />
        </FormGroup>

        <FormGroup>
          <Input
            label="Приоритет (1-10)"
            type="number"
            step="1"
            min="1"
            max="10"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
            fullWidth
          />
          <HelperText>Чем выше, тем важнее влияние</HelperText>
        </FormGroup>
      </FormRow>

      {/* Динамика изменения */}
      <SectionTitle>📈 Динамика изменения</SectionTitle>

      <FormRow>
        <FormGroup>
          <Label>Паттерн изменения</Label>
          <Select
            value={formData.valueChangePattern}
            onChange={(e) => setFormData({ ...formData, valueChangePattern: e.target.value })}
          >
            {changePatternOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </FormGroup>

        {formData.valueChangePattern !== 'NONE' && (
          <FormGroup>
            <Input
              label={`Скорость изменения (${currentTypeInfo.unit}/с)`}
              type="number"
              step="0.5"
              min="0"
              max="100"
              value={formData.changeRatePerSecond}
              onChange={(e) => setFormData({ ...formData, changeRatePerSecond: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>
        )}
      </FormRow>

      {formData.valueChangePattern === 'SINE' && (
        <FormGroup>
          <Input
            label="Частота (Гц)"
            type="number"
            step="1"
            min="0"
            max="1000"
            value={formData.frequencyHz}
            onChange={(e) => setFormData({ ...formData, frequencyHz: Number(e.target.value) })}
            fullWidth
          />
        </FormGroup>
      )}

      <FormRow>
        <FormGroup>
          <Input
            label="Мин. значение (опционально)"
            type="number"
            step="1"
            value={formData.minValue !== undefined ? formData.minValue : ''}
            onChange={(e) => setFormData({ ...formData, minValue: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="Не ограничено"
            fullWidth
          />
        </FormGroup>

        <FormGroup>
          <Input
            label="Макс. значение (опционально)"
            type="number"
            step="1"
            value={formData.maxValue !== undefined ? formData.maxValue : ''}
            onChange={(e) => setFormData({ ...formData, maxValue: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="Не ограничено"
            fullWidth
          />
        </FormGroup>
      </FormRow>

      {/* Временные характеристики */}
      <SectionTitle>⏱️ Временные характеристики</SectionTitle>

      <FormRow>
        <FormGroup>
          <Input
            label="Начало действия (сек)"
            type="number"
            step="1"
            min="0"
            value={formData.startTimeSeconds}
            onChange={(e) => setFormData({ ...formData, startTimeSeconds: Number(e.target.value) })}
            fullWidth
          />
          <HelperText>Через сколько секунд после старта симуляции</HelperText>
        </FormGroup>

        <FormGroup>
          <Input
            label="Длительность (сек)"
            type="number"
            step="1"
            min="0"
            value={formData.durationSeconds !== undefined ? formData.durationSeconds : ''}
            onChange={(e) => setFormData({ ...formData, durationSeconds: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="Постоянно"
            fullWidth
          />
          <HelperText>Оставьте пустым для постоянного действия</HelperText>
        </FormGroup>
      </FormRow>

      {/* Пространственное распределение */}
      <SectionTitle>🗺️ Пространственное распределение</SectionTitle>

      <FormRow>
        <FormGroup>
          <Label>Тип затухания</Label>
          <Select
            value={formData.falloffType}
            onChange={(e) => setFormData({ ...formData, falloffType: e.target.value })}
          >
            {falloffTypeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
          <HelperText>Как уменьшается влияние с расстоянием</HelperText>
        </FormGroup>

        {formData.falloffType === 'INVERSE_SQUARE' && (
          <FormGroup>
            <Input
              label="Степень затухания"
              type="number"
              step="0.5"
              min="0.5"
              max="3"
              value={formData.falloffExponent}
              onChange={(e) => setFormData({ ...formData, falloffExponent: Number(e.target.value) })}
              fullWidth
            />
          </FormGroup>
        )}
      </FormRow>

      {/* Пороги срабатывания */}
      <SectionTitle>⚠️ Пороги срабатывания</SectionTitle>

      <FormRow3>
        <FormGroup>
          <Input
            label={`Предупреждение (${currentTypeInfo.unit})`}
            type="number"
            step="1"
            value={formData.warningThreshold !== undefined ? formData.warningThreshold : ''}
            onChange={(e) => setFormData({ ...formData, warningThreshold: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="Не установлен"
            fullWidth
          />
        </FormGroup>

        <FormGroup>
          <Input
            label={`Критический (${currentTypeInfo.unit})`}
            type="number"
            step="1"
            value={formData.criticalThreshold !== undefined ? formData.criticalThreshold : ''}
            onChange={(e) => setFormData({ ...formData, criticalThreshold: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="Не установлен"
            fullWidth
          />
        </FormGroup>

        <FormGroup>
          <Input
            label={`Отказ (${currentTypeInfo.unit})`}
            type="number"
            step="1"
            value={formData.failureThreshold !== undefined ? formData.failureThreshold : ''}
            onChange={(e) => setFormData({ ...formData, failureThreshold: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="Не установлен"
            fullWidth
          />
        </FormGroup>
      </FormRow3>

      {/* Описание */}
      <SectionTitle>📝 Описание</SectionTitle>

      <FormGroup>
        <Input
          label="Описание"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Описание источника фактора..."
          fullWidth
        />
      </FormGroup>
    </Modal>
  );
};

export default AddFactorModal;
