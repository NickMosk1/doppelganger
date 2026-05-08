import { useState, useEffect } from 'react';
import { EditorNode } from '../../../../../types';
import { PropertyGroup, PropertyLabel, PropertyInput, Button } from '../../RightPanel.styles';

interface SubSchemaEditProps {
  node: EditorNode;
  onDataChange: (data: any) => void;
  initialData?: any;
}

const SubSchemaEdit: React.FC<SubSchemaEditProps> = ({ node, onDataChange, initialData }) => {
  const [formData, setFormData] = useState({
    customName: initialData?.customName !== undefined ? initialData.customName : (node.customName || node.name),
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
        <PropertyLabel>Название</PropertyLabel>
        <PropertyInput
          type="text"
          value={formData.customName}
          onChange={(e) => handleChange('customName', e.target.value)}
        />
      </PropertyGroup>
      <Button fullWidth onClick={() => {
        if (node.schemaId) {
          window.location.href = `/editor/${node.schemaId}`;
        }
      }}>
        📂 Открыть схему
      </Button>
    </>
  );
};

export default SubSchemaEdit;
