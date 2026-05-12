import { EditorNode, ConnectionType } from '../../../../../types';
import { EditorStore } from '../../../../../../stores';
import { PropertyGroup, PropertyLabel, PropertyValue, StatusBadge, Section, SectionTitle, ConnectionCard, ConnectionHeader, ConnectionDevice, ConnectionDetails, DetailItem, DetailLabel, DetailValue } from '../../RightPanel.styles';

interface FactorViewProps {
  node: EditorNode;
  editorStore: EditorStore;
}

const getFactorTypeIcon = (type?: string): string => {
  switch (type) {
    case "TEMPERATURE": return "🌡️";
    case "EMI": return "⚡";
    case "VIBRATION": return "📳";
    case "DUST": return "🏭";
    default: return "📊";
  }
};

const getFactorTypeLabel = (type?: string): string => {
  switch (type) {
    case "TEMPERATURE": return "Температура";
    case "EMI": return "Электромагнитные помехи";
    case "VIBRATION": return "Вибрация";
    case "DUST": return "Запыленность";
    default: return type || "Неизвестно";
  }
};

export const FactorView: React.FC<FactorViewProps> = ({ node, editorStore }) => {
  // Используем node.factor если есть, иначе поля из корня
  const factorData = node.factor;

  // Находим все связи, где этот фактор участвует
  const factorEdges = editorStore.edges.filter(
    edge => edge.connectionType === ConnectionType.FACTOR_ELEMENT && 
    (edge.sourceNodeId === node.id || edge.targetNodeId === node.id)
  );

  const affectedElements = factorEdges.map(edge => {
    const elementId = edge.sourceNodeId === node.id ? edge.targetNodeId : edge.sourceNodeId;
    const element = editorStore.getNodeById(elementId);
    const distance = edge.factorData?.distance || 10;
    return { element, distance, edgeId: edge.id };
  }).filter(item => item.element);

  return (
    <>
      <PropertyGroup>
        <PropertyLabel>Название</PropertyLabel>
        <PropertyValue>{node.customName || node.name}</PropertyValue>
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Тип фактора</PropertyLabel>
        <PropertyValue>
          {getFactorTypeIcon(factorData?.factorType)} {getFactorTypeLabel(factorData?.factorType)}
        </PropertyValue>
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Интенсивность</PropertyLabel>
        <PropertyValue>{factorData?.factorValue} {factorData?.factorUnit}</PropertyValue>
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Радиус влияния</PropertyLabel>
        <PropertyValue>{factorData?.factorRadius || 10} м</PropertyValue>
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Статус</PropertyLabel>
        <StatusBadge status={node.isEnabled !== false ? "success" : "error"}>
          {node.isEnabled !== false ? "🟢 Активен" : "🔴 Неактивен"}
        </StatusBadge>
      </PropertyGroup>

      <Section>
        <SectionTitle>🔗 Влияет на элементы</SectionTitle>
        {affectedElements.length === 0 ? (
          <PropertyValue style={{ textAlign: "center", color: "#999" }}>
            Не подключен ни к одному элементу
          </PropertyValue>
        ) : (
          affectedElements.map(({ element, distance, edgeId }) => (
            <ConnectionCard key={edgeId}>
              <ConnectionHeader>
                <ConnectionDevice>
                  {getFactorTypeIcon(factorData?.factorType)} → {element?.customName || element?.name}
                </ConnectionDevice>
              </ConnectionHeader>
              <ConnectionDetails>
                <DetailItem>
                  <DetailLabel>Расстояние:</DetailLabel>
                  <DetailValue>{distance} м</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Тип элемента:</DetailLabel>
                  <DetailValue>{element?.type === "DEVICE" ? "Устройство" : "Кабель"}</DetailValue>
                </DetailItem>
              </ConnectionDetails>
            </ConnectionCard>
          ))
        )}
      </Section>
    </>
  );
};

export default FactorView;
