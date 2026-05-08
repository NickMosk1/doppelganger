import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import SimulationService from '../../../../../../services/simulation.service';
import { useStores } from '../../../../../../hooks';
import { Button } from '../../../../Button';
import { Section, SectionTitle, PropertyGroup, PropertyLabel, PropertyInput, Divider, PropertyValue } from '../../RightPanel.styles';

const simulationService = new SimulationService();

const SimulationTab: React.FC = observer(() => {
  const { editorStore, simulationStore } = useStores();
  const [isSimulating, setIsSimulating] = useState(false);

  const result = simulationStore.currentResult;
  const config = simulationStore.config;

  const handleDurationChange = (value: number) => {
    simulationStore.setDuration(value);
  };

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

  return (
    <Section>
      <SectionTitle>Запуск симуляции</SectionTitle>
      
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
        {isSimulating ? "⏳ Симуляция..." : "▶ Запустить симуляцию"}
      </Button>
      
      <Divider />
      
      <SectionTitle>Результаты</SectionTitle>
      
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
                  <PropertyLabel style={{ color: "#ef4444" }}>{event.type}</PropertyLabel>
                  <PropertyValue style={{ fontSize: "12px", background: "#ef444410", color: "#ef4444" }}>
                    {event.message}
                  </PropertyValue>
                </PropertyGroup>
              ))}
              {simulationStore.criticalEvents.length > 3 && (
                <PropertyLabel style={{ textAlign: "center", color: "#999", marginTop: "8px" }}>
                  +{simulationStore.criticalEvents.length - 3} еще
                </PropertyLabel>
              )}
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
});

export default SimulationTab;
