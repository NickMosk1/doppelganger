import { EditorStore } from '../../../../../../stores';
import { EditorNode } from '../../../../../types';
import { PropertyGroup, PropertyLabel, PropertyValue, Section, SectionTitle, ConnectionCard, ConnectionHeader, ConnectionDevice, ConnectionPort, ConnectionDetails, DetailItem, DetailLabel, DetailValue } from '../../RightPanel.styles';

interface CableViewProps {
  node: EditorNode;
  editorStore: EditorStore;
}

const CableView: React.FC<CableViewProps> = ({ node, editorStore }) => {
  const cableEdges = editorStore.getNodeConnections(node.id);

  return (
    <>
      <PropertyGroup>
        <PropertyLabel>Название</PropertyLabel>
        <PropertyValue>{node.customName || node.name}</PropertyValue>
      </PropertyGroup>
      <PropertyGroup>
        <PropertyLabel>Тип</PropertyLabel>
        <PropertyValue>{node.cableType || "Ethernet"}</PropertyValue>
      </PropertyGroup>
      <PropertyGroup>
        <PropertyLabel>Длина</PropertyLabel>
        <PropertyValue>{node.lengthM || 10} м</PropertyValue>
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
