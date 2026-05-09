import React, { useState, useEffect } from 'react';
import { EditorNode } from '../../../../../types';
import { PropertyGroup, PropertyLabel, PropertyInput } from '../../RightPanel.styles';

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

  // Обновляем форму при изменении initialData
  useEffect(() => {
    setFormData({
      customName: initialData?.customName !== undefined ? initialData.customName : (node.customName || node.name),
      lengthM: initialData?.lengthM !== undefined ? initialData.lengthM : (node.lengthM || 10),
    });
  }, [initialData, node.customName, node.name, node.lengthM]);

  // Отправляем изменения при каждом обновлении формы
  useEffect(() => {
    onDataChange(formData);
  }, [formData, onDataChange]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <PropertyGroup>
        <PropertyLabel>Название</PropertyLabel>
        <PropertyInput
          type="text"
          value={formData.customName}
          onChange={(e) => handleChange('customName', e.target.value)}
        />
      </PropertyGroup>
      <PropertyGroup>
        <PropertyLabel>Тип</PropertyLabel>
        <PropertyInput
          type="text"
          value={node.cableType || "Ethernet"}
          disabled
        />
      </PropertyGroup>
      <PropertyGroup>
        <PropertyLabel>Длина (м)</PropertyLabel>
        <PropertyInput
          type="number"
          step="1"
          value={formData.lengthM}
          onChange={(e) => handleChange('lengthM', parseFloat(e.target.value))}
        />
      </PropertyGroup>
    </>
  );
};

export default CableEdit;
