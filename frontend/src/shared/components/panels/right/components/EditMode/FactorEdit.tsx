import { useState, useEffect, useCallback } from 'react';
import { EditorNode } from '../../../../../types';
import { debounce } from 'lodash';
import React from 'react';
import { PropertyGroup, PropertyLabel, PropertyInput, StatusBadge } from '../../RightPanel.styles';

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

const FactorEdit: React.FC<FactorEditProps> = ({ node, onDataChange, initialData }) => {
  // Получаем актуальные значения из node (с приоритетом на прямые поля)
  const getCurrentValue = (field: string, defaultValue: any) => {
    if (initialData && initialData[field] !== undefined) return initialData[field];
    if (field === 'factorValue') return node.factorValue ?? node.factor?.factorValue ?? defaultValue;
    if (field === 'factorRadius') return node.factorRadius ?? node.factor?.factorRadius ?? defaultValue;
    if (field === 'customName') return node.customName || node.name || defaultValue;
    if (field === 'isEnabled') return node.isEnabled !== false;
    return defaultValue;
  };

  const [formData, setFormData] = useState({
    customName: getCurrentValue('customName', node.name),
    factorValue: getCurrentValue('factorValue', 25),
    factorRadius: getCurrentValue('factorRadius', 10),
    isEnabled: getCurrentValue('isEnabled', true),
  });

  // Синхронизация с initialData
  useEffect(() => {
    if (initialData) {
      setFormData({
        customName: initialData.customName !== undefined ? initialData.customName : (node.customName || node.name),
        factorValue: initialData.factorValue !== undefined ? initialData.factorValue : (node.factorValue ?? node.factor?.factorValue ?? 25),
        factorRadius: initialData.factorRadius !== undefined ? initialData.factorRadius : (node.factorRadius ?? node.factor?.factorRadius ?? 10),
        isEnabled: initialData.isEnabled !== undefined ? initialData.isEnabled : (node.isEnabled !== false),
      });
    }
  }, [initialData, node.customName, node.factorValue, node.factorRadius, node.isEnabled]);

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

  const currentTypeInfo = factorTypeOptions.find(opt => opt.value === node.factorType) || factorTypeOptions[0];
  const currentIsEnabled = formData.isEnabled;
  const currentStatusText = currentIsEnabled ? "🟢 Активен" : "🔴 Неактивен";

  return (
    <>
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

      <PropertyGroup>
        <PropertyLabel>Интенсивность ({currentTypeInfo.unit})</PropertyLabel>
        <PropertyInput
          type="number"
          step="1"
          min={currentTypeInfo.min}
          max={currentTypeInfo.max}
          value={formData.factorValue}
          onChange={(e) => handleChange('factorValue', parseFloat(e.target.value))}
        />
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Радиус влияния (м)</PropertyLabel>
        <PropertyInput
          type="number"
          step="1"
          min="1"
          max="100"
          value={formData.factorRadius}
          onChange={(e) => handleChange('factorRadius', parseFloat(e.target.value))}
        />
      </PropertyGroup>
    </>
  );
};

export default FactorEdit;
