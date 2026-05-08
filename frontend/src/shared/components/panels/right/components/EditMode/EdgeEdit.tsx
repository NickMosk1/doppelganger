import { useState, useEffect } from 'react';
import { EditorEdge } from '../../../../../types';
import { PropertyGroup, PropertyLabel, PropertyInput, StatusBadge } from '../../RightPanel.styles';

interface EdgeEditProps {
  edge: EditorEdge;
  onDataChange: (data: any) => void;
  initialData?: any;
}

const EdgeEdit: React.FC<EdgeEditProps> = ({ edge, onDataChange, initialData }) => {
  const [formData, setFormData] = useState({
    lengthM: initialData?.lengthM !== undefined ? initialData.lengthM : (edge.lengthM || 10),
    isActive: initialData?.isActive !== undefined ? initialData.isActive : (edge.isActive !== false),
  });

  useEffect(() => {
    onDataChange(formData);
  }, [formData]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <PropertyGroup>
        <PropertyLabel>Длина кабеля (м)</PropertyLabel>
        <PropertyInput
          type="number"
          step="1"
          value={formData.lengthM}
          onChange={(e) => handleChange('lengthM', parseFloat(e.target.value))}
        />
      </PropertyGroup>
      <PropertyGroup>
        <PropertyLabel>Пропускная способность</PropertyLabel>
        <PropertyInput
          type="number"
          value={edge.bandwidthMbps || 1000}
          disabled
        />
      </PropertyGroup>
      <PropertyGroup>
        <PropertyLabel>Статус</PropertyLabel>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="radio"
              checked={formData.isActive}
              onChange={() => handleChange('isActive', true)}
            />
            Активен
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="radio"
              checked={!formData.isActive}
              onChange={() => handleChange('isActive', false)}
            />
            Неактивен
          </label>
        </div>
        <StatusBadge status={formData.isActive ? "success" : "error"} style={{ marginTop: '8px' }}>
          {formData.isActive ? "🟢 Активен" : "🔴 Неактивен"}
        </StatusBadge>
      </PropertyGroup>
    </>
  );
};

export default EdgeEdit;
