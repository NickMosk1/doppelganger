import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
  LeftPanelContainer,
  PanelTab,
  TabHeader,
  TabContent,
  SearchContainer,
  CategorySection,
} from "./LeftPanel.styles";
import { useStores } from "../../../../hooks";
import { cableTypeLabels, CableTypes, DeviceCategories, deviceCategoryLabels, EditorNodes } from "../../../types";
import { Input } from "../../Input";
import { AddDeviceModal, AddCableModal } from "../../../ui";
import { CollapsibleSection, ItemCard, AddItemButton } from "./components";
import CatalogService from "../../../../services/catalog.service";

const catalogService = new CatalogService();

type TabType = "catalog" | "explorer";

export const LeftPanel: React.FC = observer(() => {
  const { catalogStore, editorStore } = useStores();
  const [activeTab, setActiveTab] = useState<TabType>("catalog");
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [showAddCableModal, setShowAddCableModal] = useState(false);

  // Загрузка данных каталога
  useEffect(() => {
    const loadCatalog = async () => {
      catalogStore.setLoading(true);
      try {
        const [devices, cables, publicSchemas] = await Promise.all([
          catalogService.getDevices(),
          catalogService.getCables(),
          catalogService.getPublicSchemas(),
        ]);
        catalogStore.setDevices(devices);
        catalogStore.setCables(cables);
        catalogStore.setPublicSchemas(publicSchemas);
      } catch (error) {
        console.error("Failed to load catalog:", error);
      } finally {
        catalogStore.setLoading(false);
      }
    };
    loadCatalog();
  }, []);

  // Добавление устройства через сервис
  const handleAddDevice = async (device: any) => {
    try {
      const newDevice = await catalogService.addDevice(device);
      catalogStore.addDeviceSync(newDevice);
    } catch (error) {
      console.error("Failed to add device:", error);
    }
  };

  // Добавление кабеля через сервис
  const handleAddCable = async (cable: any) => {
    try {
      const newCable = await catalogService.addCable(cable);
      catalogStore.addCableSync(newCable);
    } catch (error) {
      console.error("Failed to add cable:", error);
    }
  };

  const handleItemClick = (item: any, type: string) => {
    // Определяем тип узла
    let nodeType: EditorNodes;
    switch (type) {
      case "device":
        nodeType = EditorNodes.DEVICE;
        break;
      case "subschema":
        nodeType = EditorNodes.SUBSCHEMA;
        break;
      default:
        nodeType = EditorNodes.DEVICE;
    }

    const newNode = {
      id: `${type}-${Date.now()}`,
      type: nodeType,
      deviceId: item.id,
      name: item.name,
      customName: item.name,
      position: { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 },
      baseLatencyMs: item.baseLatencyMs || 1,
      maxThroughputMbps: item.maxThroughputMbps || 100,
      icon: item.icon,
      isEnabled: true,
      temperatureOffset: 0,
      emiOffset: 0,
      vibrationOffset: 0,
      dustOffset: 0,
    };
    editorStore.addNode(newNode);
  };

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

      <SearchContainer>
        <Input
          placeholder="Поиск элемента..."
          value={catalogStore.searchQuery}
          onChange={(e) => catalogStore.setSearchQuery(e.target.value)}
          fullWidth
        />
      </SearchContainer>

      <TabContent>
        {activeTab === "catalog" && (
          <>
            {/* Устройства */}
            <CollapsibleSection title="УСТРОЙСТВА" icon="🖥️" defaultExpanded={true}>
              {Object.values(DeviceCategories).map((category) => {
                const devices = catalogStore.groupedDevices[category];
                if (!devices || devices.length === 0) return null;
                return (
                  <CollapsibleSection 
                    key={category} 
                    title={deviceCategoryLabels[category]} 
                    icon="📁" 
                    defaultExpanded={false}
                  >
                    <CategorySection>
                      {devices.map((device) => (
                        <ItemCard
                          key={device.id}
                          id={device.id}
                          name={device.name}
                          icon={device.icon}
                          description={device.description}
                          badge={device.manufacturer}
                          isCustom={device.isCustom}
                          onClick={() => handleItemClick(device, "device")}
                        />
                      ))}
                      <AddItemButton onClick={() => setShowAddDeviceModal(true)} label="Добавить" />
                    </CategorySection>
                  </CollapsibleSection>
                );
              })}
            </CollapsibleSection>

            {/* Кабели */}
            <CollapsibleSection title="КАБЕЛИ" icon="🔌" defaultExpanded={true}>
              {Object.values(CableTypes).map((cableType) => {
                const cables = catalogStore.groupedCables[cableType];
                if (!cables || cables.length === 0) return null;
                return (
                  <CollapsibleSection 
                    key={cableType} 
                    title={cableTypeLabels[cableType]} 
                    icon="📁" 
                    defaultExpanded={false}
                  >
                    <CategorySection>
                      {cables.map((cable) => (
                        <ItemCard
                          key={cable.id}
                          id={cable.id}
                          name={cable.name}
                          icon={cable.icon}
                          description={`До ${cable.maxLengthM}м, ${cable.pricePerMeter}₽/м`}
                          stats={`${cable.maxLengthM}м`}
                          isCustom={cable.isCustom}
                          onClick={() => handleItemClick(cable, "cable")}
                        />
                      ))}
                      <AddItemButton onClick={() => setShowAddCableModal(true)} label="Добавить" />
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
              </CategorySection>
            </CollapsibleSection>

            <CollapsibleSection title="СВЯЗИ" icon="🔗" defaultExpanded={true}>
              <CategorySection>
                {editorStore.edges.map((edge) => {
                  const sourceNode = editorStore.getNodeById(edge.source);
                  const targetNode = editorStore.getNodeById(edge.target);
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
              </CategorySection>
            </CollapsibleSection>
          </>
        )}
      </TabContent>

      <AddDeviceModal
        isOpen={showAddDeviceModal}
        onClose={() => setShowAddDeviceModal(false)}
        onAdd={handleAddDevice}
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
