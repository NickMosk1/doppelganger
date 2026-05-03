import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useStores } from "../../hooks/useStores";
import {
  EditorContainer,
  HeaderActions,
  SchemaName,
  ActionButtons,
  MainContent,
} from "./SchemaEditorPage.styles";
import EditorService from "../../services/editor.service";
import { Button, LeftPanel, NetworkCanvas } from "../../shared";

const editorService = new EditorService();

const SchemaEditorPage: React.FC = observer(() => {
  const { id } = useParams<{ id: string }>();
  const { editorStore, catalogStore } = useStores();
  const [schemaName, setSchemaName] = useState("");
  const [showSimulationDialog, setShowSimulationDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);

  useEffect(() => {
    const loadSchema = async () => {
      if (id && id !== "new") {
        editorStore.setLoading(true);
        try {
          const fullSchema = await editorService.getSchemaFull(id);

          const nodes = fullSchema.nodes.map(node => ({
            id: node.id,
            type: node.nodeType,
            deviceId: node.device?.id,
            name: node.device?.name || node.customName,
            customName: node.customName,
            position: { x: node.positionX, y: node.positionY },
          }));

          const edges = fullSchema.connections.map(conn => ({
            id: conn.id,
            source: conn.sourceNode.id,
            target: conn.targetNode.id,
            cableId: conn.cable.id,
            lengthM: conn.lengthM,
          }));

          editorStore.setNodes(nodes);
          editorStore.setEdges(edges);
          setSchemaName(fullSchema.name);
        } catch (error) {
          console.error("Failed to load schema:", error);
        } finally {
          editorStore.setLoading(false);
        }
      } else {
        editorStore.clearEditor();
        setSchemaName("Новая схема");
      }
    };

    loadSchema();

    // Загружаем каталог
    const loadCatalog = async () => {
      catalogStore.setLoading(true);
      try {
        // TODO: Загрузить устройства, кабели, публичные схемы из API
        // catalogStore.setDevices(devices);
        // catalogStore.setCables(cables);
        // catalogStore.setPublicSchemas(schemas);
      } catch (error) {
        console.error("Failed to load catalog:", error);
      } finally {
        catalogStore.setLoading(false);
      }
    };
    loadCatalog();

    return () => {
      editorStore.clearEditor();
    };
  }, [id]);

  const handleSave = async () => {
    // TODO: Сохранить схему
    console.log("Save schema", editorStore.nodes, editorStore.edges);
  };

  const handleValidate = async () => {
    if (!id || id === "new") return;
    // TODO: Валидация
  };

  const handleRunSimulation = () => {
    setShowSimulationDialog(true);
  };

  const handleShowHistory = () => {
    setShowHistoryDialog(true);
  };

  return (
    <EditorContainer onDragOver={(e) => e.preventDefault()}>
      <HeaderActions>
        <SchemaName>
          <input
            type="text"
            value={schemaName}
            onChange={(e) => setSchemaName(e.target.value)}
            placeholder="Название схемы"
          />
        </SchemaName>
        <ActionButtons>
          <Button variant="outline" onClick={handleValidate}>
            ✓ Валидация
          </Button>
          <Button variant="outline" onClick={handleRunSimulation}>
            ▶ Симуляция
          </Button>
          <Button variant="outline" onClick={handleShowHistory}>
            📊 История
          </Button>
          <Button onClick={handleSave}>💾 Сохранить</Button>
        </ActionButtons>
      </HeaderActions>

      <MainContent>
        <LeftPanel />
        <NetworkCanvas schemaId={id || "new"} />
        {/* <RightPanel /> */}
      </MainContent>

      {/* TODO: Добавить диалоги симуляции и истории */}
    </EditorContainer>
  );
});

export default SchemaEditorPage;
