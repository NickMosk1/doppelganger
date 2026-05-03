import { useState } from "react";
import { observer } from "mobx-react-lite";
import {
  LeftPanelContainer,
  PanelTab,
  TabHeader,
  TabContent,
  SearchContainer,
  CategorySection,
  CategoryTitle,
  ItemsList,
  DragItem,
  ItemIcon,
  ItemName,
  ItemType,
  ItemDescription,
} from "./LeftPanel.styles";
import { useStores } from "../../../../hooks";
import { EditorNodes, Tabs } from "../../../types";
import { Input } from "../../Input";

const LeftPanel: React.FC = observer(() => {
  const { catalogStore, editorStore } = useStores();
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.CATALOG);

  const onDragStart = (event: React.DragEvent, item: any, type: string) => {
    event.dataTransfer.setData("application/json", JSON.stringify({ ...item, type }));
    event.dataTransfer.effectAllowed = "copy";
  };

  return (
    <LeftPanelContainer>
      <TabHeader>
        <PanelTab active={activeTab === Tabs.CATALOG} onClick={() => setActiveTab(Tabs.CATALOG)}>
          📚 Каталог
        </PanelTab>
        <PanelTab active={activeTab === Tabs.EXPLORER} onClick={() => setActiveTab(Tabs.EXPLORER)}>
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
        {activeTab === Tabs.CATALOG && (
          <>
            {/* Устройства */}
            <CategorySection>
              <CategoryTitle>🖥️ Маршрутизаторы</CategoryTitle>
              <ItemsList>
                {catalogStore.groupedDevices.ROUTERS?.map(device => (
                  <DragItem
                    key={device.id}
                    draggable
                    onDragStart={(e: React.DragEvent<Element>) => onDragStart(e, device, "device")}
                  >
                    <ItemIcon>🌐</ItemIcon>
                    <ItemName>{device.name}</ItemName>
                    <ItemType>{device.manufacturer}</ItemType>
                  </DragItem>
                ))}
              </ItemsList>

              <CategoryTitle>🔌 Коммутаторы</CategoryTitle>
              <ItemsList>
                {catalogStore.groupedDevices.SWITCHES?.map(device => (
                  <DragItem
                    key={device.id}
                    draggable
                    onDragStart={(e: React.DragEvent<Element>) => onDragStart(e, device, "device")}
                  >
                    <ItemIcon>🔌</ItemIcon>
                    <ItemName>{device.name}</ItemName>
                    <ItemType>{device.manufacturer}</ItemType>
                  </DragItem>
                ))}
              </ItemsList>

              <CategoryTitle>⚙️ ПЛК</CategoryTitle>
              <ItemsList>
                {catalogStore.groupedDevices.PLCS?.map(device => (
                  <DragItem
                    key={device.id}
                    draggable
                    onDragStart={(e: React.DragEvent<Element>) => onDragStart(e, device, "device")}
                  >
                    <ItemIcon>⚙️</ItemIcon>
                    <ItemName>{device.name}</ItemName>
                    <ItemType>{device.manufacturer}</ItemType>
                  </DragItem>
                ))}
              </ItemsList>

              <CategoryTitle>🖥️ Серверы</CategoryTitle>
              <ItemsList>
                {catalogStore.groupedDevices.SERVERS?.map(device => (
                  <DragItem
                    key={device.id}
                    draggable
                    onDragStart={(e: React.DragEvent<Element>) => onDragStart(e, device, "device")}
                  >
                    <ItemIcon>🖥️</ItemIcon>
                    <ItemName>{device.name}</ItemName>
                    <ItemType>{device.manufacturer}</ItemType>
                  </DragItem>
                ))}
              </ItemsList>
            </CategorySection>

            {/* Кабели */}
            <CategorySection>
              <CategoryTitle>🔌 Медные кабели</CategoryTitle>
              <ItemsList>
                {catalogStore.groupedCables.COPPER?.map(cable => (
                  <DragItem
                    key={cable.id}
                    draggable
                    onDragStart={(e: React.DragEvent<Element>) => onDragStart(e, cable, "cable")}
                  >
                    <ItemIcon>🔌</ItemIcon>
                    <ItemName>{cable.name}</ItemName>
                    <ItemDescription>до {cable.maxLengthM}м, {cable.pricePerMeter}₽/м</ItemDescription>
                  </DragItem>
                ))}
              </ItemsList>

              <CategoryTitle>💡 Оптоволокно</CategoryTitle>
              <ItemsList>
                {catalogStore.groupedCables.FIBER?.map(cable => (
                  <DragItem
                    key={cable.id}
                    draggable
                    onDragStart={(e: React.DragEvent<Element>) => onDragStart(e, cable, "cable")}
                  >
                    <ItemIcon>💡</ItemIcon>
                    <ItemName>{cable.name}</ItemName>
                    <ItemDescription>до {cable.maxLengthM}м, {cable.pricePerMeter}₽/м</ItemDescription>
                  </DragItem>
                ))}
              </ItemsList>

              <CategoryTitle>🛡️ Экранированные</CategoryTitle>
              <ItemsList>
                {catalogStore.groupedCables.SHIELDED?.map(cable => (
                  <DragItem
                    key={cable.id}
                    draggable
                    onDragStart={(e: React.DragEvent<Element>) => onDragStart(e, cable, "cable")}
                  >
                    <ItemIcon>🛡️</ItemIcon>
                    <ItemName>{cable.name}</ItemName>
                    <ItemDescription>до {cable.maxLengthM}м, {cable.pricePerMeter}₽/м</ItemDescription>
                  </DragItem>
                ))}
              </ItemsList>

              <CategoryTitle>🏭 Промышленные</CategoryTitle>
              <ItemsList>
                {catalogStore.groupedCables.INDUSTRIAL?.map(cable => (
                  <DragItem
                    key={cable.id}
                    draggable
                    onDragStart={(e: React.DragEvent<Element>) => onDragStart(e, cable, "cable")}
                  >
                    <ItemIcon>🏭</ItemIcon>
                    <ItemName>{cable.name}</ItemName>
                    <ItemDescription>до {cable.maxLengthM}м, {cable.pricePerMeter}₽/м</ItemDescription>
                  </DragItem>
                ))}
              </ItemsList>
            </CategorySection>

            <CategorySection>
              <CategoryTitle>🏪 Публичные схемы</CategoryTitle>
              <ItemsList>
                {catalogStore.publicSchemas.map(schema => (
                  <DragItem
                    key={schema.id}
                    draggable
                    onDragStart={(e: React.DragEvent<Element>) => onDragStart(e, schema, "subschema")}
                  >
                    <ItemIcon>📁</ItemIcon>
                    <ItemName>{schema.name}</ItemName>
                    <ItemType>{schema.ownerName}</ItemType>
                  </DragItem>
                ))}
              </ItemsList>
            </CategorySection>
          </>
        )}

        {activeTab === Tabs.EXPLORER && (
          <CategorySection>
            <CategoryTitle>📁 Устройства</CategoryTitle>
            <ItemsList>
              {editorStore.nodes
                .filter(node => node.type === EditorNodes.DEVICE)
                .map(node => (
                  <DragItem key={node.id}>
                    <ItemIcon>🖥️</ItemIcon>
                    <ItemName>{node.customName || node.name}</ItemName>
                    <ItemType>Устройство</ItemType>
                  </DragItem>
                ))}
            </ItemsList>

            <CategoryTitle>🔗 Связи</CategoryTitle>
            <ItemsList>
              {editorStore.edges.map(edge => {
                const sourceNode = editorStore.nodes.find(n => n.id === edge.source);
                const targetNode = editorStore.nodes.find(n => n.id === edge.target);
                return (
                  <DragItem key={edge.id}>
                    <ItemIcon>🔗</ItemIcon>
                    <ItemName>{sourceNode?.customName || sourceNode?.name} → {targetNode?.customName || targetNode?.name}</ItemName>
                    <ItemDescription>{edge.lengthM}м</ItemDescription>
                  </DragItem>
                );
              })}
            </ItemsList>

            <CategoryTitle>📁 Вложенные схемы</CategoryTitle>
            <ItemsList>
              {editorStore.nodes
                .filter(node => node.type === EditorNodes.SUBSCHEMA)
                .map(node => (
                  <DragItem key={node.id}>
                    <ItemIcon>📁</ItemIcon>
                    <ItemName>{node.customName || node.name}</ItemName>
                    <ItemType>Вложенная схема</ItemType>
                  </DragItem>
                ))}
            </ItemsList>
          </CategorySection>
        )}
      </TabContent>
    </LeftPanelContainer>
  );
});

export default LeftPanel;
