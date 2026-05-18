// src/shared/components/LeftPanel/LeftPanel.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { observer } from "mobx-react-lite";
import {
  LeftPanelContainer,
  ResizeHandle,
  PanelTab,
  TabHeader,
  TabContent,
} from "./LeftPanel.styles";
import { CollapsibleSection } from "./components/CollapsibleSection/CollapsibleSection";
import { AddItemButton, CategorySection, ItemCard } from "./components";
import { cableTypeLabels, CableTypes, EditorNodes, FactorTypes, NodeStatus, PortType } from "../../../types";
import { generateDefaultPorts, getDeviceIcon } from "../../Canvas/utils";
import { AddCableModal, AddDeviceModal, AddFactorModal } from "../../../ui";
import { useResizePanel } from "./hooks/useResizePanel";
import CatalogService from "../../../../services/catalog.service";
import { useStores } from "../../../../hooks";

const catalogService = new CatalogService();

type TabType = "catalog" | "factors" | "explorer";

const deviceTypeConfig = [
  { type: "ROUTER", icon: "🌐", label: "Маршрутизаторы" },
  { type: "SWITCH", icon: "🔌", label: "Коммутаторы" },
  { type: "PLC", icon: "⚙️", label: "ПЛК" },
  { type: "SERVER", icon: "🖥️", label: "Серверы" },
  { type: "FIREWALL", icon: "🛡️", label: "Фаерволы" },
  { type: "WORKSTATION", icon: "💻", label: "Рабочие станции" },
];

const factorTypeConfig = [
  { type: "TEMPERATURE", icon: "🌡️", label: "Температурные" },
  { type: "EMI", icon: "⚡", label: "Электромагнитные" },
  { type: "VIBRATION", icon: "📳", label: "Вибрационные" },
  { type: "DUST", icon: "🏭", label: "Запыленность" },
];

const getRandomPosition = () => {
  const centerX = 400;
  const centerY = 300;
  const randomOffsetX = (Math.random() - 0.5) * 200;
  const randomOffsetY = (Math.random() - 0.5) * 200;
  return {
    x: centerX + randomOffsetX,
    y: centerY + randomOffsetY
  };
};

const LeftPanel: React.FC = observer(() => {
  const { catalogStore, editorStore } = useStores();
  const { width, isResizing, startResize } = useResizePanel(280, 200, 450);
  const [activeTab, setActiveTab] = useState<TabType>("catalog");
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [showAddCableModal, setShowAddCableModal] = useState(false);
  const [showAddFactorModal, setShowAddFactorModal] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>("ROUTER");
  const [selectedFactorType, setSelectedFactorType] = useState<string>("TEMPERATURE");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadCatalog = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [devices, cables, publicSchemas, factors] = await Promise.all([
          catalogService.getDevices(),
          catalogService.getCables(),
          catalogService.getPublicSchemas(),
          catalogService.getFactors(),
        ]);
        
        catalogStore.setDevices(devices);
        catalogStore.setCables(cables);
        catalogStore.setPublicSchemas(publicSchemas);
        catalogStore.setFactors(factors);
      } catch (err) {
        console.error("Failed to load catalog:", err);
        setError("Не удалось загрузить каталог");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCatalog();
  }, []);

  const handleAddDevice = async (device: any) => {
    try {
      const newDevice = await catalogService.addDevice({
        ...device,
        type: selectedDeviceType,
      });
      catalogStore.addDeviceSync(newDevice);
    } catch (error) {
      console.error("Failed to add device:", error);
    }
  };

  const handleAddCable = async (cable: any) => {
    try {
      const newCable = await catalogService.addCable(cable);
      catalogStore.addCableSync(newCable);
    } catch (error) {
      console.error("Failed to add cable:", error);
    }
  };

  const handleAddFactor = async (factor: any) => {
    try {
      const schemaId = editorStore.currentSchemaId;
      if (!schemaId || schemaId.startsWith("draft-")) {
        console.error("Cannot add factor: schema not saved yet");
        alert("Сначала сохраните схему");
        return;
      }
      
      const newFactor = await catalogService.addFactor({
        ...factor,
        schemaId,
      });
      catalogStore.addFactorSync(newFactor);
    } catch (error) {
      console.error("Failed to add factor:", error);
      alert("Ошибка при добавлении фактора");
    }
  };

  // Обновленный обработчик для создания узлов
  const handleItemClick = (item: any, sourceType: "device" | "cable" | "factor" | "subschema") => {
    if (sourceType === "cable") {
      const position = getRandomPosition();
      
      const newNode = {
        id: `cable-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        type: EditorNodes.CABLE,
        name: item.name,
        customName: item.name,
        position: position,
        icon: item.icon || "🔌",
        lengthM: 10,
        cableType: item.type,
        bandwidthMbps: item.bandwidthMbps || 1000,
        // Новые поля кабеля
        propagationSpeed: item.propagationSpeed,
        bendingRadiusMm: item.bendingRadiusMm,
        tensileStrengthN: item.tensileStrengthN,
        operatingTensionMaxN: item.operatingTensionMaxN,
        impedanceOhms: item.impedanceOhms,
        coreDiameterUm: item.coreDiameterUm,
        capacitancePerKmNf: item.capacitancePerKmNf,
        resistancePerKmOhms: item.resistancePerKmOhms,
        maxFrequencyMhz: item.maxFrequencyMhz,
        signalToNoiseRatioDb: item.signalToNoiseRatioDb,
        immunityRating: item.immunityRating,
        temperatureRating: item.temperatureRating,
        shieldingType: item.shieldingType,
        oilResistance: item.oilResistance,
        uvResistance: item.uvResistance,
        chemicalResistance: item.chemicalResistance,
        expectedLifetimeYears: item.expectedLifetimeYears,
        degradationRatePerYear: item.degradationRatePerYear,
        isEnabled: true,
        status: NodeStatus.OPERATIONAL,
        ports: [
          { id: "left", name: "Left", type: PortType.ETHERNET, isConnected: false },
          { id: "right", name: "Right", type: PortType.ETHERNET, isConnected: false },
        ],
      };
      
      editorStore.addNode(newNode);
      return;
    }

    if (sourceType === "factor") {
      const position = getRandomPosition();
      
      const newNode = {
        id: `factor-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        type: EditorNodes.FACTOR,
        name: item.name,
        customName: item.name,
        position: position,
        icon: item.icon || getFactorIcon(item.factorType),
        factorType: item.factorType,
        factorValue: item.factorValue,
        factorUnit: item.factorUnit,
        factorRadius: item.factorRadius,
        // Динамические поля фактора
        changeRatePerSecond: item.changeRatePerSecond,
        minValue: item.minValue,
        maxValue: item.maxValue,
        valueChangePattern: item.valueChangePattern,
        frequencyHz: item.frequencyHz,
        startTimeSeconds: item.startTimeSeconds,
        durationSeconds: item.durationSeconds,
        falloffType: item.falloffType,
        falloffExponent: item.falloffExponent,
        warningThreshold: item.warningThreshold,
        criticalThreshold: item.criticalThreshold,
        failureThreshold: item.failureThreshold,
        priority: item.priority,
        isEnabled: true,
        status: NodeStatus.OPERATIONAL,
      };
      
      editorStore.addNode(newNode);
      return;
    }

    const nodeType = sourceType === "device" ? EditorNodes.DEVICE : EditorNodes.SUBSCHEMA;
    const position = getRandomPosition();
    
    const ports = nodeType === EditorNodes.DEVICE ? generateDefaultPorts(item.type, item.maxThroughputMbps, item.portCount) : undefined;
    const icon = nodeType === EditorNodes.DEVICE ? getDeviceIcon(item.type) : "📁";

    const newNode: any = {
      id: `device-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type: nodeType,
      deviceId: sourceType === "device" ? item.id : undefined,
      schemaId: sourceType === "subschema" ? item.id : undefined,
      name: item.name,
      customName: item.name,
      position: position,
      icon: icon,
      ports: ports,
      isEnabled: true,
      status: NodeStatus.OPERATIONAL,
      temperatureOffset: 0,
      emiOffset: 0,
      vibrationOffset: 0,
      dustOffset: 0,
    };

    // Добавляем поля устройства
    if (sourceType === "device") {
      newNode.baseLatencyMs = item.baseLatencyMs || 1;
      newNode.maxThroughputMbps = item.maxThroughputMbps || 100;
      newNode.manufacturer = item.manufacturer;
      newNode.portCount = item.portCount;
      // Промышленные коэффициенты
      newNode.tempCoefficient = item.tempCoefficient || 1.0;
      newNode.emiCoefficient = item.emiCoefficient || 1.0;
      newNode.vibrationCoefficient = item.vibrationCoefficient || 1.0;
      newNode.dustCoefficient = item.dustCoefficient || 1.0;
      // Допустимые диапазоны
      newNode.maxOperatingTemp = item.maxOperatingTemp;
      newNode.minOperatingTemp = item.minOperatingTemp;
      newNode.maxEmiTolerance = item.maxEmiTolerance;
      newNode.maxVibrationTolerance = item.maxVibrationTolerance;
      // Надежность
      newNode.mtbfHours = item.mtbfHours;
      newNode.mttrMinutes = item.mttrMinutes;
      newNode.warmUpTimeSeconds = item.warmUpTimeSeconds;
      // Экономика
      newNode.replacementCost = item.replacementCost;
      newNode.repairCost = item.repairCost;
      // Энергопотребление
      newNode.powerConsumptionWatts = item.powerConsumptionWatts;
      newNode.heatGenerationWatts = item.heatGenerationWatts;
      newNode.ipRating = item.ipRating;
      newNode.operatingHumidityMax = item.operatingHumidityMax;
      newNode.needsCooling = item.needsCooling;
      newNode.hasRedundantPower = item.hasRedundantPower;
    }
    
    editorStore.addNode(newNode);
  };

  const getFactorIcon = (type: string): string => {
    switch (type) {
      case "TEMPERATURE": return "🌡️";
      case "EMI": return "⚡";
      case "VIBRATION": return "📳";
      case "DUST": return "🏭";
      default: return "📊";
    }
  };

  const getFactorUnit = (type: string): string => {
    switch (type) {
      case "TEMPERATURE": return "°C";
      case "EMI": return "dBm";
      case "VIBRATION": return "Hz";
      case "DUST": return "mg/m³";
      default: return "";
    }
  };

  const filterDevices = (devices: any[]) => {
    if (!searchQuery) return devices;
    return devices.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filterFactors = (factors: any[]) => {
    if (!searchQuery) return factors;
    return factors.filter(f => 
      f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.customName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startResize(e);
  }, [startResize]);

  // Остальной код (разметка) остается без изменений...
  // (return с JSX не меняется)

  if (isLoading) {
    return (
      <LeftPanelContainer style={{ width: `${width}px` }} $isResizing={isResizing}>
        <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
          Загрузка каталога...
        </div>
      </LeftPanelContainer>
    );
  }

  if (error) {
    return (
      <LeftPanelContainer style={{ width: `${width}px` }} $isResizing={isResizing}>
        <div style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>
          {error}
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: "16px", padding: "8px 16px", cursor: "pointer" }}
          >
            Повторить
          </button>
        </div>
      </LeftPanelContainer>
    );
  }

  return (
    <LeftPanelContainer style={{ width: `${width}px` }} $isResizing={isResizing}>
      <ResizeHandle
        ref={resizeHandleRef}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => !isResizing && (document.body.style.cursor = 'ew-resize')}
        onMouseLeave={() => !isResizing && (document.body.style.cursor = '')}
      />

      <TabHeader>
        <PanelTab active={activeTab === "catalog"} onClick={() => setActiveTab("catalog")}>
          📚 Каталог
        </PanelTab>
        <PanelTab active={activeTab === "factors"} onClick={() => setActiveTab("factors")}>
          🌡️ Факторы
        </PanelTab>
        <PanelTab active={activeTab === "explorer"} onClick={() => setActiveTab("explorer")}>
          📁 Проводник
        </PanelTab>
      </TabHeader>

      <TabContent>
        {/* Вкладка КАТАЛОГ */}
        {activeTab === "catalog" && (
          <>
            <CollapsibleSection title="УСТРОЙСТВА" icon="🖥️" defaultExpanded={false}>
              {deviceTypeConfig.map(({ type, icon, label }) => {
                const devices = filterDevices(catalogStore.devices.filter(d => d.type === type));
                if (devices.length === 0) return null;
                return (
                  <CollapsibleSection
                    key={type}
                    title={label}
                    icon={icon}
                    nested={true}
                    defaultExpanded={false}
                  >
                    <CategorySection title={label} icon={icon}>
                      {devices.map((device) => (
                        <ItemCard
                          key={device.id}
                          id={device.id}
                          name={device.name}
                          icon={device.icon || icon}
                          badge={device.manufacturer}
                          isCustom={device.isCustom}
                          isSelected={editorStore.selectedNodeId === device.id}
                          tooltipInfo={{
                            title: device.name,
                            rows: [
                              { label: 'Производитель', value: device.manufacturer || '—' },
                              { label: 'Тип', value: device.type },
                              { label: 'Базовая задержка', value: `${device.baseLatencyMs || 0} мс` },
                              { label: 'Пропускная способность', value: `${device.maxThroughputMbps || 0} Мбит/с` },
                              { label: 'Порты', value: device.portCount || '—' },
                            ],
                          }}
                          onClick={() => handleItemClick(device, "device")}
                        />
                      ))}
                    </CategorySection>
                  </CollapsibleSection>
                );
              })}
              <div style={{ padding: '8px 0 0 0' }}>
                <AddItemButton
                  onClick={() => {
                    setSelectedDeviceType("ROUTER");
                    setShowAddDeviceModal(true);
                  }}
                  label="+ Добавить устройство"
                  size="normal"
                  fullWidth
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="КАБЕЛИ" icon="🔌" defaultExpanded={false}>
              {Object.values(CableTypes).map((cableType) => {
                let cables = catalogStore.groupedCables[cableType];
                if (searchQuery) {
                  cables = cables?.filter(c => 
                    c.name.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                }
                if (!cables || cables.length === 0) return null;
                return (
                  <CollapsibleSection 
                    key={cableType} 
                    title={cableTypeLabels[cableType]} 
                    icon="📁" 
                    nested={true}
                    defaultExpanded={false}
                  >
                    <CategorySection title={cableTypeLabels[cableType]} icon={"📁"}>
                      {cables.map((cable) => (
                        <ItemCard
                          key={cable.id}
                          id={cable.id}
                          name={cable.name}
                          icon={cable.icon || "🔌"}
                          stats={`${cable.maxLengthM}м`}
                          isCustom={cable.isCustom}
                          isSelected={editorStore.selectedNodeId === cable.id}
                          tooltipInfo={{
                            title: cable.name,
                            rows: [
                              { label: 'Тип', value: cable.type },
                              { label: 'Макс. длина', value: `${cable.maxLengthM} м` },
                              { label: 'Затухание', value: `${cable.attenuationDbPerKm} дБ/км` },
                              { label: 'Цена', value: `${cable.pricePerMeter} ₽/м` },
                              { label: 'Помехоустойчивость', value: `${cable.immunityRating || 5}/10` },
                              { label: 'Раб. температура', value: `${cable.temperatureRating || 60}°C` },
                            ],
                          }}
                          onClick={() => handleItemClick(cable, "cable")}
                        />
                      ))}
                    </CategorySection>
                  </CollapsibleSection>
                );
              })}
              <div style={{ padding: '8px 0 0 0' }}>
                <AddItemButton
                  onClick={() => setShowAddCableModal(true)}
                  label="+ Добавить кабель"
                  size="normal"
                  fullWidth
                />
              </div>
            </CollapsibleSection>
          </>
        )}

        {/* Вкладка ФАКТОРЫ */}
        {activeTab === "factors" && (
          <>
            {factorTypeConfig.map(({ type, icon, label }) => {
              const factors = filterFactors(catalogStore.groupedFactors[type as FactorTypes] || []);
              if (factors.length === 0) {
                return (
                  <CollapsibleSection
                    key={type}
                    title={label}
                    icon={icon}
                    nested={false}
                    defaultExpanded={false}
                  >
                    <div style={{ padding: "16px", textAlign: "center", color: "#999", fontSize: "12px" }}>
                      Нет факторов типа {label.toLowerCase()}
                    </div>
                  </CollapsibleSection>
                );
              }
              return (
                <CollapsibleSection
                  key={type}
                  title={label}
                  icon={icon}
                  nested={false}
                  defaultExpanded={false}
                >
                  <CategorySection title={label} icon={icon}>
                    {factors.map((factor) => (
                      <ItemCard
                        key={factor.id}
                        id={factor.id}
                        name={factor.name}
                        icon={factor.icon || icon}
                        badge={factor.factorType}
                        isCustom={factor.isCustom}
                        isSelected={editorStore.selectedNodeId === factor.id}
                        tooltipInfo={{
                          title: factor.name,
                          rows: [
                            { label: 'Тип', value: factor.factorType },
                            { label: 'Интенсивность', value: `${factor.factorValue} ${getFactorUnit(factor.factorType)}` },
                            { label: 'Радиус влияния', value: `${factor.factorRadius || 10} м` },
                          ],
                        }}
                        onClick={() => handleItemClick(factor, "factor")}
                      />
                    ))}
                  </CategorySection>
                </CollapsibleSection>
              );
            })}
            <div style={{ padding: '8px 0 0 0' }}>
              <AddItemButton
                onClick={() => {
                  setSelectedFactorType("TEMPERATURE");
                  setShowAddFactorModal(true);
                }}
                label="+ Добавить фактор"
                size="normal"
                fullWidth
              />
            </div>
          </>
        )}

        {/* Вкладка ПРОВОДНИК */}
        {activeTab === "explorer" && (
          <>
            <CollapsibleSection title="УСТРОЙСТВА" icon="🖥️" defaultExpanded={false}>
              <CategorySection title="УСТРОЙСТВА" icon="🖥️">
                {editorStore.nodes
                  .filter(node => node.type === EditorNodes.DEVICE)
                  .map((node) => (
                    <ItemCard
                      key={node.id}
                      id={node.id}
                      name={node.customName || node.name}
                      icon={node.icon || "🖥️"}
                      description={`ID: ${node.id.slice(0, 8)}...`}
                      badge="Устройство"
                      isSelected={editorStore.selectedNodeId === node.id}
                      onClick={() => editorStore.selectNode(node.id)}
                    />
                  ))}
                {editorStore.nodes.filter(n => n.type === EditorNodes.DEVICE).length === 0 && (
                  <div style={{ padding: "16px", textAlign: "center", color: "#999", fontSize: "12px" }}>
                    Нет устройств
                  </div>
                )}
              </CategorySection>
            </CollapsibleSection>

            <CollapsibleSection title="КАБЕЛИ" icon="🔌" defaultExpanded={false}>
              <CategorySection title="КАБЕЛИ" icon="🔌">
                {editorStore.nodes
                  .filter(node => node.type === EditorNodes.CABLE)
                  .map((cable) => (
                    <ItemCard
                      key={cable.id}
                      id={cable.id}
                      name={cable.customName || cable.name}
                      icon={cable.icon || "🔌"}
                      description={`Тип: ${cable.cableType || "Ethernet"}, Длина: ${cable.lengthM || 10}м`}
                      badge="Кабель"
                      isSelected={editorStore.selectedNodeId === cable.id}
                      onClick={() => editorStore.selectNode(cable.id)}
                    />
                  ))}
                {editorStore.nodes.filter(n => n.type === EditorNodes.CABLE).length === 0 && (
                  <div style={{ padding: "16px", textAlign: "center", color: "#999", fontSize: "12px" }}>
                    Нет кабелей
                  </div>
                )}
              </CategorySection>
            </CollapsibleSection>

            <CollapsibleSection title="ФАКТОРЫ" icon="🌡️" defaultExpanded={false}>
              <CategorySection title="ФАКТОРЫ" icon="🌡️">
                {editorStore.nodes
                  .filter(node => node.type === EditorNodes.FACTOR)
                  .map((factor) => (
                    <ItemCard
                      key={factor.id}
                      id={factor.id}
                      name={factor.customName || factor.name || "Фактор"}
                      icon={factor.icon || getFactorIcon(factor.factorType || "TEMPERATURE")}
                      description={`Тип: ${factor.factorType || "Неизвестно"}, Значение: ${factor.factorValue || 0}`}
                      badge="Фактор"
                      isSelected={editorStore.selectedNodeId === factor.id}
                      onClick={() => editorStore.selectNode(factor.id)}
                    />
                  ))}
                {editorStore.nodes.filter(n => n.type === EditorNodes.FACTOR).length === 0 && (
                  <div style={{ padding: "16px", textAlign: "center", color: "#999", fontSize: "12px" }}>
                    Нет факторов
                  </div>
                )}
              </CategorySection>
            </CollapsibleSection>

            <CollapsibleSection title="СВЯЗИ" icon="🔗" defaultExpanded={false}>
              <CategorySection title="СВЯЗИ" icon="🔗">
                {editorStore.edges.map((edge) => {
                  const sourceNode = editorStore.getNodeById(edge.sourceNodeId);
                  const targetNode = editorStore.getNodeById(edge.targetNodeId);
                  return (
                    <ItemCard
                      key={edge.id}
                      id={edge.id}
                      name={`${sourceNode?.customName || sourceNode?.name} → ${targetNode?.customName || targetNode?.name}`}
                      icon="🔗"
                      description={`Длина: ${edge.lengthM}м`}
                      badge="Связь"
                      isSelected={editorStore.selectedEdgeId === edge.id}
                      onClick={() => editorStore.selectEdge(edge.id)}
                    />
                  );
                })}
                {editorStore.edges.length === 0 && (
                  <div style={{ padding: "16px", textAlign: "center", color: "#999", fontSize: "12px" }}>
                    Нет связей
                  </div>
                )}
              </CategorySection>
            </CollapsibleSection>
          </>
        )}
      </TabContent>

      <AddDeviceModal
        isOpen={showAddDeviceModal}
        onClose={() => setShowAddDeviceModal(false)}
        onAdd={handleAddDevice}
        defaultType={selectedDeviceType}
      />

      <AddCableModal
        isOpen={showAddCableModal}
        onClose={() => setShowAddCableModal(false)}
        onAdd={handleAddCable}
      />

      <AddFactorModal
        isOpen={showAddFactorModal}
        onClose={() => setShowAddFactorModal(false)}
        onAdd={handleAddFactor}
        defaultType={selectedFactorType}
      />
    </LeftPanelContainer>
  );
});

export default LeftPanel;
