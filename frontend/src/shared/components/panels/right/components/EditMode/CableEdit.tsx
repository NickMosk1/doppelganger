import React, { useState, useEffect } from 'react';
import { EditorNode } from '../../../../../types';
import { PropertyGroup, PropertyLabel, PropertyInput, StatsGrid, StatCard } from '../../RightPanel.styles';
import { debounce } from 'lodash';

interface CableEditProps {
  node: EditorNode;
  onDataChange: (data: any) => void;
  initialData?: any;
}

const CableEdit: React.FC<CableEditProps> = ({ node, onDataChange, initialData }) => {
  const [formData, setFormData] = useState({
    customName: initialData?.customName !== undefined ? initialData.customName : (node.customName || node.name),
    lengthM: initialData?.lengthM !== undefined ? initialData.lengthM : (node.lengthM || node.cableLengthM || 10),
    bandwidthMbps: initialData?.bandwidthMbps !== undefined ? initialData.bandwidthMbps : (node.bandwidthMbps || 1000),
    // Физические характеристики
    propagationSpeed: initialData?.propagationSpeed !== undefined ? initialData.propagationSpeed : (node.propagationSpeed || 0.65),
    bendingRadiusMm: initialData?.bendingRadiusMm !== undefined ? initialData.bendingRadiusMm : (node.bendingRadiusMm || 50),
    tensileStrengthN: initialData?.tensileStrengthN !== undefined ? initialData.tensileStrengthN : (node.tensileStrengthN || 100),
    operatingTensionMaxN: initialData?.operatingTensionMaxN !== undefined ? initialData.operatingTensionMaxN : (node.operatingTensionMaxN || 50),
    // Электрические параметры
    impedanceOhms: initialData?.impedanceOhms !== undefined ? initialData.impedanceOhms : (node.impedanceOhms || 100),
    coreDiameterUm: initialData?.coreDiameterUm !== undefined ? initialData.coreDiameterUm : (node.coreDiameterUm || 0.5),
    capacitancePerKmNf: initialData?.capacitancePerKmNf !== undefined ? initialData.capacitancePerKmNf : (node.capacitancePerKmNf || 50),
    resistancePerKmOhms: initialData?.resistancePerKmOhms !== undefined ? initialData.resistancePerKmOhms : (node.resistancePerKmOhms || 85),
    // Частотные характеристики
    maxFrequencyMhz: initialData?.maxFrequencyMhz !== undefined ? initialData.maxFrequencyMhz : (node.maxFrequencyMhz || 250),
    signalToNoiseRatioDb: initialData?.signalToNoiseRatioDb !== undefined ? initialData.signalToNoiseRatioDb : (node.signalToNoiseRatioDb || 30),
    // Промышленная устойчивость
    immunityRating: initialData?.immunityRating !== undefined ? initialData.immunityRating : (node.immunityRating || 5),
    temperatureRating: initialData?.temperatureRating !== undefined ? initialData.temperatureRating : (node.temperatureRating || 60),
    shieldingType: initialData?.shieldingType !== undefined ? initialData.shieldingType : (node.shieldingType || 0),
    oilResistance: initialData?.oilResistance !== undefined ? initialData.oilResistance : (node.oilResistance || false),
    uvResistance: initialData?.uvResistance !== undefined ? initialData.uvResistance : (node.uvResistance || false),
    chemicalResistance: initialData?.chemicalResistance !== undefined ? initialData.chemicalResistance : (node.chemicalResistance || ""),
    // Срок службы
    expectedLifetimeYears: initialData?.expectedLifetimeYears !== undefined ? initialData.expectedLifetimeYears : (node.expectedLifetimeYears || 10),
    degradationRatePerYear: initialData?.degradationRatePerYear !== undefined ? initialData.degradationRatePerYear : (node.degradationRatePerYear || 2.0),
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

  const handleNumberChange = (field: string, value: string, min?: number, max?: number) => {
    let numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      if (min !== undefined) numValue = Math.max(min, numValue);
      if (max !== undefined) numValue = Math.min(max, numValue);
      handleChange(field, numValue);
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
      {/* Основные параметры */}
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

      <StatsGrid>
        <StatCard>
          <PropertyLabel>Длина (м)</PropertyLabel>
          <PropertyInput
            type="number"
            step="1"
            min="0"
            max="10000"
            value={formData.lengthM}
            onChange={(e) => handleNumberChange('lengthM', e.target.value, 0, 10000)}
          />
        </StatCard>
        <StatCard>
          <PropertyLabel>Пропускная способность (Мбит/с)</PropertyLabel>
          <PropertyInput
            type="number"
            step="100"
            min="10"
            max="100000"
            value={formData.bandwidthMbps}
            onChange={(e) => handleNumberChange('bandwidthMbps', e.target.value, 10, 100000)}
          />
        </StatCard>
      </StatsGrid>

      {/* Физические характеристики */}
      <PropertyGroup>
        <PropertyLabel style={{ fontWeight: 600 }}>📐 Физические характеристики</PropertyLabel>
      </PropertyGroup>
      <StatsGrid>
        <StatCard>
          <PropertyLabel>Скорость распространения</PropertyLabel>
          <PropertyInput
            type="number"
            step="0.01"
            min="0.1"
            max="1"
            value={formData.propagationSpeed}
            onChange={(e) => handleNumberChange('propagationSpeed', e.target.value, 0.1, 1)}
          />
        </StatCard>
        <StatCard>
          <PropertyLabel>Мин. радиус изгиба (мм)</PropertyLabel>
          <PropertyInput
            type="number"
            step="5"
            min="10"
            max="200"
            value={formData.bendingRadiusMm}
            onChange={(e) => handleNumberChange('bendingRadiusMm', e.target.value, 10, 200)}
          />
        </StatCard>
        <StatCard>
          <PropertyLabel>Прочность на разрыв (Н)</PropertyLabel>
          <PropertyInput
            type="number"
            step="10"
            min="20"
            max="500"
            value={formData.tensileStrengthN}
            onChange={(e) => handleNumberChange('tensileStrengthN', e.target.value, 20, 500)}
          />
        </StatCard>
        <StatCard>
          <PropertyLabel>Макс. натяжение (Н)</PropertyLabel>
          <PropertyInput
            type="number"
            step="10"
            min="10"
            max="300"
            value={formData.operatingTensionMaxN}
            onChange={(e) => handleNumberChange('operatingTensionMaxN', e.target.value, 10, 300)}
          />
        </StatCard>
      </StatsGrid>

      {/* Электрические параметры */}
      <PropertyGroup>
        <PropertyLabel style={{ fontWeight: 600 }}>⚡ Электрические параметры</PropertyLabel>
      </PropertyGroup>
      <StatsGrid>
        <StatCard>
          <PropertyLabel>Импеданс (Ом)</PropertyLabel>
          <PropertyInput
            type="number"
            step="5"
            min="50"
            max="150"
            value={formData.impedanceOhms}
            onChange={(e) => handleNumberChange('impedanceOhms', e.target.value, 50, 150)}
          />
        </StatCard>
        <StatCard>
          <PropertyLabel>Диаметр жилы (мкм)</PropertyLabel>
          <PropertyInput
            type="number"
            step="0.1"
            min="0.1"
            max="10"
            value={formData.coreDiameterUm}
            onChange={(e) => handleNumberChange('coreDiameterUm', e.target.value, 0.1, 10)}
          />
        </StatCard>
        <StatCard>
          <PropertyLabel>Ёмкость (нФ/км)</PropertyLabel>
          <PropertyInput
            type="number"
            step="5"
            min="30"
            max="100"
            value={formData.capacitancePerKmNf}
            onChange={(e) => handleNumberChange('capacitancePerKmNf', e.target.value, 30, 100)}
          />
        </StatCard>
        <StatCard>
          <PropertyLabel>Сопротивление (Ом/км)</PropertyLabel>
          <PropertyInput
            type="number"
            step="5"
            min="20"
            max="200"
            value={formData.resistancePerKmOhms}
            onChange={(e) => handleNumberChange('resistancePerKmOhms', e.target.value, 20, 200)}
          />
        </StatCard>
      </StatsGrid>

      {/* Частотные характеристики */}
      <PropertyGroup>
        <PropertyLabel style={{ fontWeight: 600 }}>📡 Частотные характеристики</PropertyLabel>
      </PropertyGroup>
      <StatsGrid>
        <StatCard>
          <PropertyLabel>Макс. частота (МГц)</PropertyLabel>
          <PropertyInput
            type="number"
            step="10"
            min="10"
            max="1000"
            value={formData.maxFrequencyMhz}
            onChange={(e) => handleNumberChange('maxFrequencyMhz', e.target.value, 10, 1000)}
          />
        </StatCard>
        <StatCard>
          <PropertyLabel>SNR (дБ)</PropertyLabel>
          <PropertyInput
            type="number"
            step="1"
            min="10"
            max="60"
            value={formData.signalToNoiseRatioDb}
            onChange={(e) => handleNumberChange('signalToNoiseRatioDb', e.target.value, 10, 60)}
          />
        </StatCard>
      </StatsGrid>

      {/* Промышленная устойчивость */}
      <PropertyGroup>
        <PropertyLabel style={{ fontWeight: 600 }}>🏭 Промышленная устойчивость</PropertyLabel>
      </PropertyGroup>
      <StatsGrid>
        <StatCard>
          <PropertyLabel>Помехоустойчивость (1-10)</PropertyLabel>
          <PropertyInput
            type="number"
            step="1"
            min="1"
            max="10"
            value={formData.immunityRating}
            onChange={(e) => handleNumberChange('immunityRating', e.target.value, 1, 10)}
          />
        </StatCard>
        <StatCard>
          <PropertyLabel>Раб. температура (°C)</PropertyLabel>
          <PropertyInput
            type="number"
            step="5"
            min="-40"
            max="125"
            value={formData.temperatureRating}
            onChange={(e) => handleNumberChange('temperatureRating', e.target.value, -40, 125)}
          />
        </StatCard>
        <StatCard>
          <PropertyLabel>Экранирование</PropertyLabel>
          <PropertyInput
            type="select"
            value={formData.shieldingType}
            onChange={(e) => handleChange('shieldingType', parseInt(e.target.value))}
            as="select"
          >
            <option value={0}>Без экрана</option>
            <option value={1}>Фольга</option>
            <option value={2}>Оплетка</option>
            <option value={3}>Двойной экран</option>
          </PropertyInput>
        </StatCard>
      </StatsGrid>

      <StatsGrid>
        <StatCard>
          <PropertyLabel>Маслостойкость</PropertyLabel>
          <PropertyInput
            type="select"
            value={formData.oilResistance ? "true" : "false"}
            onChange={(e) => handleChange('oilResistance', e.target.value === "true")}
            as="select"
          >
            <option value="false">❌ Нет</option>
            <option value="true">✅ Да</option>
          </PropertyInput>
        </StatCard>
        <StatCard>
          <PropertyLabel>УФ-устойчивость</PropertyLabel>
          <PropertyInput
            type="select"
            value={formData.uvResistance ? "true" : "false"}
            onChange={(e) => handleChange('uvResistance', e.target.value === "true")}
            as="select"
          >
            <option value="false">❌ Нет</option>
            <option value="true">✅ Да</option>
          </PropertyInput>
        </StatCard>
      </StatsGrid>

      <PropertyGroup>
        <PropertyLabel>Химическая стойкость</PropertyLabel>
        <PropertyInput
          type="text"
          value={formData.chemicalResistance}
          onChange={(e) => handleChange('chemicalResistance', e.target.value)}
          placeholder="например: Кислоты, Щёлочи, Масла"
        />
      </PropertyGroup>

      {/* Срок службы */}
      <PropertyGroup>
        <PropertyLabel style={{ fontWeight: 600 }}>⏳ Срок службы</PropertyLabel>
      </PropertyGroup>
      <StatsGrid>
        <StatCard>
          <PropertyLabel>Ожидаемый срок (лет)</PropertyLabel>
          <PropertyInput
            type="number"
            step="1"
            min="1"
            max="50"
            value={formData.expectedLifetimeYears}
            onChange={(e) => handleNumberChange('expectedLifetimeYears', e.target.value, 1, 50)}
          />
        </StatCard>
        <StatCard>
          <PropertyLabel>Деградация (%/год)</PropertyLabel>
          <PropertyInput
            type="number"
            step="0.5"
            min="0"
            max="20"
            value={formData.degradationRatePerYear}
            onChange={(e) => handleNumberChange('degradationRatePerYear', e.target.value, 0, 20)}
          />
        </StatCard>
      </StatsGrid>
    </>
  );
};

export default CableEdit;
