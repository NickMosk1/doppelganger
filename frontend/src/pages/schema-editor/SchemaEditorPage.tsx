import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { debounce } from "lodash";
import { useStores } from "../../hooks/useStores";
import {
  EditorContainer,
  HeaderActions,
  SchemaName,
  SchemaNameText,
  ActionButtons,
  MainContent,
  DraftIndicator,
} from "./SchemaEditorPage.styles";
import { Button, LeftPanel, NetworkCanvas, RightPanel } from "../../shared";
import EditorService from "../../services/editor.service";
import SimulationService from "../../services/simulation.service";
import CatalogService from "../../services/catalog.service";
import { generateDefaultPorts, getDeviceIcon } from "../../shared/components/Canvas/utils";
import { EditSchemaModal } from "../../shared/ui";

const editorService = new EditorService();
const simulationService = new SimulationService();
const catalogService = new CatalogService();

const SchemaEditorPage: React.FC = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { editorStore, draftStore, simulationStore, catalogStore } = useStores();
  const [schemaName, setSchemaName] = useState("");
  const [schemaDescription, setSchemaDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Загрузка каталога
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

  // Загрузка схемы
  useEffect(() => {
    const loadSchema = async () => {
      if (!id || id === "new") {
        const newId = `draft-${Date.now()}`;
        draftStore.createDraft(newId, "Новая схема", "", [], []);
        draftStore.setCurrentDraft(newId);
        editorStore.setCurrentSchemaId(newId);
        setSchemaName("Новая схема");
        setSchemaDescription("");
        return;
      }

      const draft = draftStore.getDraftById(id);
      
      if (draft) {
        editorStore.setNodes(draft.nodes);
        editorStore.setEdges(draft.edges);
        editorStore.setCurrentSchemaId(id);
        setSchemaName(draft.schemaName);
        setSchemaDescription(draft.schemaDescription || "");
        draftStore.setCurrentDraft(id);
      } else {
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
            isEnabled: true,
            temperatureOffset: 0,
            emiOffset: 0,
            vibrationOffset: 0,
            dustOffset: 0,
            ports: node.device ? generateDefaultPorts(node.device.type) : undefined,
            icon: node.device?.type ? getDeviceIcon(node.device.type) : "📡",
          }));

          const edges = fullSchema.connections.map(conn => ({
            id: conn.id,
            source: conn.sourceNode.id,
            target: conn.targetNode.id,
            sourceNodeId: conn.sourceNode.id,
            targetNodeId: conn.targetNode.id,
            cableId: conn.cable?.id,
            lengthM: conn.lengthM,
            isActive: true,
          }));

          editorStore.setNodes(nodes);
          editorStore.setEdges(edges);
          editorStore.setCurrentSchemaId(id);
          setSchemaName(fullSchema.name);
          setSchemaDescription(fullSchema.description || "");

          draftStore.createDraft(id, fullSchema.name, fullSchema.description || "", nodes, edges);
          draftStore.markAsSaved(id);
        } catch (error) {
          console.error("Failed to load schema:", error);
        } finally {
          editorStore.setLoading(false);
        }
      }
    };

    loadSchema();
  }, [id]);

  const autoSaveDraft = useCallback(
    debounce((schemaId: string, name: string, description: string, nodes: any[], edges: any[]) => {
      if (schemaId) {
        console.log("📝 Auto-saving draft:", { nodesCount: nodes.length, edgesCount: edges.length });
        draftStore.updateDraft(schemaId, {
          schemaName: name,
          schemaDescription: description,
          nodes: nodes,
          edges: edges,
        });
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (draftStore.currentDraft && id) {
      autoSaveDraft(id, schemaName, schemaDescription, editorStore.nodes, editorStore.edges);
    }
  }, [editorStore.nodes, editorStore.edges, schemaName, schemaDescription, id, autoSaveDraft]);

  const handleOpenEditModal = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (newName: string, newDescription: string) => {
    setSchemaName(newName);
    setSchemaDescription(newDescription);
    
    // Сохраняем в черновик
    if (draftStore.currentDraft && id) {
      draftStore.updateDraft(id, {
        schemaName: newName,
        schemaDescription: newDescription,
      });
    }
    
    // Если схема уже сохранена на бэке, обновляем её
    if (id && id !== "new" && !id.startsWith("draft-")) {
      try {
        await editorService.updateSchema(id, {
          name: newName,
          description: newDescription
        });
        console.log("✅ Schema updated on backend");
      } catch (error) {
        console.error("Failed to update schema on backend:", error);
      }
    }
  };

  const handleValidate = async () => {
    if (!id || id === "new") {
      alert("Сначала сохраните схему");
      return;
    }
    
    try {
      const result = await editorService.validateSchema(id);
      draftStore.setValidationResult(id, result.errors || []);
      if (result.errors?.length > 0) {
        alert(`Найдено ${result.errors.length} проблем:\n${result.errors.map((e: any) => e.message).join("\n")}`);
      } else {
        alert("Схема валидна!");
      }
    } catch (error) {
      console.error("Validation failed:", error);
      alert("Ошибка при валидации");
    }
  };

  const handleRunSimulation = async () => {
    if (!id || id === "new") {
      alert("Сначала сохраните схему");
      return;
    }
    
    simulationStore.setRunning(true);
    try {
      const result = await simulationService.runSimulation(id, {
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
      simulationStore.setRunning(false);
    }
  };

  const handleShowHistory = async () => {
    if (!id || id === "new") {
      alert("Сначала сохраните схему");
      return;
    }
    
    try {
      const history = await simulationService.getSimulationHistory(id);
      if (history.length === 0) {
        alert("История симуляций пуста");
      } else {
        const historyText = history.map(h => 
          `${new Date(h.startedAt).toLocaleString()} - ${h.name}: ${h.grade} (${h.score}%)`
        ).join("\n");
        alert(`История симуляций:\n${historyText}`);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
      alert("Ошибка при загрузке истории");
    }
  };

  const nodesLengthRef = useRef(editorStore.nodes.length);
  const edgesLengthRef = useRef(editorStore.edges.length);

  const saveDraftToLocalStorage = useCallback(() => {
    if (draftStore.currentDraft && id) {
      draftStore.updateDraft(id, {
        schemaName: schemaName,
        schemaDescription: schemaDescription,
        nodes: JSON.parse(JSON.stringify(editorStore.nodes)),
        edges: JSON.parse(JSON.stringify(editorStore.edges)),
      });
    }
  }, [id, schemaName, schemaDescription, editorStore.nodes, editorStore.edges, draftStore]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentNodesLength = editorStore.nodes.length;
      const currentEdgesLength = editorStore.edges.length;
      
      if (currentNodesLength !== nodesLengthRef.current || 
          currentEdgesLength !== edgesLengthRef.current) {
        console.log("🔄 Changes detected via interval");
        nodesLengthRef.current = currentNodesLength;
        edgesLengthRef.current = currentEdgesLength;
        saveDraftToLocalStorage();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [editorStore.nodes.length, editorStore.edges.length, saveDraftToLocalStorage]);

  const handleSave = async () => {
    console.log("=== HANDLE SAVE CALLED ===");
    
    if (!id || id === "new") {
      setIsSaving(true);
      try {
        const newSchema = await editorService.createSchema(schemaName, schemaDescription, false);
        
        for (const node of editorStore.nodes) {
          if (node.type === "DEVICE" && node.deviceId) {
            await editorService.createNode(newSchema.id, node.deviceId, node.position, node.customName);
          }
        }
        
        for (const edge of editorStore.edges) {
          await editorService.createConnection(newSchema.id, edge.sourceNodeId, edge.targetNodeId, edge.lengthM);
        }
        
        draftStore.markAsSaved(newSchema.id);
        draftStore.clearDraft(id as any);
        editorStore.setCurrentSchemaId(newSchema.id);
        navigate(`/editor/${newSchema.id}`, { replace: true });
      } catch (error) {
        console.error("Failed to save schema:", error);
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsSaving(true);
      try {
        await editorService.updateSchema(id, { name: schemaName, description: schemaDescription });
        draftStore.markAsSaved(id);
        alert("Схема сохранена!");
      } catch (error) {
        console.error("Failed to save schema:", error);
        alert("Ошибка при сохранении");
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <EditorContainer onDragOver={(e) => e.preventDefault()}>
      <HeaderActions>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <SchemaName>
            <SchemaNameText onClick={handleOpenEditModal}>
              {schemaName}
            </SchemaNameText>
          </SchemaName>
          {draftStore.hasLocalChanges && (
            <DraftIndicator>Черновик</DraftIndicator>
          )}
          {draftStore.lastValidationTime && draftStore.validationErrors.length === 0 && (
            <DraftIndicator $isValid>
              Валидация: {new Date(draftStore.lastValidationTime).toLocaleTimeString()}
            </DraftIndicator>
          )}
          {draftStore.lastValidationTime && draftStore.validationErrors.length > 0 && (
            <DraftIndicator style={{ background: "#ef444420", color: "#ef4444", borderColor: "#ef4444" }}>
              {draftStore.validationErrors.length} ошибок
            </DraftIndicator>
          )}
        </div>
        <ActionButtons>
          <Button variant="outline" onClick={handleValidate}>Валидация</Button>
          <Button variant="outline" onClick={handleRunSimulation} disabled={simulationStore.isRunning}>
            {simulationStore.isRunning ? "Симуляция..." : "Симуляция"}
          </Button>
          <Button variant="outline" onClick={handleShowHistory}>История</Button>
          <Button onClick={handleSave} loading={isSaving}>Сохранить</Button>
        </ActionButtons>
      </HeaderActions>

      <MainContent>
        <LeftPanel />
        <NetworkCanvas schemaId={id || "new"} />
        <RightPanel />
      </MainContent>

      <EditSchemaModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        initialName={schemaName}
        initialDescription={schemaDescription}
      />
    </EditorContainer>
  );
});

export default SchemaEditorPage;
