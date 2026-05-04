import { useState } from "react";
import { observer } from "mobx-react-lite";
import {
  RightPanelContainer,
  PanelHeader,
  PanelTitle,
  PanelContent,
  PropertyGroup,
  PropertyLabel,
  PropertyValue,
  PropertyInput,
  Section,
  SectionTitle,
  Tabs,
  Tab,
  StatusBadge,
  Divider,
  FactorSlider,
  FactorValue,
  FactorRow,
  FactorLabel,
  NoSelectionMessage,
} from "./RightPanel.styles";
import { Button } from "../../Button";
import { EditorNodes } from "../../../types";
import SimulationService from "../../../../services/simulation.service";
import { useStores } from "../../../../hooks";

type TabType = "properties" | "factors" | "simulation";

const simulationService = new SimulationService();

const RightPanel: React.FC = observer(() => {
  const { editorStore, simulationStore } = useStores();
  const [activeTab, setActiveTab] = useState<TabType>("properties");
  const [isSimulating, setIsSimulating] = useState(false);

  const selectedNode = editorStore.selectedNode;
  const selectedEdge = editorStore.selectedEdge;

  const handleNodeNameChange = (value: string) => {
    if (selectedNode) {
      editorStore.updateNodeName(selectedNode.id, value);
    }
  };

  const handleEdgeLengthChange = (value: number) => {
    if (selectedEdge) {
      editorStore.updateEdge(selectedEdge.id, { lengthM: value });
    }
  };

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

  // Обработчики глобальных факторов
  const handleTemperatureChange = (value: number) => {
    simulationStore.setTemperature(value);
  };

  const handleEmiChange = (value: number) => {
    simulationStore.setEmi(value);
  };

  const handleVibrationChange = (value: number) => {
    simulationStore.setVibration(value);
  };

  const handleDurationChange = (value: number) => {
    simulationStore.setDuration(value);
  };

  // Запуск симуляции
  const handleRunSimulation = async () => {
    const schemaId = editorStore.currentSchemaId;
    if (!schemaId) {
      alert("Сначала сохраните схему");
      return;
    }

    setIsSimulating(true);
    simulationStore.setRunning(true);

    try {
      const result = await simulationService.runSimulation(schemaId, {
        name: `Симуляция ${new Date().toLocaleTimeString()}`,
        durationSeconds: simulationStore.config.durationSeconds,
        factors: simulationStore.globalFactors,
      });

      simulationStore.setCurrentResult(result);
      
      // Показываем результат
      const grade = result.summary?.grade || "F";
      const maxLatency = result.summary?.maxLatencyMs || 0;
      alert(`Симуляция завершена!\nОценка: ${grade}\nМакс. задержка: ${maxLatency} мс`);
    } catch (error) {
      console.error("Simulation failed:", error);
      alert("Ошибка при запуске симуляции");
    } finally {
      setIsSimulating(false);
      simulationStore.setRunning(false);
    }
  };

  // Рендер свойств устройства
  const renderDeviceProperties = () => {
    if (!selectedNode || selectedNode.type !== EditorNodes.DEVICE) return null;

    const deviceName = selectedNode.customName || selectedNode.name;
    const status = selectedNode.status;

    return (
      <>
        <PropertyGroup>
          <PropertyLabel>Название устройства</PropertyLabel>
          <PropertyInput
            type="text"
            value={deviceName}
            onChange={(e) => editorStore.updateNodeField(selectedNode.id, "customName", e.target.value)}
          />
        </PropertyGroup>

        <PropertyGroup>
          <PropertyLabel>Тип</PropertyLabel>
          <PropertyValue>Устройство</PropertyValue>
        </PropertyGroup>

        <PropertyGroup>
          <PropertyLabel>Статус</PropertyLabel>
          <StatusBadge status={getStatusColor(status)}>
            {getStatusText(status)}
          </StatusBadge>
        </PropertyGroup>

        <PropertyGroup>
          <PropertyLabel>Включено</PropertyLabel>
          <PropertyInput
            type="checkbox"
            checked={selectedNode.isEnabled !== false}
            onChange={(e) => editorStore.updateNodeEnabled(selectedNode.id, e.target.checked)}
          />
        </PropertyGroup>

        <Divider />

        <Section>
          <SectionTitle>📊 Характеристики</SectionTitle>
          <PropertyGroup>
            <PropertyLabel>Базовая задержка</PropertyLabel>
            <PropertyValue>{selectedNode.baseLatencyMs || 0} мс</PropertyValue>
          </PropertyGroup>
          <PropertyGroup>
            <PropertyLabel>Макс. пропускная способность</PropertyLabel>
            <PropertyValue>{selectedNode.maxThroughputMbps || 0} Мбит/с</PropertyValue>
          </PropertyGroup>
        </Section>

        <Divider />

        <Section>
          <SectionTitle>📊 Промышленные факторы</SectionTitle>
          
          <FactorRow>
            <FactorLabel>🌡️ Температурное смещение</FactorLabel>
            <FactorSlider
              type="range"
              min={-20}
              max={50}
              step={1}
              value={selectedNode.temperatureOffset || 0}
              onChange={(e) => editorStore.updateNodeOffsets(selectedNode.id, { temperatureOffset: Number(e.target.value) })}
            />
            <FactorValue>{selectedNode.temperatureOffset || 0}°C</FactorValue>
          </FactorRow>

          <FactorRow>
            <FactorLabel>⚡ ЭМИ смещение</FactorLabel>
            <FactorSlider
              type="range"
              min={0}
              max={30}
              step={1}
              value={selectedNode.emiOffset || 0}
              onChange={(e) => editorStore.updateNodeOffsets(selectedNode.id, { emiOffset: Number(e.target.value) })}
            />
            <FactorValue>{selectedNode.emiOffset || 0} dBm</FactorValue>
          </FactorRow>

          <FactorRow>
            <FactorLabel>📳 Вибрация</FactorLabel>
            <FactorSlider
              type="range"
              min={0}
              max={50}
              step={1}
              value={selectedNode.vibrationOffset || 0}
              onChange={(e) => editorStore.updateNodeOffsets(selectedNode.id, { vibrationOffset: Number(e.target.value) })}
            />
            <FactorValue>{selectedNode.vibrationOffset || 0} Hz</FactorValue>
          </FactorRow>
        </Section>
      </>
    );
  };

  // Рендер свойств связи
  const renderEdgeProperties = () => {
    if (!selectedEdge) return null;

    return (
      <>
        <PropertyGroup>
          <PropertyLabel>Длина кабеля (м)</PropertyLabel>
          <PropertyInput
            type="number"
            step={1}
            value={selectedEdge.lengthM}
            onChange={(e) => handleEdgeLengthChange(Number(e.target.value))}
          />
        </PropertyGroup>

        <PropertyGroup>
          <PropertyLabel>Пропускная способность</PropertyLabel>
          <PropertyValue>{selectedEdge.bandwidthMbps || 1000} Мбит/с</PropertyValue>
        </PropertyGroup>

        {selectedEdge.cableInfo && (
          <PropertyGroup>
            <PropertyLabel>Тип кабеля</PropertyLabel>
            <PropertyValue>{selectedEdge.cableInfo.name}</PropertyValue>
          </PropertyGroup>
        )}
      </>
    );
  };

  // Рендер свойств вложенной схемы
  const renderSubschemaProperties = () => {
    if (!selectedNode || selectedNode.type !== EditorNodes.SUBSCHEMA) return null;

    return (
      <>
        <PropertyGroup>
          <PropertyLabel>Название схемы</PropertyLabel>
          <PropertyInput
            type="text"
            value={selectedNode.customName || selectedNode.name}
            onChange={(e) => handleNodeNameChange(e.target.value)}
          />
        </PropertyGroup>

        <PropertyGroup>
          <PropertyLabel>Тип</PropertyLabel>
          <PropertyValue>Вложенная схема</PropertyValue>
        </PropertyGroup>

        <Button variant="outline" fullWidth onClick={() => {
          if (selectedNode.schemaId) {
            window.location.href = `/editor/${selectedNode.schemaId}`;
          }
        }}>
          📂 Открыть схему
        </Button>
      </>
    );
  };

  // Вкладка факторов (с реальными значениями из simulationStore)
  const renderFactorsTab = () => {
    const factors = simulationStore.globalFactors;

    return (
      <Section>
        <SectionTitle>🌡️ Глобальные факторы</SectionTitle>
        
        <FactorRow>
          <FactorLabel>Температура цеха</FactorLabel>
          <FactorSlider
            type="range"
            min={-20}
            max={60}
            step={1}
            value={factors.temperature}
            onChange={(e) => handleTemperatureChange(Number(e.target.value))}
          />
          <FactorValue>{factors.temperature}°C</FactorValue>
        </FactorRow>

        <FactorRow>
          <FactorLabel>Электромагнитные помехи</FactorLabel>
          <FactorSlider
            type="range"
            min={0}
            max={100}
            step={1}
            value={factors.emi}
            onChange={(e) => handleEmiChange(Number(e.target.value))}
          />
          <FactorValue>{factors.emi} dBm</FactorValue>
        </FactorRow>

        <FactorRow>
          <FactorLabel>Вибрация</FactorLabel>
          <FactorSlider
            type="range"
            min={0}
            max={120}
            step={1}
            value={factors.vibration}
            onChange={(e) => handleVibrationChange(Number(e.target.value))}
          />
          <FactorValue>{factors.vibration} Hz</FactorValue>
        </FactorRow>

        <FactorRow>
          <FactorLabel>Запыленность</FactorLabel>
          <FactorSlider
            type="range"
            min={0}
            max={100}
            step={1}
            value={factors.dust}
            onChange={(e) => simulationStore.setDust(Number(e.target.value))}
          />
          <FactorValue>{factors.dust} mg/m³</FactorValue>
        </FactorRow>
      </Section>
    );
  };

  // Вкладка симуляции
  const renderSimulationTab = () => {
    const result = simulationStore.currentResult;
    const config = simulationStore.config;

    return (
      <Section>
        <SectionTitle>▶️ Запуск симуляции</SectionTitle>
        
        <PropertyGroup>
          <PropertyLabel>Длительность (сек)</PropertyLabel>
          <PropertyInput
            type="number"
            value={config.durationSeconds}
            onChange={(e) => handleDurationChange(Number(e.target.value))}
            step={10}
            min={10}
            max={3600}
          />
        </PropertyGroup>

        <Button 
          fullWidth 
          onClick={handleRunSimulation}
          loading={isSimulating || simulationStore.isRunning}
        >
          {isSimulating ? "Симуляция..." : "Запустить симуляцию"}
        </Button>
        
        <Divider />
        
        <SectionTitle>📊 Результаты</SectionTitle>
        
        {result ? (
          <>
            <PropertyGroup>
              <PropertyLabel>Оценка</PropertyLabel>
              <PropertyValue>
                <span style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  background: result.summary?.grade === "A" ? "#10b98120" : 
                              result.summary?.grade === "B" ? "#3b82f620" :
                              result.summary?.grade === "C" ? "#f59e0b20" : "#ef444420",
                  color: result.summary?.grade === "A" ? "#10b981" : 
                          result.summary?.grade === "B" ? "#3b82f6" :
                          result.summary?.grade === "C" ? "#f59e0b" : "#ef4444",
                  fontWeight: "bold",
                }}>
                  {result.summary?.grade || "—"}
                </span>
              </PropertyValue>
            </PropertyGroup>

            <PropertyGroup>
              <PropertyLabel>Макс. задержка</PropertyLabel>
              <PropertyValue>{result.summary?.maxLatencyMs || 0} мс</PropertyValue>
            </PropertyGroup>

            <PropertyGroup>
              <PropertyLabel>Макс. потери пакетов</PropertyLabel>
              <PropertyValue>{result.summary?.maxPacketLossPercent || 0}%</PropertyValue>
            </PropertyGroup>

            <PropertyGroup>
              <PropertyLabel>Мин. пропускная способность</PropertyLabel>
              <PropertyValue>{result.summary?.minThroughputMbps || 0} Мбит/с</PropertyValue>
            </PropertyGroup>

            {simulationStore.criticalEvents.length > 0 && (
              <>
                <Divider />
                <SectionTitle>⚠️ Критические события</SectionTitle>
                {simulationStore.criticalEvents.slice(0, 3).map((event, idx) => (
                  <PropertyGroup key={idx}>
                    <PropertyLabel>{event.type}</PropertyLabel>
                    <PropertyValue style={{ fontSize: "12px", color: "#ef4444" }}>
                      {event.message}
                    </PropertyValue>
                  </PropertyGroup>
                ))}
              </>
            )}
          </>
        ) : (
          <PropertyGroup>
            <PropertyLabel style={{ textAlign: "center", color: "#999" }}>
              Запустите симуляцию для просмотра результатов
            </PropertyLabel>
          </PropertyGroup>
        )}
      </Section>
    );
  };

  const hasSelection = selectedNode || selectedEdge;

  return (
    <RightPanelContainer>
      <Tabs>
        <Tab active={activeTab === "properties"} onClick={() => setActiveTab("properties")}>
          ⚙️ Свойства
        </Tab>
        <Tab active={activeTab === "factors"} onClick={() => setActiveTab("factors")}>
          🌡️ Факторы
        </Tab>
        <Tab active={activeTab === "simulation"} onClick={() => setActiveTab("simulation")}>
          🚀 Симуляция
        </Tab>
      </Tabs>

      <PanelContent>
        {activeTab === "properties" && (
          <>
            <PanelHeader>
              <PanelTitle>
                {selectedNode && selectedNode.type === EditorNodes.DEVICE && "📡 Устройство"}
                {selectedNode && selectedNode.type === EditorNodes.SUBSCHEMA && "📁 Вложенная схема"}
                {selectedEdge && "🔗 Связь"}
                {!hasSelection && "Свойства"}
              </PanelTitle>
            </PanelHeader>

            {!hasSelection && (
              <NoSelectionMessage>
                <span>📌</span>
                <p>Выберите элемент на канвасе,<br />чтобы редактировать его свойства</p>
              </NoSelectionMessage>
            )}

            {selectedNode && selectedNode.type === EditorNodes.DEVICE && renderDeviceProperties()}
            {selectedNode && selectedNode.type === EditorNodes.SUBSCHEMA && renderSubschemaProperties()}
            {selectedEdge && renderEdgeProperties()}
          </>
        )}

        {activeTab === "factors" && renderFactorsTab()}
        {activeTab === "simulation" && renderSimulationTab()}
      </PanelContent>
    </RightPanelContainer>
  );
});

export default RightPanel;
