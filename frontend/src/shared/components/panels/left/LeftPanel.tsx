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
import { cableTypeLabels, CableTypes, EditorNodes, NodeStatus, PortType } from "../../../types";
import { generateDefaultPorts, getDeviceIcon } from "../../Canvas/utils";
import { AddCableModal, AddDeviceModal } from "../../../ui";
import { useResizePanel } from "./hooks/useResizePanel";
import CatalogService from "../../../../services/catalog.service";
import { useStores } from "../../../../hooks";

const catalogService = new CatalogService();

type TabType = "catalog" | "explorer";

const deviceTypeConfig = [
  { type: "ROUTER", icon: "🌐", label: "Маршрутизаторы" },
  { type: "SWITCH", icon: "🔌", label: "Коммутаторы" },
  { type: "PLC", icon: "⚙️", label: "ПЛК" },
  { type: "SERVER", icon: "🖥️", label: "Серверы" },
  { type: "FIREWALL", icon: "🛡️", label: "Фаерволы" },
  { type: "WORKSTATION", icon: "💻", label: "Рабочие станции" },
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
  const { catalogStore, editorStore, draftStore } = useStores();
  const { width, isResizing, startResize } = useResizePanel(280, 200, 450);
  const [activeTab, setActiveTab] = useState<TabType>("catalog");
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [showAddCableModal, setShowAddCableModal] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>("ROUTER");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const resizeHandleRef = useRef<HTMLDivElement>(null);

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
      
      // Не нужно явно обновлять черновик здесь,
      // потому что добавление узла в editorStore вызовет reaction в DraftStore
      // который автоматически отметит hasUnsavedChanges = true
      
    } catch (error) {
      console.error("Failed to add device:", error);
    }
  };

  const handleAddCable = async (cable: any) => {
    try {
      const newCable = await catalogService.addCable(cable);
      catalogStore.addCableSync(newCable);
      
      // Аналогично - черновик обновится автоматически через реакции
    } catch (error) {
      console.error("Failed to add cable:", error);
    }
  };

  const handleItemClick = (item: any, sourceType: "device" | "cable" | "subschema") => {
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
        ports: [
          { id: "left", name: "Left", type: PortType.ETHERNET, isConnected: false },
          { id: "right", name: "Right", type: PortType.ETHERNET, isConnected: false },
        ],
      };
      
      editorStore.addNode(newNode);
      return;
    }

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

  const filterDevices = (devices: any[]) => {
    if (!searchQuery) return devices;
    return devices.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startResize(e);
  }, [startResize]);

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
          Каталог
        </PanelTab>
        <PanelTab active={activeTab === "explorer"} onClick={() => setActiveTab("explorer")}>
          Проводник
        </PanelTab>
      </TabHeader>

      <TabContent>
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

            {/* <CollapsibleSection title="ПУБЛИЧНЫЕ СХЕМЫ" icon="🏪" defaultExpanded={false}>
              <CategorySection title={label} icon={icon}>
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
            </CollapsibleSection> */}
          </>
        )}

        {activeTab === "explorer" && (
          <>
            <CollapsibleSection title="УСТРОЙСТВА" icon="🖥️" defaultExpanded={true}>
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

            <CollapsibleSection title="КАБЕЛИ" icon="🔌" defaultExpanded={true}>
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

            <CollapsibleSection title="СВЯЗИ" icon="🔗" defaultExpanded={true}>
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

            {/* <CollapsibleSection title="ВЛОЖЕННЫЕ СХЕМЫ" icon="📁" defaultExpanded={true}>
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
            </CollapsibleSection> */}
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
