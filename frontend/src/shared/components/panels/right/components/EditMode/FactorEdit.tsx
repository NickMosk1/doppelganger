import { useState, useEffect } from 'react';
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
  const [formData, setFormData] = useState({
    customName: initialData?.customName !== undefined ? initialData.customName : (node.customName || node.name),
    factorValue: initialData?.factorValue !== undefined ? initialData.factorValue : (node.factorValue || 25),
    factorRadius: initialData?.factorRadius !== undefined ? initialData.factorRadius : (node.factorRadius || 10),
    isEnabled: initialData?.isEnabled !== undefined ? initialData.isEnabled : (node.isEnabled !== false),
  });

  const debouncedOnDataChange = React.useCallback(
    debounce((data: any) => {
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const currentTypeInfo = factorTypeOptions.find(opt => opt.value === node.factorType) || factorTypeOptions[0];

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

      <PropertyGroup>
        <PropertyLabel>Статус</PropertyLabel>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="radio"
              checked={formData.isEnabled}
              onChange={() => handleChange('isEnabled', true)}
            />
            Активен
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="radio"
              checked={!formData.isEnabled}
              onChange={() => handleChange('isEnabled', false)}
            />
            Неактивен
          </label>
        </div>
        <StatusBadge status={formData.isEnabled ? "success" : "error"} style={{ marginTop: '8px' }}>
          {formData.isEnabled ? "🟢 Активен" : "🔴 Неактивен"}
        </StatusBadge>
      </PropertyGroup>
    </>
  );
};

export default FactorEdit;
