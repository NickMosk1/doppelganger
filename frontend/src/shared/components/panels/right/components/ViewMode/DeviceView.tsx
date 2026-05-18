import { observer } from 'mobx-react-lite';
import { useStores } from '../../../../../../hooks';
import { EditorNode, ConnectionType } from '../../../../../types';
import { Button } from '../../../../Button';
import { 
  PropertyGroup, PropertyLabel, PropertyValue, StatusBadge, 
  Section, SectionTitle, ConnectionCard, ConnectionHeader, 
  ConnectionDevice, ConnectionPort, ConnectionDetails, 
  DetailItem, DetailLabel, DetailValue, StatsGrid, StatCard,
  StatLabel,
  StatValue
} from '../../RightPanel.styles';

interface DeviceViewProps {
  node: EditorNode;
}

const getStatusColor = (status?: string) => {
  switch (status) {
    case "OPERATIONAL": return "success";
    case "DEGRADED": return "warning";
    case "FAILED": return "error";
    default: return "default";
  }
};

const getStatusText = (status?: string) => {
  switch (status) {
    case "OPERATIONAL": return "🟢 Работает";
    case "DEGRADED": return "🟡 Деградация";
    case "FAILED": return "🔴 Отказ";
    default: return "⚪ Неизвестно";
  }
};

const getDeviceTypeLabel = (type?: string) => {
  switch (type) {
    case "ROUTER": return "Маршрутизатор";
    case "SWITCH": return "Коммутатор";
    case "PLC": return "ПЛК";
    case "SERVER": return "Сервер";
    case "WORKSTATION": return "Рабочая станция";
    case "FIREWALL": return "Фаервол";
    default: return "Устройство";
  }
};

const DeviceView: React.FC<DeviceViewProps> = observer(({ node }) => {
  const { editorStore } = useStores();
  
  const currentNode = editorStore.getNodeById(node.id);
  
  if (!currentNode) {
    return <PropertyValue>Нода не найдена</PropertyValue>;
  }
  
  const deviceEdges = editorStore.getNodeConnections(currentNode.id);
  const cableDeviceEdges = deviceEdges.filter(edge => edge.connectionType === ConnectionType.CABLE_DEVICE);
  const factorEdges = deviceEdges.filter(edge => edge.connectionType === ConnectionType.FACTOR_ELEMENT);
  
  const deviceData = currentNode.device;
  const deviceName = currentNode.customName || deviceData?.name || currentNode.name;
  const deviceType = deviceData?.type || currentNode.deviceType || "DEVICE";
  const manufacturer = deviceData?.manufacturer || currentNode.manufacturer;
  const baseLatencyMs = currentNode.baseLatencyMs ?? deviceData?.baseLatencyMs ?? 0;
  const maxThroughputMbps = currentNode.maxThroughputMbps ?? deviceData?.maxThroughputMbps ?? 0;
  const portCount = currentNode.portCount ?? deviceData?.portCount ?? "—";
  const status = currentNode.status;

  const isStartPoint = editorStore.startPointId === currentNode.id;
  const isEndPoint = editorStore.endPointId === currentNode.id;

  // Промышленные коэффициенты
  const tempCoefficient = currentNode.tempCoefficient ?? deviceData?.tempCoefficient ?? 1.0;
  const emiCoefficient = currentNode.emiCoefficient ?? deviceData?.emiCoefficient ?? 1.0;
  const vibrationCoefficient = currentNode.vibrationCoefficient ?? deviceData?.vibrationCoefficient ?? 1.0;
  const dustCoefficient = currentNode.dustCoefficient ?? deviceData?.dustCoefficient ?? 1.0;

  // Допустимые диапазоны
  const maxOperatingTemp = currentNode.maxOperatingTemp ?? deviceData?.maxOperatingTemp;
  const minOperatingTemp = currentNode.minOperatingTemp ?? deviceData?.minOperatingTemp;
  const maxEmiTolerance = currentNode.maxEmiTolerance ?? deviceData?.maxEmiTolerance;
  const maxVibrationTolerance = currentNode.maxVibrationTolerance ?? deviceData?.maxVibrationTolerance;

  // Надежность
  const mtbfHours = currentNode.mtbfHours ?? deviceData?.mtbfHours;
  const mttrMinutes = currentNode.mttrMinutes ?? deviceData?.mttrMinutes;
  const warmUpTimeSeconds = currentNode.warmUpTimeSeconds ?? deviceData?.warmUpTimeSeconds;

  // Экономика
  const replacementCost = currentNode.replacementCost ?? deviceData?.replacementCost;
  const repairCost = currentNode.repairCost ?? deviceData?.repairCost;

  // Энергопотребление
  const powerConsumptionWatts = currentNode.powerConsumptionWatts ?? deviceData?.powerConsumptionWatts;
  const heatGenerationWatts = currentNode.heatGenerationWatts ?? deviceData?.heatGenerationWatts;
  const ipRating = currentNode.ipRating ?? deviceData?.ipRating;
  const operatingHumidityMax = currentNode.operatingHumidityMax ?? deviceData?.operatingHumidityMax;
  const needsCooling = currentNode.needsCooling ?? deviceData?.needsCooling;
  const hasRedundantPower = currentNode.hasRedundantPower ?? deviceData?.hasRedundantPower;

  const formatCurrency = (value?: number): string => {
    if (value === undefined || value === null) return "—";
    return new Intl.NumberFormat('ru-RU').format(value) + " ₽";
  };

  const formatNumber = (value?: number, suffix: string = ""): string => {
    if (value === undefined || value === null) return "—";
    return value.toLocaleString() + suffix;
  };

  return (
    <>
      {/* Основная информация */}
      <PropertyGroup>
        <PropertyLabel>Название</PropertyLabel>
        <PropertyValue>{deviceName}</PropertyValue>
      </PropertyGroup>
      
      <PropertyGroup>
        <PropertyLabel>Производитель</PropertyLabel>
        <PropertyValue>{manufacturer || "—"}</PropertyValue>
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Тип</PropertyLabel>
        <PropertyValue>{getDeviceTypeLabel(deviceType)}</PropertyValue>
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Количество портов</PropertyLabel>
        <PropertyValue>{portCount}</PropertyValue>
      </PropertyGroup>

      {/* Точки симуляции */}
      <PropertyGroup>
        <PropertyLabel>Точки симуляции</PropertyLabel>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
          <Button 
            variant={isStartPoint ? "primary" : "outline"}
            size="small"
            onClick={() => editorStore.setStartPoint(currentNode.id)}
          >
            {isStartPoint ? "✓ Старт" : "📍 Назначить старт"}
          </Button>
          <Button 
            variant={isEndPoint ? "primary" : "outline"}
            size="small"
            onClick={() => editorStore.setEndPoint(currentNode.id)}
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

      {/* Статус и сетевые параметры */}
      <PropertyGroup>
        <PropertyLabel>Статус</PropertyLabel>
        <StatusBadge status={getStatusColor(status)}>
          {getStatusText(status)}
        </StatusBadge>
      </PropertyGroup>

      <StatsGrid>
        <StatCard>
          <StatValue>{baseLatencyMs} мс</StatValue>
          <StatLabel>Базовая задержка</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{maxThroughputMbps} Мбит/с</StatValue>
          <StatLabel>Макс. пропускная способность</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Промышленные коэффициенты */}
      <Section>
        <SectionTitle>🏭 Промышленные коэффициенты</SectionTitle>
        <StatsGrid>
          <StatCard>
            <StatValue>{tempCoefficient.toFixed(1)}</StatValue>
            <StatLabel>Чувствительность к температуре</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{emiCoefficient.toFixed(1)}</StatValue>
            <StatLabel>Чувствительность к ЭМИ</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{vibrationCoefficient.toFixed(1)}</StatValue>
            <StatLabel>Чувствительность к вибрации</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{dustCoefficient.toFixed(1)}</StatValue>
            <StatLabel>Чувствительность к пыли</StatLabel>
          </StatCard>
        </StatsGrid>
      </Section>

      {/* Допустимые диапазоны */}
      <Section>
        <SectionTitle>⚠️ Допустимые диапазоны</SectionTitle>
        <StatsGrid>
          <StatCard>
            <StatValue>{maxOperatingTemp ? `${maxOperatingTemp}°C` : "—"}</StatValue>
            <StatLabel>Макс. температура</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{minOperatingTemp ? `${minOperatingTemp}°C` : "—"}</StatValue>
            <StatLabel>Мин. температура</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{maxEmiTolerance ? `${maxEmiTolerance} dBm` : "—"}</StatValue>
            <StatLabel>Макс. ЭМИ</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{maxVibrationTolerance ? `${maxVibrationTolerance} Hz` : "—"}</StatValue>
            <StatLabel>Макс. вибрация</StatLabel>
          </StatCard>
        </StatsGrid>
      </Section>

      {/* Надежность */}
      <Section>
        <SectionTitle>🔧 Надежность</SectionTitle>
        <StatsGrid>
          <StatCard>
            <StatValue>{formatNumber(mtbfHours, ' ч')}</StatValue>
            <StatLabel>MTBF (часы)</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{formatNumber(mttrMinutes, ' мин')}</StatValue>
            <StatLabel>MTTR (минуты)</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{formatNumber(warmUpTimeSeconds, ' с')}</StatValue>
            <StatLabel>Время прогрева</StatLabel>
          </StatCard>
        </StatsGrid>
      </Section>

      {/* Экономические показатели */}
      <Section>
        <SectionTitle>💰 Экономические показатели</SectionTitle>
        <StatsGrid>
          <StatCard>
            <StatValue>{formatCurrency(replacementCost)}</StatValue>
            <StatLabel>Стоимость замены</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{formatCurrency(repairCost)}</StatValue>
            <StatLabel>Стоимость ремонта</StatLabel>
          </StatCard>
        </StatsGrid>
      </Section>

      {/* Энергопотребление и защита */}
      <Section>
        <SectionTitle>⚡ Энергопотребление и защита</SectionTitle>
        <StatsGrid>
          <StatCard>
            <StatValue>{formatNumber(powerConsumptionWatts, ' Вт')}</StatValue>
            <StatLabel>Энергопотребление</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{formatNumber(heatGenerationWatts, ' Вт')}</StatValue>
            <StatLabel>Тепловыделение</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{ipRating || "—"}</StatValue>
            <StatLabel>IP защита</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{operatingHumidityMax ? `${operatingHumidityMax}%` : "—"}</StatValue>
            <StatLabel>Макс. влажность</StatLabel>
          </StatCard>
        </StatsGrid>

        <DetailItem>
          <DetailLabel>Требуется охлаждение:</DetailLabel>
          <DetailValue>{needsCooling ? "✅ Да" : "❌ Нет"}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Резервное питание:</DetailLabel>
          <DetailValue>{hasRedundantPower ? "✅ Да" : "❌ Нет"}</DetailValue>
        </DetailItem>
      </Section>

      {/* Подключения к кабелям */}
      {cableDeviceEdges.length > 0 && (
        <Section>
          <SectionTitle>🔗 Подключенные кабели</SectionTitle>
          {cableDeviceEdges.map(edge => {
            const isSource = edge.sourceNodeId === currentNode.id;
            const cableNodeId = isSource ? edge.targetNodeId : edge.sourceNodeId;
            const cableNode = editorStore.getNodeById(cableNodeId);
            const portId = isSource ? edge.source : edge.target;

            return (
              <ConnectionCard key={edge.id}>
                <ConnectionHeader>
                  <ConnectionDevice>
                    🔌 {cableNode?.customName || cableNode?.name || "Кабель"}
                  </ConnectionDevice>
                  <ConnectionPort>{portId}</ConnectionPort>
                </ConnectionHeader>
                <ConnectionDetails>
                  <DetailItem>
                    <DetailLabel>Статус:</DetailLabel>
                    <DetailValue>{edge.isActive !== false ? "🟢 Активен" : "🔴 Неактивен"}</DetailValue>
                  </DetailItem>
                </ConnectionDetails>
              </ConnectionCard>
            );
          })}
        </Section>
      )}

      {/* Подключения к факторам */}
      {factorEdges.length > 0 && (
        <Section>
          <SectionTitle>🔗 Влияние промышленных факторов</SectionTitle>
          {factorEdges.map(edge => {
            const isSource = edge.sourceNodeId === currentNode.id;
            const factorNodeId = isSource ? edge.targetNodeId : edge.sourceNodeId;
            const factorNode = editorStore.getNodeById(factorNodeId);
            const distance = edge.factorData?.distance || 10;

            return (
              <ConnectionCard key={edge.id}>
                <ConnectionHeader>
                  <ConnectionDevice>
                    {getFactorTypeIcon(factorNode?.factorType)} {factorNode?.customName || factorNode?.name || "Фактор"}
                  </ConnectionDevice>
                </ConnectionHeader>
                <ConnectionDetails>
                  <DetailItem>
                    <DetailLabel>Расстояние:</DetailLabel>
                    <DetailValue>{distance} м</DetailValue>
                  </DetailItem>
                </ConnectionDetails>
              </ConnectionCard>
            );
          })}
        </Section>
      )}

      {deviceEdges.length === 0 && (
        <Section>
          <SectionTitle>🔗 Подключения</SectionTitle>
          <PropertyValue style={{ textAlign: "center", color: "#999" }}>
            Нет подключений
          </PropertyValue>
        </Section>
      )}
    </>
  );
});

function getFactorTypeIcon(factorType?: string): string {
  switch (factorType) {
    case "TEMPERATURE": return "🌡️";
    case "EMI": return "⚡";
    case "VIBRATION": return "📳";
    case "DUST": return "🏭";
    default: return "📊";
  }
}

export default DeviceView;
