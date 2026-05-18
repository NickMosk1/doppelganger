import { useState, useEffect, useCallback } from 'react';
import { EditorNode } from '../../../../../types';
import { debounce } from 'lodash';
import React from 'react';
import { PropertyGroup, PropertyLabel, PropertyInput, StatusBadge, StatsGrid, StatCard } from '../../RightPanel.styles';

interface FactorEditProps {
  node: EditorNode;
  onDataChange: (data: any) => void;
  initialData?: any;
}

const factorTypeOptions = [
  { value: "TEMPERATURE", label: "🌡️ Температура", unit: "°C", min: -50, max: 200 },
  { value: "EMI", label: "⚡ Электромагнитные помехи", unit: "dBm", min: 0, max: 120 },
  { value: "VIBRATION", label: "📳 Вибрация", unit: "Hz", min: 0, max: 200 },
  { value: "DUST", label: "🏭 Запыленность", unit: "mg/m³", min: 0, max: 100 },
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

const FactorEdit: React.FC<FactorEditProps> = ({ node, onDataChange, initialData }) => {
  const getCurrentValue = (field: string, defaultValue: any) => {
    if (initialData && initialData[field] !== undefined) return initialData[field];
    if (field === 'factorValue') return node.factorValue ?? node.factor?.factorValue ?? defaultValue;
    if (field === 'factorRadius') return node.factorRadius ?? node.factor?.factorRadius ?? defaultValue;
    if (field === 'customName') return node.customName || node.name || defaultValue;
    if (field === 'isEnabled') return node.isEnabled !== false;
    if (field === 'changeRatePerSecond') return node.changeRatePerSecond ?? node.factor?.changeRatePerSecond ?? defaultValue;
    if (field === 'minValue') return node.minValue ?? node.factor?.minValue ?? defaultValue;
    if (field === 'maxValue') return node.maxValue ?? node.factor?.maxValue ?? defaultValue;
    if (field === 'valueChangePattern') return node.valueChangePattern ?? node.factor?.valueChangePattern ?? defaultValue;
    if (field === 'frequencyHz') return node.frequencyHz ?? node.factor?.frequencyHz ?? defaultValue;
    if (field === 'startTimeSeconds') return node.startTimeSeconds ?? node.factor?.startTimeSeconds ?? defaultValue;
    if (field === 'durationSeconds') return node.durationSeconds ?? node.factor?.durationSeconds ?? defaultValue;
    if (field === 'falloffType') return node.falloffType ?? node.factor?.falloffType ?? defaultValue;
    if (field === 'falloffExponent') return node.falloffExponent ?? node.factor?.falloffExponent ?? defaultValue;
    if (field === 'warningThreshold') return node.warningThreshold ?? node.factor?.warningThreshold ?? defaultValue;
    if (field === 'criticalThreshold') return node.criticalThreshold ?? node.factor?.criticalThreshold ?? defaultValue;
    if (field === 'failureThreshold') return node.failureThreshold ?? node.factor?.failureThreshold ?? defaultValue;
    if (field === 'priority') return node.priority ?? node.factor?.priority ?? defaultValue;
    return defaultValue;
  };

  const [formData, setFormData] = useState({
    // Основные
    customName: getCurrentValue('customName', node.name),
    factorValue: getCurrentValue('factorValue', 25),
    factorRadius: getCurrentValue('factorRadius', 10),
    isEnabled: getCurrentValue('isEnabled', true),
    // Динамика
    changeRatePerSecond: getCurrentValue('changeRatePerSecond', 0),
    minValue: getCurrentValue('minValue', undefined),
    maxValue: getCurrentValue('maxValue', undefined),
    valueChangePattern: getCurrentValue('valueChangePattern', 'NONE'),
    frequencyHz: getCurrentValue('frequencyHz', 0),
    // Временные характеристики
    startTimeSeconds: getCurrentValue('startTimeSeconds', 0),
    durationSeconds: getCurrentValue('durationSeconds', undefined),
    // Пространственное распределение
    falloffType: getCurrentValue('falloffType', 'NONE'),
    falloffExponent: getCurrentValue('falloffExponent', 2.0),
    // Пороги
    warningThreshold: getCurrentValue('warningThreshold', undefined),
    criticalThreshold: getCurrentValue('criticalThreshold', undefined),
    failureThreshold: getCurrentValue('failureThreshold', undefined),
    // Приоритет
    priority: getCurrentValue('priority', 5),
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  const debouncedOnDataChange = useCallback(
    debounce((data: any) => {
      console.log("📤 Sending factor data change:", data);
      onDataChange(data);
    }, 300),
    [onDataChange]
  );

  useEffect(() => {
    debouncedOnDataChange(formData);
    return () => {
      debouncedOnDataChange.cancel();
    };
  }, [formData, debouncedOnDataChange]);

  const handleChange = (field: string, value: any) => {
    console.log(`✏️ Factor field changed: ${field} = ${value}`);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNumberChange = (field: string, value: string, min?: number, max?: number) => {
    let numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      if (min !== undefined) numValue = Math.max(min, numValue);
      if (max !== undefined) numValue = Math.min(max, numValue);
      handleChange(field, numValue);
    }
  };

  const currentTypeInfo = factorTypeOptions.find(opt => opt.value === node.factorType) || factorTypeOptions[0];
  const currentStatusText = formData.isEnabled ? "🟢 Активен" : "🔴 Неактивен";

  return (
    <>
      {/* Основные параметры */}
      <PropertyGroup>
        <PropertyLabel>Название</PropertyLabel>
        <PropertyInput
          type="text"
          value={formData.customName}
          onChange={(e) => handleChange('customName', e.target.value)}
          placeholder="Введите название фактора"
        />
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Тип фактора</PropertyLabel>
        <PropertyInput
          type="text"
          value={currentTypeInfo.label}
          disabled
        />
      </PropertyGroup>

      <StatsGrid>
        <StatCard>
          <PropertyLabel>Интенсивность ({currentTypeInfo.unit})</PropertyLabel>
          <PropertyInput
            type="number"
            step="1"
            min={currentTypeInfo.min}
            max={currentTypeInfo.max}
            value={formData.factorValue}
            onChange={(e) => handleNumberChange('factorValue', e.target.value, currentTypeInfo.min, currentTypeInfo.max)}
          />
        </StatCard>
        <StatCard>
          <PropertyLabel>Радиус влияния (м)</PropertyLabel>
          <PropertyInput
            type="number"
            step="1"
            min="1"
            max="100"
            value={formData.factorRadius}
            onChange={(e) => handleNumberChange('factorRadius', e.target.value, 1, 100)}
          />
        </StatCard>
        <StatCard>
          <PropertyLabel>Приоритет (1-10)</PropertyLabel>
          <PropertyInput
            type="number"
            step="1"
            min="1"
            max="10"
            value={formData.priority}
            onChange={(e) => handleNumberChange('priority', e.target.value, 1, 10)}
          />
        </StatCard>
        <StatCard>
          <PropertyLabel>Статус</PropertyLabel>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
              <input
                type="radio"
                checked={formData.isEnabled === true}
                onChange={() => handleChange('isEnabled', true)}
              />
              Активен
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
              <input
                type="radio"
                checked={formData.isEnabled === false}
                onChange={() => handleChange('isEnabled', false)}
              />
              Неактивен
            </label>
          </div>
          <StatusBadge status={formData.isEnabled ? "success" : "error"} style={{ marginTop: '8px' }}>
            {currentStatusText}
          </StatusBadge>
        </StatCard>
      </StatsGrid>

      {/* Динамика изменения */}
      <PropertyGroup>
        <PropertyLabel style={{ fontWeight: 600 }}>📈 Динамика изменения</PropertyLabel>
      </PropertyGroup>
      <StatsGrid>
        <StatCard>
          <PropertyLabel>Паттерн изменения</PropertyLabel>
          <PropertyInput
            type="select"
            value={formData.valueChangePattern}
            onChange={(e) => handleChange('valueChangePattern', e.target.value)}
            as="select"
          >
            {changePatternOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </PropertyInput>
        </StatCard>
        {formData.valueChangePattern !== 'NONE' && (
          <StatCard>
            <PropertyLabel>Скорость изменения ({currentTypeInfo.unit}/с)</PropertyLabel>
            <PropertyInput
              type="number"
              step="0.5"
              min="0"
              max="100"
              value={formData.changeRatePerSecond}
              onChange={(e) => handleNumberChange('changeRatePerSecond', e.target.value, 0, 100)}
            />
          </StatCard>
        )}
        {formData.valueChangePattern === 'SINE' && (
          <StatCard>
            <PropertyLabel>Частота (Гц)</PropertyLabel>
            <PropertyInput
              type="number"
              step="1"
              min="0"
              max="1000"
              value={formData.frequencyHz}
              onChange={(e) => handleNumberChange('frequencyHz', e.target.value, 0, 1000)}
            />
          </StatCard>
        )}
      </StatsGrid>

      {(formData.minValue !== undefined || formData.maxValue !== undefined) && (
        <StatsGrid>
          <StatCard>
            <PropertyLabel>Мин. значение ({currentTypeInfo.unit})</PropertyLabel>
            <PropertyInput
              type="number"
              step="1"
              value={formData.minValue !== undefined ? formData.minValue : ''}
              onChange={(e) => handleChange('minValue', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="—"
            />
          </StatCard>
          <StatCard>
            <PropertyLabel>Макс. значение ({currentTypeInfo.unit})</PropertyLabel>
            <PropertyInput
              type="number"
              step="1"
              value={formData.maxValue !== undefined ? formData.maxValue : ''}
              onChange={(e) => handleChange('maxValue', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="—"
            />
          </StatCard>
        </StatsGrid>
      )}

      {/* Временные характеристики */}
      <PropertyGroup>
        <PropertyLabel style={{ fontWeight: 600 }}>⏱️ Временные характеристики</PropertyLabel>
      </PropertyGroup>
      <StatsGrid>
        <StatCard>
          <PropertyLabel>Начало действия (сек)</PropertyLabel>
          <PropertyInput
            type="number"
            step="1"
            min="0"
            value={formData.startTimeSeconds}
            onChange={(e) => handleNumberChange('startTimeSeconds', e.target.value, 0)}
          />
        </StatCard>
        <StatCard>
          <PropertyLabel>Длительность (сек)</PropertyLabel>
          <PropertyInput
            type="number"
            step="1"
            min="0"
            value={formData.durationSeconds !== undefined ? formData.durationSeconds : ''}
            onChange={(e) => handleChange('durationSeconds', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="Постоянно"
          />
        </StatCard>
      </StatsGrid>

      {/* Пространственное распределение */}
      <PropertyGroup>
        <PropertyLabel style={{ fontWeight: 600 }}>🗺️ Пространственное распределение</PropertyLabel>
      </PropertyGroup>
      <StatsGrid>
        <StatCard>
          <PropertyLabel>Тип затухания</PropertyLabel>
          <PropertyInput
            type="select"
            value={formData.falloffType}
            onChange={(e) => handleChange('falloffType', e.target.value)}
            as="select"
          >
            {falloffTypeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </PropertyInput>
        </StatCard>
        {formData.falloffType === 'INVERSE_SQUARE' && (
          <StatCard>
            <PropertyLabel>Степень затухания</PropertyLabel>
            <PropertyInput
              type="number"
              step="0.5"
              min="0.5"
              max="3"
              value={formData.falloffExponent}
              onChange={(e) => handleNumberChange('falloffExponent', e.target.value, 0.5, 3)}
            />
          </StatCard>
        )}
      </StatsGrid>

      {/* Пороги срабатывания */}
      <PropertyGroup>
        <PropertyLabel style={{ fontWeight: 600 }}>⚠️ Пороги срабатывания</PropertyLabel>
      </PropertyGroup>
      <StatsGrid>
        <StatCard>
          <PropertyLabel>Предупреждение ({currentTypeInfo.unit})</PropertyLabel>
          <PropertyInput
            type="number"
            step="1"
            value={formData.warningThreshold !== undefined ? formData.warningThreshold : ''}
            onChange={(e) => handleChange('warningThreshold', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="—"
          />
        </StatCard>
        <StatCard>
          <PropertyLabel>Критический ({currentTypeInfo.unit})</PropertyLabel>
          <PropertyInput
            type="number"
            step="1"
            value={formData.criticalThreshold !== undefined ? formData.criticalThreshold : ''}
            onChange={(e) => handleChange('criticalThreshold', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="—"
          />
        </StatCard>
        <StatCard>
          <PropertyLabel>Отказ ({currentTypeInfo.unit})</PropertyLabel>
          <PropertyInput
            type="number"
            step="1"
            value={formData.failureThreshold !== undefined ? formData.failureThreshold : ''}
            onChange={(e) => handleChange('failureThreshold', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="—"
          />
        </StatCard>
      </StatsGrid>
    </>
  );
};

export default FactorEdit;
