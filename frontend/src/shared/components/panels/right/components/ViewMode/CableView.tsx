import { EditorNode } from '../../../../../types';
import { EditorStore } from '../../../../../../stores';
import { PropertyGroup, PropertyLabel, PropertyValue, Section, SectionTitle, ConnectionCard, ConnectionHeader, ConnectionDevice, ConnectionPort, ConnectionDetails, DetailItem, DetailLabel, DetailValue } from '../../RightPanel.styles';

interface CableViewProps {
  node: EditorNode;
  editorStore: EditorStore;
}

const CableView: React.FC<CableViewProps> = ({ node, editorStore }) => {
  const cableEdges = editorStore.getNodeConnections(node.id);
  
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
      <PropertyGroup>
        <PropertyLabel>Название</PropertyLabel>
        <PropertyValue>{node.customName || node.name}</PropertyValue>
      </PropertyGroup>
      
      <PropertyGroup>
        <PropertyLabel>Тип</PropertyLabel>
        <PropertyValue>{getCableTypeIcon()} {getCableTypeLabel()}</PropertyValue>
      </PropertyGroup>
      
      <PropertyGroup>
        <PropertyLabel>Длина</PropertyLabel>
        <PropertyValue>{node.lengthM || node.cableLengthM || 10} м</PropertyValue>
      </PropertyGroup>
      
      <PropertyGroup>
        <PropertyLabel>Пропускная способность</PropertyLabel>
        <PropertyValue>{node.bandwidthMbps || 1000} Мбит/с</PropertyValue>
      </PropertyGroup>

      <Section>
        <SectionTitle>🔗 Подключения</SectionTitle>
        {cableEdges.length === 0 ? (
          <PropertyValue style={{ textAlign: "center", color: "#999" }}>
            Не подключен
          </PropertyValue>
        ) : (
          cableEdges.map(edge => {
            const isSource = edge.sourceNodeId === node.id;
            const otherNodeId = isSource ? edge.targetNodeId : edge.sourceNodeId;
            const otherNode = editorStore.getNodeById(otherNodeId);
            const portId = isSource ? edge.source : edge.target;

            return (
              <ConnectionCard key={edge.id}>
                <ConnectionHeader>
                  <ConnectionDevice>{otherNode?.customName || otherNode?.name}</ConnectionDevice>
                  <ConnectionPort>{portId}</ConnectionPort>
                </ConnectionHeader>
                <ConnectionDetails>
                  <DetailItem>
                    <DetailLabel>Длина:</DetailLabel>
                    <DetailValue>{edge.lengthM} м</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Статус:</DetailLabel>
                    <DetailValue>{edge.isActive ? "🟢 Активен" : "🔴 Неактивен"}</DetailValue>
                  </DetailItem>
                </ConnectionDetails>
              </ConnectionCard>
            );
          })
        )}
      </Section>
    </>
  );
};

export default CableView;
