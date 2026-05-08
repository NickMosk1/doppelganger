import { EditorNode } from '../../../../../types';
import { PropertyGroup, PropertyLabel, PropertyValue, StatusBadge } from '../../RightPanel.styles';

interface DeviceViewProps {
  node: EditorNode;
}

const DeviceView: React.FC<DeviceViewProps> = ({ node }) => {
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

  return (
    <>
      <PropertyGroup>
        <PropertyLabel>Название</PropertyLabel>
        <PropertyValue>{node.customName || node.name}</PropertyValue>
      </PropertyGroup>
      <PropertyGroup>
        <PropertyLabel>Тип</PropertyLabel>
        <PropertyValue>Устройство</PropertyValue>
      </PropertyGroup>
      <PropertyGroup>
        <PropertyLabel>Статус</PropertyLabel>
        <StatusBadge status={getStatusColor(node.status)}>
          {getStatusText(node.status)}
        </StatusBadge>
      </PropertyGroup>
      <PropertyGroup>
        <PropertyLabel>Базовая задержка</PropertyLabel>
        <PropertyValue>{node.baseLatencyMs || 0} мс</PropertyValue>
      </PropertyGroup>
      <PropertyGroup>
        <PropertyLabel>Макс. пропускная способность</PropertyLabel>
        <PropertyValue>{node.maxThroughputMbps || 0} Мбит/с</PropertyValue>
      </PropertyGroup>
    </>
  );
};

export default DeviceView;
