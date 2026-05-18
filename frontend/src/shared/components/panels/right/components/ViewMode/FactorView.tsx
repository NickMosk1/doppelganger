import { observer } from 'mobx-react-lite';
import { EditorNode, ConnectionType } from '../../../../../types';
import { PropertyGroup, PropertyLabel, PropertyValue, StatusBadge, Section, SectionTitle, ConnectionCard, ConnectionHeader, ConnectionDevice, ConnectionDetails, DetailItem, DetailLabel, DetailValue } from '../../RightPanel.styles';
import { useStores } from '../../../../../../hooks';

interface FactorViewProps {
  node: EditorNode;
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

const getFactorUnit = (factorType?: string): string => {
  switch (factorType) {
    case "TEMPERATURE": return "°C";
    case "EMI": return "dBm";
    case "VIBRATION": return "Hz";
    case "DUST": return "mg/m³";
    default: return "";
  }
};

const FactorView: React.FC<FactorViewProps> = observer(({ node }) => {
  const { editorStore } = useStores();
  
  // Получаем актуальную ноду из editorStore
  const currentNode = editorStore.getNodeById(node.id);
  
  if (!currentNode) {
    return <PropertyValue>Нода не найдена</PropertyValue>;
  }
  
  // 🔧 Улучшено: приоритет у прямых полей (они более свежие после updateNode)
  const factorType = currentNode.factorType || currentNode.factor?.factorType || "UNKNOWN";
  const factorValue = currentNode.factorValue ?? currentNode.factor?.factorValue ?? 0;
  const factorUnit = currentNode.factorUnit || currentNode.factor?.factorUnit || getFactorUnit(factorType);
  const factorRadius = currentNode.factorRadius ?? currentNode.factor?.factorRadius ?? 10;
  const isEnabled = currentNode.isEnabled !== false;
  const displayName = currentNode.customName || currentNode.name;

  // Находим все связи, где этот фактор участвует
  const factorEdges = editorStore.edges.filter(
    edge => edge.connectionType === ConnectionType.FACTOR_ELEMENT && 
    (edge.sourceNodeId === currentNode.id || edge.targetNodeId === currentNode.id)
  );

  const affectedElements = factorEdges.map(edge => {
    const elementId = edge.sourceNodeId === currentNode.id ? edge.targetNodeId : edge.sourceNodeId;
    const element = editorStore.getNodeById(elementId);
    const distance = edge.factorData?.distance || 10;
    const isActive = edge.isActive !== false;
    return { element, distance, edgeId: edge.id, isActive };
  }).filter(item => item.element);

  return (
    <>
      <PropertyGroup>
        <PropertyLabel>Название</PropertyLabel>
        <PropertyValue>{displayName}</PropertyValue>
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Тип фактора</PropertyLabel>
        <PropertyValue>
          {getFactorTypeIcon(factorType)} {getFactorTypeLabel(factorType)}
        </PropertyValue>
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Интенсивность</PropertyLabel>
        <PropertyValue>{factorValue} {factorUnit}</PropertyValue>
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Радиус влияния</PropertyLabel>
        <PropertyValue>{factorRadius} м</PropertyValue>
      </PropertyGroup>

      <Section>
        <SectionTitle>🔗 Влияет на элементы</SectionTitle>
        {affectedElements.length === 0 ? (
          <PropertyValue style={{ textAlign: "center", color: "#999" }}>
            Не подключен ни к одному элементу
          </PropertyValue>
        ) : (
          affectedElements.map(({ element, distance, edgeId, isActive }) => (
            <ConnectionCard key={edgeId} style={{ opacity: isActive ? 1 : 0.5 }}>
              <ConnectionHeader>
                <ConnectionDevice>
                  {getFactorTypeIcon(factorType)} → {element?.customName || element?.name}
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
                {!isActive && (
                  <DetailItem>
                    <DetailLabel>Статус:</DetailLabel>
                    <DetailValue style={{ color: "#ef4444" }}>⛔ Связь неактивна</DetailValue>
                  </DetailItem>
                )}
              </ConnectionDetails>
            </ConnectionCard>
          ))
        )}
      </Section>
    </>
  );
});

export default FactorView;
