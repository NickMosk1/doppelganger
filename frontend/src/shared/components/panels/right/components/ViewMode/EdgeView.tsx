import { EditorStore } from '../../../../../../stores';
import { EditorEdge, ConnectionType } from '../../../../../types';
import { NoSelectionMessage, ConnectionCard, ConnectionHeader, ConnectionDevice, PropertyGroup, PropertyLabel, PropertyValue, StatusBadge } from '../../RightPanel.styles';

interface EdgeViewProps {
  edge: EditorEdge;
  editorStore: EditorStore;
}

const getFactorTypeLabel = (type?: string) => {
  switch (type) {
    case "TEMPERATURE": return "🌡️ Температура";
    case "EMI": return "⚡ Электромагнитные помехи";
    case "VIBRATION": return "📳 Вибрация";
    case "DUST": return "🏭 Запыленность";
    default: return "📊 Фактор";
  }
};

export const EdgeView: React.FC<EdgeViewProps> = ({ edge, editorStore }) => {
  const sourceNode = editorStore.getNodeById(edge.sourceNodeId);
  const targetNode = editorStore.getNodeById(edge.targetNodeId);
  
  // Для CABLE_DEVICE типа - показываем информационное сообщение
  if (edge.connectionType === ConnectionType.CABLE_DEVICE) {
    return (
      <NoSelectionMessage>
        <span>🔌</span>
        <p>Это техническая связь между кабелем и устройством.<br />
        Параметры кабеля можно отредактировать,<br />
        выбрав сам кабель на схеме.</p>
      </NoSelectionMessage>
    );
  }
  
  // Для FACTOR_ELEMENT типа - показываем полную информацию
  if (edge.connectionType === ConnectionType.FACTOR_ELEMENT) {
    const factorNode = sourceNode?.type === "FACTOR" ? sourceNode : targetNode;
    const elementNode = sourceNode?.type === "FACTOR" ? targetNode : sourceNode;
    const factorData = edge.factorData;
    
    return (
      <>
        <ConnectionCard style={{ marginBottom: 20 }}>
          <ConnectionHeader>
            <ConnectionDevice>
              {getFactorTypeLabel(factorData?.factorType)}
            </ConnectionDevice>
            <span style={{ fontSize: 18, color: "#f59e0b" }}>→</span>
            <ConnectionDevice>{elementNode?.customName || elementNode?.name}</ConnectionDevice>
          </ConnectionHeader>
        </ConnectionCard>
        
        <PropertyGroup>
          <PropertyLabel>Тип воздействия</PropertyLabel>
          <PropertyValue>{getFactorTypeLabel(factorData?.factorType)}</PropertyValue>
        </PropertyGroup>
        
        <PropertyGroup>
          <PropertyLabel>Расстояние до источника</PropertyLabel>
          <PropertyValue>{factorData?.distance || 0} м</PropertyValue>
        </PropertyGroup>
        
        <PropertyGroup>
          <PropertyLabel>Ослабление воздействия</PropertyLabel>
          <PropertyValue>{factorData?.attenuation || 0}%</PropertyValue>
        </PropertyGroup>
        
        <PropertyGroup>
          <PropertyLabel>Влияющий элемент</PropertyLabel>
          <PropertyValue>{factorNode?.customName || factorNode?.name || "Источник"}</PropertyValue>
        </PropertyGroup>
        
        <PropertyGroup>
          <PropertyLabel>Принимающий элемент</PropertyLabel>
          <PropertyValue>{elementNode?.customName || elementNode?.name}</PropertyValue>
        </PropertyGroup>
        
        <PropertyGroup>
          <PropertyLabel>Статус связи</PropertyLabel>
          <StatusBadge status={edge.isActive ? "success" : "error"}>
            {edge.isActive ? "🟢 Активна" : "🔴 Неактивна"}
          </StatusBadge>
        </PropertyGroup>
      </>
    );
  }
  
  // Fallback для неизвестного типа
  return (
    <NoSelectionMessage>
      <span>❓</span>
      <p>Неизвестный тип связи</p>
    </NoSelectionMessage>
  );
};

export default EdgeView;
