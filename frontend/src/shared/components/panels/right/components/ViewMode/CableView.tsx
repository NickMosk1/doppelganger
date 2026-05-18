import { EditorNode, ConnectionType } from '../../../../../types';
import { PropertyGroup, PropertyLabel, PropertyValue, Section, SectionTitle, ConnectionCard, ConnectionHeader, ConnectionDevice, ConnectionPort, ConnectionDetails, DetailItem, DetailLabel, DetailValue, StatsGrid, StatCard } from '../../RightPanel.styles';
import { useStores } from '../../../../../../hooks';
import { observer } from 'mobx-react-lite';

interface CableViewProps {
  node: EditorNode;
}

const CableView: React.FC<CableViewProps> = observer(({ node }) => {
  const { editorStore } = useStores();

  const cableEdges = editorStore.getNodeConnections(node.id);
  
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

  const getShieldingTypeLabel = (type?: number): string => {
    switch (type) {
      case 1: return "Фольга";
      case 2: return "Оплетка";
      case 3: return "Двойной экран";
      default: return "Без экрана";
    }
  };

  return (
    <>
      {/* Основные параметры */}
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

      {/* Физические характеристики */}
      <Section>
        <SectionTitle>📐 Физические характеристики</SectionTitle>
        <StatsGrid>
          <StatCard>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>
              {node.maxLengthM || node.lengthM || 10} м
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Макс. длина</div>
          </StatCard>
          <StatCard>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>
              {node.attenuationDbPerKm ? `${node.attenuationDbPerKm} дБ/км` : "—"}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Затухание</div>
          </StatCard>
          <StatCard>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>
              {node.propagationSpeed ? `${(node.propagationSpeed * 100).toFixed(0)}%` : "—"}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Скорость распространения</div>
          </StatCard>
          <StatCard>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>
              {node.bendingRadiusMm ? `${node.bendingRadiusMm} мм` : "—"}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Мин. радиус изгиба</div>
          </StatCard>
        </StatsGrid>

        <DetailItem>
          <DetailLabel>Прочность на разрыв:</DetailLabel>
          <DetailValue>{node.tensileStrengthN ? `${node.tensileStrengthN} Н` : "—"}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Макс. рабочее натяжение:</DetailLabel>
          <DetailValue>{node.operatingTensionMaxN ? `${node.operatingTensionMaxN} Н` : "—"}</DetailValue>
        </DetailItem>
      </Section>

      {/* Электрические/оптические параметры */}
      <Section>
        <SectionTitle>⚡ Электрические параметры</SectionTitle>
        <DetailItem>
          <DetailLabel>Импеданс:</DetailLabel>
          <DetailValue>{node.impedanceOhms ? `${node.impedanceOhms} Ом` : "—"}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Диаметр жилы/сердцевины:</DetailLabel>
          <DetailValue>{node.coreDiameterUm ? `${node.coreDiameterUm} мкм` : "—"}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Емкость на км:</DetailLabel>
          <DetailValue>{node.capacitancePerKmNf ? `${node.capacitancePerKmNf} нФ` : "—"}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Сопротивление на км:</DetailLabel>
          <DetailValue>{node.resistancePerKmOhms ? `${node.resistancePerKmOhms} Ом` : "—"}</DetailValue>
        </DetailItem>
      </Section>

      {/* Частотные характеристики */}
      <Section>
        <SectionTitle>📡 Частотные характеристики</SectionTitle>
        <DetailItem>
          <DetailLabel>Макс. частота:</DetailLabel>
          <DetailValue>{node.maxFrequencyMhz ? `${node.maxFrequencyMhz} МГц` : "—"}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Отношение сигнал/шум:</DetailLabel>
          <DetailValue>{node.signalToNoiseRatioDb ? `${node.signalToNoiseRatioDb} дБ` : "—"}</DetailValue>
        </DetailItem>
      </Section>

      {/* Промышленная устойчивость */}
      <Section>
        <SectionTitle>🏭 Промышленная устойчивость</SectionTitle>
        <StatsGrid>
          <StatCard>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
              {node.immunityRating || 5}/10
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Помехоустойчивость</div>
          </StatCard>
          <StatCard>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
              {node.temperatureRating || 60}°C
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Раб. температура</div>
          </StatCard>
          <StatCard>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
              {getShieldingTypeLabel(node.shieldingType)}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Экранирование</div>
          </StatCard>
        </StatsGrid>

        <DetailItem>
          <DetailLabel>Маслостойкость:</DetailLabel>
          <DetailValue>{node.oilResistance ? "✅ Да" : "❌ Нет"}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>УФ-устойчивость:</DetailLabel>
          <DetailValue>{node.uvResistance ? "✅ Да" : "❌ Нет"}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Химическая стойкость:</DetailLabel>
          <DetailValue>{node.chemicalResistance || "—"}</DetailValue>
        </DetailItem>
      </Section>

      {/* Срок службы */}
      <Section>
        <SectionTitle>⏳ Срок службы</SectionTitle>
        <StatsGrid>
          <StatCard>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>
              {node.expectedLifetimeYears || 10} лет
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Ожидаемый срок</div>
          </StatCard>
          <StatCard>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444' }}>
              {node.degradationRatePerYear ? `${node.degradationRatePerYear}%/год` : "—"}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Деградация в год</div>
          </StatCard>
        </StatsGrid>
      </Section>

      {/* Подключения к устройствам */}
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

      {/* Подключения к факторам */}
      {factorEdges.length > 0 && (
        <Section>
          <SectionTitle>🔗 Влияние промышленных факторов</SectionTitle>
          {factorEdges.map(edge => {
            const isSource = edge.sourceNodeId === node.id;
            const factorNodeId = isSource ? edge.targetNodeId : edge.sourceNodeId;
            const factorNode = editorStore.getNodeById(factorNodeId);
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
                  <DetailItem>
                    <DetailLabel>Ослабление:</DetailLabel>
                    <DetailValue>{edge.factorData?.attenuation || 0}%</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Статус связи:</DetailLabel>
                    <DetailValue>{edge.isActive !== false ? "🟢 Активна" : "🔴 Неактивна"}</DetailValue>
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
