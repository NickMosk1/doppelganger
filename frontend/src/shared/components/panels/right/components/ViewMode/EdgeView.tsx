import { EditorStore } from '../../../../../../stores';
import { EditorEdge } from '../../../../../types';
import { ConnectionCard, ConnectionHeader, ConnectionDevice, ConnectionPort, PropertyGroup, PropertyLabel, PropertyValue, StatusBadge } from '../../RightPanel.styles';

interface EdgeViewProps {
  edge: EditorEdge;
  editorStore: EditorStore;
}

export const EdgeView: React.FC<EdgeViewProps> = ({ edge, editorStore }) => {
  const sourceNode = editorStore.getNodeById(edge.sourceNodeId);
  const targetNode = editorStore.getNodeById(edge.targetNodeId);
  
  return (
    <>
      <ConnectionCard style={{ marginBottom: 20 }}>
        <ConnectionHeader>
          <ConnectionDevice>{sourceNode?.customName || sourceNode?.name}</ConnectionDevice>
          <ConnectionPort>{edge.source}</ConnectionPort>
          <span style={{ fontSize: 18, color: "#e54848" }}>→</span>
          <ConnectionPort>{edge.target}</ConnectionPort>
          <ConnectionDevice>{targetNode?.customName || targetNode?.name}</ConnectionDevice>
        </ConnectionHeader>
      </ConnectionCard>
      
      <PropertyGroup>
        <PropertyLabel>Длина кабеля</PropertyLabel>
        <PropertyValue>{edge.lengthM} м</PropertyValue>
      </PropertyGroup>
      
      <PropertyGroup>
        <PropertyLabel>Пропускная способность</PropertyLabel>
        <PropertyValue>{edge.bandwidthMbps || 1000} Мбит/с</PropertyValue>
      </PropertyGroup>
      
      <PropertyGroup>
        <PropertyLabel>Статус</PropertyLabel>
        <StatusBadge status={edge.isActive ? "success" : "error"}>
          {edge.isActive ? "🟢 Активен" : "🔴 Неактивен"}
        </StatusBadge>
      </PropertyGroup>
    </>
  );
};

export default EdgeView;
