import React, { useEffect } from 'react';
import { useState } from 'react';
import styled from 'styled-components';
import { Button, Input } from '../../../components';
import Modal from '../Modal';

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
`;

const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #666;
  margin-bottom: 6px;
`;

interface AddFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (factor: any) => void;
  defaultType?: string;
}

const factorTypeOptions = [
  { value: "TEMPERATURE", label: "🌡️ Температура", unit: "°C", defaultRadius: 15 },
  { value: "EMI", label: "⚡ Электромагнитные помехи", unit: "dBm", defaultRadius: 20 },
  { value: "VIBRATION", label: "📳 Вибрация", unit: "Hz", defaultRadius: 10 },
  { value: "DUST", label: "🏭 Запыленность", unit: "mg/m³", defaultRadius: 12 },
];

const AddFactorModal: React.FC<AddFactorModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  defaultType = "TEMPERATURE"
}) => {
  const selectedTypeInfo = factorTypeOptions.find(opt => opt.value === defaultType) || factorTypeOptions[0];

  const [formData, setFormData] = useState({
    name: '',
    factorType: defaultType,
    factorValue: 25,
    factorUnit: selectedTypeInfo.unit,
    factorRadius: selectedTypeInfo.defaultRadius,
    description: '',
  });

  useEffect(() => {
    const typeInfo = factorTypeOptions.find(opt => opt.value === formData.factorType) || factorTypeOptions[0];
    setFormData(prev => ({
      ...prev,
      factorUnit: typeInfo.unit,
      factorRadius: typeInfo.defaultRadius,
    }));
  }, [formData.factorType]);

  useEffect(() => {
    if (isOpen) {
      const typeInfo = factorTypeOptions.find(opt => opt.value === defaultType) || factorTypeOptions[0];
      setFormData({
        name: '',
        factorType: defaultType,
        factorValue: defaultType === "TEMPERATURE" ? 25 : defaultType === "EMI" ? 20 : defaultType === "VIBRATION" ? 10 : 15,
        factorUnit: typeInfo.unit,
        factorRadius: typeInfo.defaultRadius,
        description: '',
      });
    }
  }, [defaultType, isOpen]);

  const handleSubmit = () => {
    const getIcon = () => {
      switch (formData.factorType) {
        case "TEMPERATURE": return "🌡️";
        case "EMI": return "⚡";
        case "VIBRATION": return "📳";
        case "DUST": return "🏭";
        default: return "📊";
      }
    };

    onAdd({
      ...formData,
      id: `factor-${Date.now()}`,
      icon: getIcon(),
      isCustom: true,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Добавить промышленный фактор"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSubmit}>Добавить</Button>
        </>
      }
    >
      <FormGroup>
        <Input
          label="Название"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Например: Печь №3, Электродвигатель М1"
          fullWidth
        />
      </FormGroup>

      <FormRow>
        <FormGroup>
          <Label>Тип фактора</Label>
          <Select
            value={formData.factorType}
            onChange={(e) => setFormData({ ...formData, factorType: e.target.value })}
          >
            {factorTypeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Input
            label={`Интенсивность (${selectedTypeInfo.unit})`}
            type="number"
            step="1"
            value={formData.factorValue}
            onChange={(e) => setFormData({ ...formData, factorValue: Number(e.target.value) })}
            fullWidth
          />
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup>
          <Input
            label="Радиус влияния (м)"
            type="number"
            step="1"
            value={formData.factorRadius}
            onChange={(e) => setFormData({ ...formData, factorRadius: Number(e.target.value) })}
            fullWidth
          />
        </FormGroup>
      </FormRow>

      <FormGroup>
        <Input
          label="Описание"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Описание источника фактора..."
          fullWidth
        />
      </FormGroup>
    </Modal>
  );
};

export default AddFactorModal;
