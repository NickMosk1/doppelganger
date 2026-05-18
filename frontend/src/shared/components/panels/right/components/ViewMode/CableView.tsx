import { EditorNode, ConnectionType } from '../../../../../types';
import { PropertyGroup, PropertyLabel, PropertyValue, Section, SectionTitle, ConnectionCard, ConnectionHeader, ConnectionDevice, ConnectionPort, ConnectionDetails, DetailItem, DetailLabel, DetailValue } from '../../RightPanel.styles';
import { useStores } from '../../../../../../hooks';
import { observer } from 'mobx-react-lite';

interface CableViewProps {
  node: EditorNode;
}

const CableView: React.FC<CableViewProps> = observer(({ node }) => {
  const { editorStore } = useStores();

  const cableEdges = editorStore.getNodeConnections(node.id);
  
  // Разделяем связи по типу
  const cableDeviceEdges = cableEdges.filter(edge => edge.connectionType === ConnectionType.CABLE_DEVICE);
  const factorEdges = cableEdges.filter(edge => edge.connectionType === ConnectionType.FACTOR_ELEMENT);
  
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
        <PropertyLabel>Длина кабеля</PropertyLabel>
        <PropertyValue>{node.lengthM || node.cableLengthM || 10} м</PropertyValue>
      </PropertyGroup>
      
      <PropertyGroup>
        <PropertyLabel>Пропускная способность</PropertyLabel>
        <PropertyValue>{node.bandwidthMbps || 1000} Мбит/с</PropertyValue>
      </PropertyGroup>

      {/* Подключения к устройствам (CABLE_DEVICE) - без длины */}
      {cableDeviceEdges.length > 0 && (
        <Section>
          <SectionTitle>🔗 Подключено к устройствам</SectionTitle>
          {cableDeviceEdges.map(edge => {
            const isSource = edge.sourceNodeId === node.id;
            const otherNodeId = isSource ? edge.targetNodeId : edge.sourceNodeId;
            const otherNode = editorStore.getNodeById(otherNodeId);
            const portId = isSource ? edge.source : edge.target;

            return (
              <ConnectionCard key={edge.id}>
                <ConnectionHeader>
                  <ConnectionDevice>{otherNode?.customName || otherNode?.name || "Устройство"}</ConnectionDevice>
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
            const isSource = edge.sourceNodeId === node.id;
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

      {cableEdges.length === 0 && (
        <Section>
          <SectionTitle>🔗 Подключения</SectionTitle>
          <PropertyValue style={{ textAlign: "center", color: "#999" }}>
            Не подключен
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

export default CableView;
