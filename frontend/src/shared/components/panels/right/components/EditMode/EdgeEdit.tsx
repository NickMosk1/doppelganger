// src/shared/components/RightPanel/components/EditMode/EdgeEdit.tsx
import { useState, useEffect } from 'react';
import { EditorEdge, ConnectionType } from '../../../../../types';
import { PropertyGroup, PropertyLabel, PropertyInput, StatusBadge, NoSelectionMessage } from '../../RightPanel.styles';
import { debounce } from 'lodash';
import React from 'react';

interface EdgeEditProps {
  edge: EditorEdge;
  onDataChange: (data: any) => void;
  initialData?: any;
}

const EdgeEdit: React.FC<EdgeEditProps> = ({ edge, onDataChange, initialData }) => {
  // Для CABLE_DEVICE типа - не показываем редактирование
  if (edge.connectionType === ConnectionType.CABLE_DEVICE) {
    return (
      <NoSelectionMessage>
        <span>🔌</span>
        <p>Это техническая связь между кабелем и устройством.<br />
        Параметры кабеля можно отредактировать,<br />
        выбрав сам кабель на схеме.</p>
      </NoSelectionMessage>
    );
  }

  // Для FACTOR_ELEMENT типа - редактируем расстояние
  const [formData, setFormData] = useState({
    distance: initialData?.distance !== undefined 
      ? initialData.distance 
      : (edge.factorData?.distance || 10),
    isActive: initialData?.isActive !== undefined 
      ? initialData.isActive 
      : (edge.isActive !== false),
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

  const getFactorTypeLabel = () => {
    const factorType = edge.factorData?.factorType;
    switch (factorType) {
      case "TEMPERATURE": return "🌡️ Температура";
      case "EMI": return "⚡ ЭМИ";
      case "VIBRATION": return "📳 Вибрация";
      case "DUST": return "🏭 Запыленность";
      default: return "📊 Фактор";
    }
  };

  return (
    <>
      <PropertyGroup>
        <PropertyLabel>Тип воздействия</PropertyLabel>
        <PropertyInput
          type="text"
          value={getFactorTypeLabel()}
          disabled
        />
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Расстояние до источника (м)</PropertyLabel>
        <PropertyInput
          type="number"
          step="1"
          min="0"
          value={formData.distance}
          onChange={(e) => handleChange('distance', parseFloat(e.target.value))}
        />
      </PropertyGroup>
      
      <PropertyGroup>
        <PropertyLabel>Статус связи</PropertyLabel>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="radio"
              checked={formData.isActive}
              onChange={() => handleChange('isActive', true)}
            />
            Активна
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="radio"
              checked={!formData.isActive}
              onChange={() => handleChange('isActive', false)}
            />
            Неактивна
          </label>
        </div>
        <StatusBadge status={formData.isActive ? "success" : "error"} style={{ marginTop: '8px' }}>
          {formData.isActive ? "🟢 Активна" : "🔴 Неактивна"}
        </StatusBadge>
      </PropertyGroup>
    </>
  );
};

export default EdgeEdit;
