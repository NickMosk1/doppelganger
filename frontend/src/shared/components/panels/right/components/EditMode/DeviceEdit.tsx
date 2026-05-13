import React, { useState, useEffect } from 'react';
import { EditorNode } from '../../../../../types';
import { PropertyGroup, PropertyLabel, PropertyInput } from '../../RightPanel.styles';
import { debounce } from 'lodash';
import { useStores } from '../../../../../../hooks';
import { Button } from '../../../../Button';

interface DeviceEditProps {
  node: EditorNode;
  onDataChange: (data: any) => void;
  initialData?: any;
}

const DeviceEdit: React.FC<DeviceEditProps> = ({ node, onDataChange, initialData }) => {
  const { editorStore } = useStores();
  const isStartPoint = editorStore.startPointId === node.id;
  const isEndPoint = editorStore.endPointId === node.id;

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
        <PropertyLabel>Точки симуляции</PropertyLabel>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
          <Button 
            variant={isStartPoint ? "primary" : "outline"}
            size="small"
            onClick={() => editorStore.setStartPoint(node.id)}
          >
            {isStartPoint ? "✓ Старт" : "📍 Назначить старт"}
          </Button>
          <Button 
            variant={isEndPoint ? "primary" : "outline"}
            size="small"
            onClick={() => editorStore.setEndPoint(node.id)}
          >
            {isEndPoint ? "✓ Финиш" : "🎯 Назначить финиш"}
          </Button>
        </div>
        {(isStartPoint || isEndPoint) && (
          <Button 
            variant="text" 
            size="small" 
            onClick={() => editorStore.clearPoints()}
            style={{ marginTop: '8px', color: '#ef4444' }}
          >
            Сбросить все точки
          </Button>
        )}
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
