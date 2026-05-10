// src/shared/components/RightPanel/components/EditMode/DeviceEdit.tsx

import React, { useState, useEffect } from 'react';
import { EditorNode } from '../../../../../types';
import { PropertyGroup, PropertyLabel, PropertyInput } from '../../RightPanel.styles';
import { debounce } from 'lodash';

interface DeviceEditProps {
  node: EditorNode;
  onDataChange: (data: any) => void;
  initialData?: any;
}

const DeviceEdit: React.FC<DeviceEditProps> = ({ node, onDataChange, initialData }) => {
  const [formData, setFormData] = useState({
    customName: initialData?.customName !== undefined ? initialData.customName : (node.customName || node.name),
    baseLatencyMs: initialData?.baseLatencyMs !== undefined ? initialData.baseLatencyMs : (node.baseLatencyMs || 0),
    maxThroughputMbps: initialData?.maxThroughputMbps !== undefined ? initialData.maxThroughputMbps : (node.maxThroughputMbps || 0),
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
        <PropertyLabel>Базовая задержка (мс)</PropertyLabel>
        <PropertyInput
          type="number"
          step="0.1"
          value={formData.baseLatencyMs}
          onChange={(e) => handleChange('baseLatencyMs', parseFloat(e.target.value))}
        />
      </PropertyGroup>
      <PropertyGroup>
        <PropertyLabel>Макс. пропускная способность (Мбит/с)</PropertyLabel>
        <PropertyInput
          type="number"
          value={formData.maxThroughputMbps}
          onChange={(e) => handleChange('maxThroughputMbps', parseInt(e.target.value))}
        />
      </PropertyGroup>
    </>
  );
};

export default DeviceEdit;
