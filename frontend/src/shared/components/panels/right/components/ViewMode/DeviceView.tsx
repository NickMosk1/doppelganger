import { useStores } from '../../../../../../hooks';
import { EditorNode } from '../../../../../types';
import { Button } from '../../../../Button';
import { PropertyGroup, PropertyLabel, PropertyValue, StatusBadge } from '../../RightPanel.styles';

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

const DeviceView: React.FC<DeviceViewProps> = ({ node }) => {
  const { editorStore } = useStores();
  const deviceData = node.device;
  const deviceName = node.customName || deviceData?.name || node.name;
  const deviceType = deviceData?.type || "DEVICE";
  const manufacturer = deviceData?.manufacturer;
  const baseLatencyMs = deviceData?.baseLatencyMs ?? node.baseLatencyMs ?? 0;
  const maxThroughputMbps = deviceData?.maxThroughputMbps ?? node.maxThroughputMbps ?? 0;
  const status = node.status;

  const isStartPoint = editorStore.startPointId === node.id;
  const isEndPoint = editorStore.endPointId === node.id;

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
    </>
  );
};

export default DeviceView;
