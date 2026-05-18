import React, { useState, useEffect } from 'react';
import { EditorNode } from '../../../../../types';
import { PropertyGroup, PropertyLabel, PropertyInput, StatsGrid, StatCard } from '../../RightPanel.styles';
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
    // Основные
    customName: initialData?.customName !== undefined ? initialData.customName : (node.customName || node.name),
    // Сетевые параметры
    baseLatencyMs: initialData?.baseLatencyMs !== undefined ? initialData.baseLatencyMs : (node.baseLatencyMs || 0),
    maxThroughputMbps: initialData?.maxThroughputMbps !== undefined ? initialData.maxThroughputMbps : (node.maxThroughputMbps || 1000),
    portCount: initialData?.portCount !== undefined ? initialData.portCount : (node.portCount || 4),
    // Промышленные коэффициенты
    tempCoefficient: initialData?.tempCoefficient !== undefined ? initialData.tempCoefficient : (node.tempCoefficient || 1.0),
    emiCoefficient: initialData?.emiCoefficient !== undefined ? initialData.emiCoefficient : (node.emiCoefficient || 1.0),
    vibrationCoefficient: initialData?.vibrationCoefficient !== undefined ? initialData.vibrationCoefficient : (node.vibrationCoefficient || 1.0),
    dustCoefficient: initialData?.dustCoefficient !== undefined ? initialData.dustCoefficient : (node.dustCoefficient || 1.0),
    // Допустимые диапазоны
    maxOperatingTemp: initialData?.maxOperatingTemp !== undefined ? initialData.maxOperatingTemp : (node.maxOperatingTemp || 70),
    minOperatingTemp: initialData?.minOperatingTemp !== undefined ? initialData.minOperatingTemp : (node.minOperatingTemp || 0),
    maxEmiTolerance: initialData?.maxEmiTolerance !== undefined ? initialData.maxEmiTolerance : (node.maxEmiTolerance || 80),
    maxVibrationTolerance: initialData?.maxVibrationTolerance !== undefined ? initialData.maxVibrationTolerance : (node.maxVibrationTolerance || 100),
    // Надежность
    mtbfHours: initialData?.mtbfHours !== undefined ? initialData.mtbfHours : (node.mtbfHours || 50000),
    mttrMinutes: initialData?.mttrMinutes !== undefined ? initialData.mttrMinutes : (node.mttrMinutes || 30),
    warmUpTimeSeconds: initialData?.warmUpTimeSeconds !== undefined ? initialData.warmUpTimeSeconds : (node.warmUpTimeSeconds || 10),
    // Экономика
    replacementCost: initialData?.replacementCost !== undefined ? initialData.replacementCost : (node.replacementCost || 0),
    repairCost: initialData?.repairCost !== undefined ? initialData.repairCost : (node.repairCost || 0),
    // Энергопотребление и защита
    powerConsumptionWatts: initialData?.powerConsumptionWatts !== undefined ? initialData.powerConsumptionWatts : (node.powerConsumptionWatts || 100),
    heatGenerationWatts: initialData?.heatGenerationWatts !== undefined ? initialData.heatGenerationWatts : (node.heatGenerationWatts || 80),
    ipRating: initialData?.ipRating !== undefined ? initialData.ipRating : (node.ipRating || "IP20"),
    operatingHumidityMax: initialData?.operatingHumidityMax !== undefined ? initialData.operatingHumidityMax : (node.operatingHumidityMax || 85),
    needsCooling: initialData?.needsCooling !== undefined ? initialData.needsCooling : (node.needsCooling || false),
    hasRedundantPower: initialData?.hasRedundantPower !== undefined ? initialData.hasRedundantPower : (node.hasRedundantPower || false),
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

  return (
    <>
      {/* Основная информация */}
      <PropertyGroup>
        <PropertyLabel>Название</PropertyLabel>
        <PropertyInput
          type="text"
          value={formData.customName}
          onChange={(e) => handleChange('customName', e.target.value)}
        />
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Количество портов</PropertyLabel>
        <PropertyInput
          type="number"
          step="1"
          min="1"
          max="48"
          value={formData.portCount}
          onChange={(e) => handleNumberChange('portCount', e.target.value, 1, 48)}
        />
      </PropertyGroup>

      {/* Точки симуляции */}
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

      {/* Сетевые параметры */}
      <PropertyGroup>
        <PropertyLabel style={{ fontWeight: 600 }}>🌐 Сетевые параметры</PropertyLabel>
      </PropertyGroup>
      <StatsGrid>
        <StatCard>
          <PropertyLabel>Базовая задержка (мс)</PropertyLabel>
          <PropertyInput
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={formData.baseLatencyMs}
            onChange={(e) => handleNumberChange('baseLatencyMs', e.target.value, 0, 100)}
          />
        </StatCard>
        <StatCard>
          <PropertyLabel>Пропускная способность (Мбит/с)</PropertyLabel>
          <PropertyInput
            type="number"
            step="100"
            min="10"
            max="100000"
            value={formData.maxThroughputMbps}
            onChange={(e) => handleNumberChange('maxThroughputMbps', e.target.value, 10, 100000)}
          />
        </StatCard>
      </StatsGrid>

      {/* Промышленные коэффициенты */}
      <PropertyGroup>
        <PropertyLabel style={{ fontWeight: 600 }}>🏭 Промышленные коэффициенты</PropertyLabel>
      </PropertyGroup>
      <StatsGrid>
        <StatCard>
          <PropertyLabel>Чувствительность к температуре</PropertyLabel>
          <PropertyInput
            type="number"
            step="0.1"
            min="0.5"
            max="3"
            value={formData.tempCoefficient}
            onChange={(e) => handleNumberChange('tempCoefficient', e.target.value, 0.5, 3)}
          />
        </StatCard>
        <StatCard>
          <PropertyLabel>Чувствительность к ЭМИ</PropertyLabel>
          <PropertyInput
            type="number"
            step="0.1"
            min="0.5"
            max="3"
            value={formData.emiCoefficient}
            onChange={(e) => handleNumberChange('emiCoefficient', e.target.value, 0.5, 3)}
          />
        </StatCard>
        <StatCard>
          <PropertyLabel>Чувствительность к вибрации</PropertyLabel>
          <PropertyInput
            type="number"
            step="0.1"
            min="0.5"
            max="3"
            value={formData.vibrationCoefficient}
            onChange={(e) => handleNumberChange('vibrationCoefficient', e.target.value, 0.5, 3)}
          />
        </StatCard>
        <StatCard>
          <PropertyLabel>Чувствительность к пыли</PropertyLabel>
          <PropertyInput
            type="number"
            step="0.1"
            min="0.5"
            max="3"
            value={formData.dustCoefficient}
            onChange={(e) => handleNumberChange('dustCoefficient', e.target.value, 0.5, 3)}
          />
        </StatCard>
      </StatsGrid>

      {/* Допустимые диапазоны */}
      <PropertyGroup>
        <PropertyLabel style={{ fontWeight: 600 }}>⚠️ Допустимые диапазоны</PropertyLabel>
      </PropertyGroup>
      <StatsGrid>
        <StatCard>
          <PropertyLabel>Макс. температура (°C)</PropertyLabel>
          <PropertyInput
            type="number"
            step="5"
            min="-40"
            max="100"
            value={formData.maxOperatingTemp}
            onChange={(e) => handleNumberChange('maxOperatingTemp', e.target.value, -40, 100)}
          />
        </StatCard>
        <StatCard>
          <PropertyLabel>Мин. температура (°C)</PropertyLabel>
          <PropertyInput
            type="number"
            step="5"
            min="-40"
            max="50"
            value={formData.minOperatingTemp}
            onChange={(e) => handleNumberChange('minOperatingTemp', e.target.value, -40, 50)}
          />
        </StatCard>
        <StatCard>
          <PropertyLabel>Макс. ЭМИ (dBm)</PropertyLabel>
          <PropertyInput
            type="number"
            step="5"
            min="20"
            max="120"
            value={formData.maxEmiTolerance}
            onChange={(e) => handleNumberChange('maxEmiTolerance', e.target.value, 20, 120)}
          />
        </StatCard>
        <StatCard>
          <PropertyLabel>Макс. вибрация (Hz)</PropertyLabel>
          <PropertyInput
            type="number"
            step="10"
            min="20"
            max="200"
            value={formData.maxVibrationTolerance}
            onChange={(e) => handleNumberChange('maxVibrationTolerance', e.target.value, 20, 200)}
          />
        </StatCard>
      </StatsGrid>

      {/* Надежность */}
      <PropertyGroup>
        <PropertyLabel style={{ fontWeight: 600 }}>🔧 Надежность</PropertyLabel>
      </PropertyGroup>
      <StatsGrid>
        <StatCard>
          <PropertyLabel>MTBF (часы)</PropertyLabel>
          <PropertyInput
            type="number"
            step="10000"
            min="1000"
            max="500000"
            value={formData.mtbfHours}
            onChange={(e) => handleNumberChange('mtbfHours', e.target.value, 1000, 500000)}
          />
        </StatCard>
        <StatCard>
          <PropertyLabel>MTTR (минуты)</PropertyLabel>
          <PropertyInput
            type="number"
            step="5"
            min="5"
            max="240"
            value={formData.mttrMinutes}
            onChange={(e) => handleNumberChange('mttrMinutes', e.target.value, 5, 240)}
          />
        </StatCard>
        <StatCard>
          <PropertyLabel>Время прогрева (сек)</PropertyLabel>
          <PropertyInput
            type="number"
            step="1"
            min="0"
            max="120"
            value={formData.warmUpTimeSeconds}
            onChange={(e) => handleNumberChange('warmUpTimeSeconds', e.target.value, 0, 120)}
          />
        </StatCard>
      </StatsGrid>

      {/* Экономические показатели */}
      <PropertyGroup>
        <PropertyLabel style={{ fontWeight: 600 }}>💰 Экономические показатели</PropertyLabel>
      </PropertyGroup>
      <StatsGrid>
        <StatCard>
          <PropertyLabel>Стоимость замены (₽)</PropertyLabel>
          <PropertyInput
            type="number"
            step="1000"
            min="0"
            max="10000000"
            value={formData.replacementCost}
            onChange={(e) => handleNumberChange('replacementCost', e.target.value, 0, 10000000)}
          />
        </StatCard>
        <StatCard>
          <PropertyLabel>Стоимость ремонта (₽)</PropertyLabel>
          <PropertyInput
            type="number"
            step="1000"
            min="0"
            max="5000000"
            value={formData.repairCost}
            onChange={(e) => handleNumberChange('repairCost', e.target.value, 0, 5000000)}
          />
        </StatCard>
      </StatsGrid>

      {/* Энергопотребление и защита */}
      <PropertyGroup>
        <PropertyLabel style={{ fontWeight: 600 }}>⚡ Энергопотребление и защита</PropertyLabel>
      </PropertyGroup>
      <StatsGrid>
        <StatCard>
          <PropertyLabel>Энергопотребление (Вт)</PropertyLabel>
          <PropertyInput
            type="number"
            step="10"
            min="0"
            max="2000"
            value={formData.powerConsumptionWatts}
            onChange={(e) => handleNumberChange('powerConsumptionWatts', e.target.value, 0, 2000)}
          />
        </StatCard>
        <StatCard>
          <PropertyLabel>Тепловыделение (Вт)</PropertyLabel>
          <PropertyInput
            type="number"
            step="10"
            min="0"
            max="2000"
            value={formData.heatGenerationWatts}
            onChange={(e) => handleNumberChange('heatGenerationWatts', e.target.value, 0, 2000)}
          />
        </StatCard>
      </StatsGrid>

      <StatsGrid>
        <StatCard>
          <PropertyLabel>IP защита</PropertyLabel>
          <PropertyInput
            type="select"
            value={formData.ipRating}
            onChange={(e) => handleChange('ipRating', e.target.value)}
            as="select"
          >
            <option value="IP20">IP20 (Обычная)</option>
            <option value="IP30">IP30 (Базовая защита)</option>
            <option value="IP40">IP40 (Защита от частиц)</option>
            <option value="IP54">IP54 (Пылезащита)</option>
            <option value="IP65">IP65 (Пыле-влагозащита)</option>
            <option value="IP67">IP67 (Полная защита)</option>
          </PropertyInput>
        </StatCard>
        <StatCard>
          <PropertyLabel>Макс. влажность (%)</PropertyLabel>
          <PropertyInput
            type="number"
            step="5"
            min="0"
            max="100"
            value={formData.operatingHumidityMax}
            onChange={(e) => handleNumberChange('operatingHumidityMax', e.target.value, 0, 100)}
          />
        </StatCard>
      </StatsGrid>

      <StatsGrid>
        <StatCard>
          <PropertyLabel>Требуется охлаждение</PropertyLabel>
          <PropertyInput
            type="select"
            value={formData.needsCooling ? "true" : "false"}
            onChange={(e) => handleChange('needsCooling', e.target.value === "true")}
            as="select"
          >
            <option value="false">❌ Нет</option>
            <option value="true">✅ Да</option>
          </PropertyInput>
        </StatCard>
        <StatCard>
          <PropertyLabel>Резервное питание</PropertyLabel>
          <PropertyInput
            type="select"
            value={formData.hasRedundantPower ? "true" : "false"}
            onChange={(e) => handleChange('hasRedundantPower', e.target.value === "true")}
            as="select"
          >
            <option value="false">❌ Нет</option>
            <option value="true">✅ Да</option>
          </PropertyInput>
        </StatCard>
      </StatsGrid>
    </>
  );
};

export default DeviceEdit;
