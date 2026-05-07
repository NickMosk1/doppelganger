import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
  LeftPanelContainer,
  PanelTab,
  TabHeader,
  TabContent,
  CategorySection,
} from "./LeftPanel.styles";
import { CollapsibleSection } from "./components/CollapsibleSection/CollapsibleSection";
import { AddItemButton, ItemCard } from "./components";
import CatalogService from "../../../../services/catalog.service";
import { useStores } from "../../../../hooks";
import { cableTypeLabels, CableTypes, EditorNodes, NodeStatus, PortType } from "../../../types";
import { generateDefaultPorts, getDeviceIcon } from "../../Canvas/utils";
import { AddCableModal, AddDeviceModal } from "../../../ui";

const catalogService = new CatalogService();

type TabType = "catalog" | "explorer";

// Конфигурация типов устройств
const deviceTypeConfig = [
  { type: "ROUTER", icon: "🌐", label: "Маршрутизаторы" },
  { type: "SWITCH", icon: "🔌", label: "Коммутаторы" },
  { type: "PLC", icon: "⚙️", label: "ПЛК" },
  { type: "SERVER", icon: "🖥️", label: "Серверы" },
  { type: "FIREWALL", icon: "🛡️", label: "Фаерволы" },
  { type: "WORKSTATION", icon: "💻", label: "Рабочие станции" },
];

// Функция для получения позиции в центре видимой области
const getRandomPosition = () => {
  // Начальная позиция в центре с небольшим случайным смещением
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
  const [activeTab, setActiveTab] = useState<TabType>("catalog");
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [showAddCableModal, setShowAddCableModal] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>("ROUTER");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Загрузка данных каталога
  useEffect(() => {
    const loadCatalog = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [devices, cables, publicSchemas] = await Promise.all([
          catalogService.getDevices(),
          catalogService.getCables(),
          catalogService.getPublicSchemas(),
        ]);
        
        catalogStore.setDevices(devices);
        catalogStore.setCables(cables);
        catalogStore.setPublicSchemas(publicSchemas);
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

  const handleItemClick = (item: any, sourceType: "device" | "cable" | "subschema") => {
    console.log("=== handleItemClick called ===");
    console.log("Item:", item);
    console.log("SourceType:", sourceType);
    
    // Для кабелей - создаем ноду кабеля
    if (sourceType === "cable") {
      const position = getRandomPosition();
      
      const newNode = {
        id: `cable-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        type: EditorNodes.CABLE,
        name: item.name,
        customName: item.name,
        position: position,
        icon: item.icon || "🔌",
        lengthM: item.maxLengthM || 10,
        cableType: item.type,
        isEnabled: true,
        status: NodeStatus.OPERATIONAL,
        // Для кабеля будут порты left и right
        ports: [
          { id: "left", name: "Left", type: PortType.ETHERNET, isConnected: false },
          { id: "right", name: "Right", type: PortType.ETHERNET, isConnected: false },
        ],
      };
      
      console.log("Adding cable node:", newNode);
      editorStore.addNode(newNode);
      return;
    }

    // Для устройств - создаем ноду устройства
    const nodeType = sourceType === "device" ? EditorNodes.DEVICE : EditorNodes.SUBSCHEMA;
    const position = getRandomPosition();
    
    const ports = nodeType === EditorNodes.DEVICE ? generateDefaultPorts(item.type) : undefined;
    const icon = nodeType === EditorNodes.DEVICE ? getDeviceIcon(item.type) : "📁";

    const newNode = {
      id: `device-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type: nodeType,
      deviceId: sourceType === "device" ? item.id : undefined,
      schemaId: sourceType === "subschema" ? item.id : undefined,
      name: item.name,
      customName: item.name,
      position: position,
      baseLatencyMs: item.baseLatencyMs || 1,
      maxThroughputMbps: item.maxThroughputMbps || 100,
      icon: icon,
      ports: ports,
      isEnabled: true,
      status: NodeStatus.OPERATIONAL,
      temperatureOffset: 0,
      emiOffset: 0,
      vibrationOffset: 0,
      dustOffset: 0,
    };
    
    editorStore.addNode(newNode);
  };

  // Фильтрация устройств по поисковому запросу
  const filterDevices = (devices: any[]) => {
    if (!searchQuery) return devices;
    return devices.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Отображение загрузки
  if (isLoading) {
    return (
      <LeftPanelContainer>
        <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
          Загрузка каталога...
        </div>
      </LeftPanelContainer>
    );
  }

  // Отображение ошибки
  if (error) {
    return (
      <LeftPanelContainer>
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
    <LeftPanelContainer>
      <TabHeader>
        <PanelTab active={activeTab === "catalog"} onClick={() => setActiveTab("catalog")}>
          📚 Каталог
        </PanelTab>
        <PanelTab active={activeTab === "explorer"} onClick={() => setActiveTab("explorer")}>
          📁 Проводник
        </PanelTab>
      </TabHeader>

      {/* <SearchContainer>
        <Input
          placeholder="Поиск элемента..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
        />
      </SearchContainer> */}

      <TabContent>
        {activeTab === "catalog" && (
          <>
            {/* Устройства */}
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
                    <CategorySection>
                      {devices.map((device) => (
                        <ItemCard
                          key={device.id}
                          id={device.id}
                          name={device.name}
                          icon={device.icon || icon}
                          description={device.description}
                          badge={device.manufacturer}
                          isCustom={device.isCustom}
                          onClick={() => handleItemClick(device, "device")}
                        />
                      ))}
                      <AddItemButton
                        onClick={() => {
                          setSelectedDeviceType(type);
                          setShowAddDeviceModal(true);
                        }}
                        label="Добавить"
                        size="small"
                      />
                    </CategorySection>
                  </CollapsibleSection>
                );
              })}
            </CollapsibleSection>

            {/* Кабели */}
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
                    <CategorySection>
                      {cables.map((cable) => (
                        <ItemCard
                          key={cable.id}
                          id={cable.id}
                          name={cable.name}
                          icon={cable.icon}
                          description={`${cable.maxLengthM}м, ${cable.pricePerMeter}₽/м`}
                          stats={`${cable.maxLengthM}м`}
                          isCustom={cable.isCustom}
                          onClick={() => handleItemClick(cable, "cable")}
                        />
                      ))}
                      <AddItemButton
                        onClick={() => setShowAddCableModal(true)}
                        label="Добавить"
                        size="small"
                      />
                    </CategorySection>
                  </CollapsibleSection>
                );
              })}
            </CollapsibleSection>

            {/* Публичные схемы */}
            <CollapsibleSection title="ПУБЛИЧНЫЕ СХЕМЫ" icon="🏪" defaultExpanded={false}>
              <CategorySection>
                {catalogStore.publicSchemas.map((schema) => (
                  <ItemCard
                    key={schema.id}
                    id={schema.id}
                    name={schema.name}
                    icon="📁"
                    description={schema.description}
                    badge={schema.ownerName}
                    onClick={() => handleItemClick(schema, "subschema")}
                  />
                ))}
              </CategorySection>
            </CollapsibleSection>
          </>
        )}

        {activeTab === "explorer" && (
          <>
            <CollapsibleSection title="УСТРОЙСТВА" icon="🖥️" defaultExpanded={true}>
              <CategorySection>
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

            <CollapsibleSection title="СВЯЗИ" icon="🔗" defaultExpanded={true}>
              <CategorySection>
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

            <CollapsibleSection title="ВЛОЖЕННЫЕ СХЕМЫ" icon="📁" defaultExpanded={true}>
              <CategorySection>
                {editorStore.nodes
                  .filter(node => node.type === EditorNodes.SUBSCHEMA)
                  .map((node) => (
                    <ItemCard
                      key={node.id}
                      id={node.id}
                      name={node.customName || node.name}
                      icon="📁"
                      description="Вложенная схема"
                      badge="Подсхема"
                      onClick={() => editorStore.selectNode(node.id)}
                    />
                  ))}
                {editorStore.nodes.filter(n => n.type === EditorNodes.SUBSCHEMA).length === 0 && (
                  <div style={{ padding: "16px", textAlign: "center", color: "#999", fontSize: "12px" }}>
                    Нет вложенных схем
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
    </LeftPanelContainer>
  );
});

export default LeftPanel;
