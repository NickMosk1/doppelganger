import { observer } from 'mobx-react-lite';
import { useStores } from '../../../../../../hooks';
import { EditorNode, ConnectionType } from '../../../../../types';
import { Button } from '../../../../Button';
import { PropertyGroup, PropertyLabel, PropertyValue, StatusBadge, Section, SectionTitle, ConnectionCard, ConnectionHeader, ConnectionDevice, ConnectionPort, ConnectionDetails, DetailItem, DetailLabel, DetailValue } from '../../RightPanel.styles';

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

const DeviceView: React.FC<DeviceViewProps> = observer(({ node }) => {
  const { editorStore } = useStores();
  
  // Получаем актуальную ноду из editorStore для гарантии свежих данных
  const currentNode = editorStore.getNodeById(node.id);
  
  if (!currentNode) {
    return <PropertyValue>Нода не найдена</PropertyValue>;
  }
  
  // Получаем все связи устройства
  const deviceEdges = editorStore.getNodeConnections(currentNode.id);
  
  // Разделяем связи по типу
  const cableDeviceEdges = deviceEdges.filter(edge => edge.connectionType === ConnectionType.CABLE_DEVICE);
  const factorEdges = deviceEdges.filter(edge => edge.connectionType === ConnectionType.FACTOR_ELEMENT);
  
  // Используем currentNode для получения актуальных данных
  const deviceData = currentNode.device;
  const deviceName = currentNode.customName || deviceData?.name || currentNode.name;
  const deviceType = deviceData?.type || currentNode.deviceType || "DEVICE";
  const manufacturer = deviceData?.manufacturer || currentNode.manufacturer;
  const baseLatencyMs = currentNode.baseLatencyMs ?? deviceData?.baseLatencyMs ?? 0;
  const maxThroughputMbps = currentNode.maxThroughputMbps ?? deviceData?.maxThroughputMbps ?? 0;
  const status = currentNode.status;

  const isStartPoint = editorStore.startPointId === currentNode.id;
  const isEndPoint = editorStore.endPointId === currentNode.id;

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

  return (
    <>
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

      <PropertyGroup>
        <PropertyLabel>Статус</PropertyLabel>
        <StatusBadge status={getStatusColor(status)}>
          {getStatusText(status)}
        </StatusBadge>
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Базовая задержка</PropertyLabel>
        <PropertyValue>{baseLatencyMs} мс</PropertyValue>
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Макс. пропускная способность</PropertyLabel>
        <PropertyValue>{maxThroughputMbps} Мбит/с</PropertyValue>
      </PropertyGroup>

      {/* Подключения к кабелям (CABLE_DEVICE) - без длины */}
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

      {/* Подключения к факторам (FACTOR_ELEMENT) - с длиной */}
      {factorEdges.length > 0 && (
        <Section>
          <SectionTitle>🔗 Влияние промышленных факторов</SectionTitle>
          {factorEdges.map(edge => {
            const isSource = edge.sourceNodeId === currentNode.id;
            const factorNodeId = isSource ? edge.targetNodeId : edge.sourceNodeId;
            const factorNode = editorStore.getNodeById(factorNodeId);
            
            // Длина берется из factorData.distance
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

// Вспомогательная функция для иконки типа фактора
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
