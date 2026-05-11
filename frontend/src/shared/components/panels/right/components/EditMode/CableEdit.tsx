import React, { useState, useEffect } from 'react';
import { EditorNode } from '../../../../../types';
import { PropertyGroup, PropertyLabel, PropertyInput } from '../../RightPanel.styles';
import { debounce } from 'lodash';

interface CableEditProps {
  node: EditorNode;
  onDataChange: (data: any) => void;
  initialData?: any;
}

const CableEdit: React.FC<CableEditProps> = ({ node, onDataChange, initialData }) => {
  const [formData, setFormData] = useState({
    customName: initialData?.customName !== undefined ? initialData.customName : (node.customName || node.name),
    lengthM: initialData?.lengthM !== undefined ? initialData.lengthM : (node.lengthM || 10),
  });

  // Дебаунс для отправки изменений
  const debouncedOnDataChange = React.useCallback(
    debounce((data: any) => {
      onDataChange(data);
    }, 300),
    [onDataChange]
  );

  // Отправляем изменения только когда formData реально меняется (пользователем)
  useEffect(() => {
    debouncedOnDataChange(formData);
    return () => {
      debouncedOnDataChange.cancel();
    };
  }, [formData, debouncedOnDataChange]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLengthChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 10000) {
      handleChange('lengthM', numValue);
    }
  };

  const getCableTypeIcon = () => {
    switch (node.cableType) {
      case "COPPER": return "🔌";
      case "FIBER": return "💡";
      case "TWISTED_PAIR": return "🔄";
      case "COAXIAL": return "📺";
      case "SHIELDED": return "🛡️";
      case "INDUSTRIAL": return "🏭";
      default: return "🔌";
    }
  };

  const getCableTypeLabel = () => {
    switch (node.cableType) {
      case "COPPER": return "Медный кабель";
      case "FIBER": return "Оптоволокно";
      case "TWISTED_PAIR": return "Витая пара";
      case "COAXIAL": return "Коаксиальный кабель";
      case "SHIELDED": return "Экранированный кабель";
      case "INDUSTRIAL": return "Промышленный кабель";
      default: return node.cableType || "Ethernet";
    }
  };

  return (
    <>
      <PropertyGroup>
        <PropertyLabel>Название</PropertyLabel>
        <PropertyInput
          type="text"
          value={formData.customName}
          onChange={(e) => handleChange('customName', e.target.value)}
          placeholder="Введите название кабеля"
        />
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Тип</PropertyLabel>
        <PropertyInput
          type="text"
          value={`${getCableTypeIcon()} ${getCableTypeLabel()}`}
          disabled
        />
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Длина (м)</PropertyLabel>
        <PropertyInput
          type="number"
          step="1"
          min="0"
          max="10000"
          value={formData.lengthM}
          onChange={(e) => handleLengthChange(e.target.value)}
        />
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Пропускная способность</PropertyLabel>
        <PropertyInput
          type="text"
          value={`${node.bandwidthMbps || 1000} Мбит/с`}
          disabled
        />
      </PropertyGroup>
    </>
  );
};

export default CableEdit;
