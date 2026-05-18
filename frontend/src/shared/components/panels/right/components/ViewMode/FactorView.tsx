import { observer } from 'mobx-react-lite';
import { EditorNode, ConnectionType } from '../../../../../types';
import { 
  PropertyGroup, PropertyLabel, PropertyValue, StatusBadge, 
  Section, SectionTitle, ConnectionCard, ConnectionHeader, 
  ConnectionDevice, ConnectionDetails, DetailItem, DetailLabel, 
  DetailValue, StatsGrid, StatCard,
  StatLabel,
  StatValue
} from '../../RightPanel.styles';
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

const getChangePatternLabel = (pattern?: string): string => {
  switch (pattern) {
    case "LINEAR": return "Линейное";
    case "SINE": return "Синусоидальное";
    case "STEP": return "Ступенчатое";
    case "RANDOM": return "Случайное";
    default: return "Постоянное";
  }
};

const getFalloffTypeLabel = (type?: string): string => {
  switch (type) {
    case "INVERSE_SQUARE": return "Обратный квадрат";
    case "LINEAR": return "Линейное";
    case "STEP": return "Ступенчатое";
    default: return "Отсутствует";
  }
};

const FactorView: React.FC<FactorViewProps> = observer(({ node }) => {
  const { editorStore } = useStores();
  
  const currentNode = editorStore.getNodeById(node.id);
  
  if (!currentNode) {
    return <PropertyValue>Нода не найдена</PropertyValue>;
  }
  
  // Основные поля
  const factorType = currentNode.factorType || currentNode.factor?.factorType || "UNKNOWN";
  const factorValue = currentNode.factorValue ?? currentNode.factor?.factorValue ?? 0;
  const factorUnit = currentNode.factorUnit || currentNode.factor?.factorUnit || getFactorUnit(factorType);
  const factorRadius = currentNode.factorRadius ?? currentNode.factor?.factorRadius ?? 10;
  const isEnabled = currentNode.isEnabled !== false;
  const displayName = currentNode.customName || currentNode.name;
  const priority = currentNode.priority ?? currentNode.factor?.priority ?? 5;

  // Динамические поля
  const changeRatePerSecond = currentNode.changeRatePerSecond ?? currentNode.factor?.changeRatePerSecond;
  const minValue = currentNode.minValue ?? currentNode.factor?.minValue;
  const maxValue = currentNode.maxValue ?? currentNode.factor?.maxValue;
  const valueChangePattern = currentNode.valueChangePattern ?? currentNode.factor?.valueChangePattern ?? "NONE";
  const frequencyHz = currentNode.frequencyHz ?? currentNode.factor?.frequencyHz;
  const startTimeSeconds = currentNode.startTimeSeconds ?? currentNode.factor?.startTimeSeconds;
  const durationSeconds = currentNode.durationSeconds ?? currentNode.factor?.durationSeconds;
  const falloffType = currentNode.falloffType ?? currentNode.factor?.falloffType ?? "NONE";
  const falloffExponent = currentNode.falloffExponent ?? currentNode.factor?.falloffExponent ?? 2.0;

  // Пороги
  const warningThreshold = currentNode.warningThreshold ?? currentNode.factor?.warningThreshold;
  const criticalThreshold = currentNode.criticalThreshold ?? currentNode.factor?.criticalThreshold;
  const failureThreshold = currentNode.failureThreshold ?? currentNode.factor?.failureThreshold;

  // Находим все связи
  const factorEdges = editorStore.edges.filter(
    edge => edge.connectionType === ConnectionType.FACTOR_ELEMENT && 
    (edge.sourceNodeId === currentNode.id || edge.targetNodeId === currentNode.id)
  );

  const affectedElements = factorEdges.map(edge => {
    const elementId = edge.sourceNodeId === currentNode.id ? edge.targetNodeId : edge.sourceNodeId;
    const element = editorStore.getNodeById(elementId);
    const distance = edge.factorData?.distance || 10;
    const attenuation = edge.factorData?.attenuation || 0;
    const isActive = edge.isActive !== false;
    return { element, distance, attenuation, edgeId: edge.id, isActive };
  }).filter(item => item.element);

  const formatNumber = (value?: number, decimals: number = 2): string => {
    if (value === undefined || value === null) return "—";
    return value.toFixed(decimals);
  };

  return (
    <>
      {/* Основная информация */}
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

      <PropertyGroup>
        <PropertyLabel>Приоритет</PropertyLabel>
        <PropertyValue>{priority}/10</PropertyValue>
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Статус</PropertyLabel>
        <StatusBadge status={isEnabled ? "success" : "error"}>
          {isEnabled ? "🟢 Активен" : "🔴 Неактивен"}
        </StatusBadge>
      </PropertyGroup>

      {/* Динамика изменения */}
      <Section>
        <SectionTitle>📈 Динамика изменения</SectionTitle>
        <StatsGrid>
          <StatCard>
            <StatValue>{getChangePatternLabel(valueChangePattern)}</StatValue>
            <StatLabel>Паттерн изменения</StatLabel>
          </StatCard>
          {changeRatePerSecond !== undefined && changeRatePerSecond !== 0 && (
            <StatCard>
              <StatValue>{formatNumber(changeRatePerSecond)} {factorUnit}/с</StatValue>
              <StatLabel>Скорость изменения</StatLabel>
            </StatCard>
          )}
          {frequencyHz !== undefined && frequencyHz !== 0 && (
            <StatCard>
              <StatValue>{formatNumber(frequencyHz)} Гц</StatValue>
              <StatLabel>Частота</StatLabel>
            </StatCard>
          )}
        </StatsGrid>

        {(minValue !== undefined || maxValue !== undefined) && (
          <DetailItem>
            <DetailLabel>Диапазон:</DetailLabel>
            <DetailValue>
              {minValue !== undefined ? `${minValue} ${factorUnit}` : "—"} → 
              {maxValue !== undefined ? `${maxValue} ${factorUnit}` : "—"}
            </DetailValue>
          </DetailItem>
        )}
      </Section>

      {/* Временные характеристики */}
      <Section>
        <SectionTitle>⏱️ Временные характеристики</SectionTitle>
        <StatsGrid>
          <StatCard>
            <StatValue>{startTimeSeconds !== undefined ? `${startTimeSeconds} с` : "0 с"}</StatValue>
            <StatLabel>Начало действия</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{durationSeconds !== undefined ? `${durationSeconds} с` : "Постоянно"}</StatValue>
            <StatLabel>Длительность</StatLabel>
          </StatCard>
        </StatsGrid>
      </Section>

      {/* Пространственное распределение */}
      <Section>
        <SectionTitle>🗺️ Пространственное распределение</SectionTitle>
        <StatsGrid>
          <StatCard>
            <StatValue>{getFalloffTypeLabel(falloffType)}</StatValue>
            <StatLabel>Тип затухания</StatLabel>
          </StatCard>
          {falloffExponent !== 2.0 && (
            <StatCard>
              <StatValue>{formatNumber(falloffExponent)}</StatValue>
              <StatLabel>Степень затухания</StatLabel>
            </StatCard>
          )}
        </StatsGrid>
      </Section>

      {/* Пороги срабатывания */}
      {(warningThreshold !== undefined || criticalThreshold !== undefined || failureThreshold !== undefined) && (
        <Section>
          <SectionTitle>⚠️ Пороги срабатывания</SectionTitle>
          <StatsGrid>
            {warningThreshold !== undefined && (
              <StatCard>
                <StatValue style={{ color: '#f59e0b' }}>{warningThreshold} {factorUnit}</StatValue>
                <StatLabel>Предупреждение</StatLabel>
              </StatCard>
            )}
            {criticalThreshold !== undefined && (
              <StatCard>
                <StatValue style={{ color: '#ef4444' }}>{criticalThreshold} {factorUnit}</StatValue>
                <StatLabel>Критический</StatLabel>
              </StatCard>
            )}
            {failureThreshold !== undefined && (
              <StatCard>
                <StatValue style={{ color: '#b91c1c' }}>{failureThreshold} {factorUnit}</StatValue>
                <StatLabel>Отказ</StatLabel>
              </StatCard>
            )}
          </StatsGrid>
        </Section>
      )}

      {/* Влияет на элементы */}
      <Section>
        <SectionTitle>🔗 Влияет на элементы</SectionTitle>
        {affectedElements.length === 0 ? (
          <PropertyValue style={{ textAlign: "center", color: "#999" }}>
            Не подключен ни к одному элементу
          </PropertyValue>
        ) : (
          affectedElements.map(({ element, distance, attenuation, edgeId, isActive }) => (
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
                  <DetailLabel>Ослабление:</DetailLabel>
                  <DetailValue>{attenuation}%</DetailValue>
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