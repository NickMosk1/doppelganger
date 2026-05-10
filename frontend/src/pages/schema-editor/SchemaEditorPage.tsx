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
import { Button, EditorNodes, LeftPanel, NetworkCanvas, NodeStatus, RightPanel } from "../../shared";
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
        // Новая схема - создаем черновик
        const newId = `draft-${Date.now()}`;
        draftStore.createDraft(newId, "Новая схема", "", [], []);
        draftStore.setCurrentDraft(newId);
        editorStore.setCurrentSchemaId(newId);
        setSchemaName("Новая схема");
        return;
      }

      // Проверяем наличие черновика
      const draft = draftStore.getDraftById(id);
      
      if (draft) {
        // Загружаем из черновика
        editorStore.setNodes(draft.nodes);
        editorStore.setEdges(draft.edges);
        editorStore.setCurrentSchemaId(id);
        setSchemaName(draft.schemaName);
        draftStore.setCurrentDraft(id);
      } else {
        // Загружаем с бэка
        editorStore.setLoading(true);
        try {
          const fullSchema = await editorService.getSchemaFull(id);
          
          console.log("Full schema:", fullSchema);
          console.log("Connections from backend:", fullSchema.connections);
          
          // Конвертируем узлы - исправлено: name всегда будет строкой
          const nodes = fullSchema.nodes.map(node => ({
            id: node.id,
            type: node.nodeType === "DEVICE" ? EditorNodes.DEVICE : 
                  node.nodeType === "CABLE" ? EditorNodes.CABLE : EditorNodes.SUBSCHEMA,
            deviceId: node.device?.id,
            name: node.device?.name || node.customName || node.name || "Устройство",
            customName: node.customName,
            position: { x: node.positionX, y: node.positionY },
            isEnabled: true,
            status: NodeStatus.OPERATIONAL,
            lengthM: node.cableLengthM,
            cableType: node.cableType,
          }));
          
          const edges = fullSchema.connections.map(conn => {
            // Находим реальные ID узлов среди загруженных узлов
            const sourceNode = nodes.find(n => n.id === conn.sourceNode.id);
            const targetNode = nodes.find(n => n.id === conn.targetNode.id);
            
            return {
              id: conn.id,
              sourceNodeId: sourceNode?.id || conn.sourceNode.id,
              targetNodeId: targetNode?.id || conn.targetNode.id,
              source: conn.sourcePortId || "left",
              target: conn.targetPortId || "right",
              lengthM: conn.lengthM,
              isActive: true,
            };
          });
          
          console.log("Converted edges:", edges);
          
          editorStore.setNodes(nodes);
          editorStore.setEdges(edges);
          editorStore.setCurrentSchemaId(id);
          setSchemaName(fullSchema.name);
          
          // Создаем черновик
          draftStore.createDraft(id, fullSchema.name, fullSchema.description, nodes, edges);
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
    setIsSaving(true);
    try {
      // Подготавливаем данные для отправки
      const schemaData = {
        name: schemaName,
        nodes: editorStore.nodes.map(node => ({
          id: node.id,
          type: node.type,
          deviceId: node.deviceId,
          name: node.name,
          customName: node.customName,
          positionX: node.position.x,
          positionY: node.position.y,
          lengthM: node.lengthM,
          cableType: node.cableType,
        })),
        connections: editorStore.edges.map(edge => ({
          sourceNodeId: edge.sourceNodeId,
          targetNodeId: edge.targetNodeId,
          sourcePortId: edge.source,
          targetPortId: edge.target,
          lengthM: edge.lengthM,
        })),
      };
      
      let schemaId = id;
      let nodeIdMap = null;
      
      if (!id || id === "new") {
        const newSchema = await editorService.createSchema(schemaName, "", false);
        schemaId = newSchema.id;
        nodeIdMap = await editorService.updateFullSchema(schemaId, schemaData);
        navigate(`/editor/${schemaId}`, { replace: true });
      } else {
        await editorService.updateSchema(id, { name: schemaName });
        nodeIdMap = await editorService.updateFullSchema(id, schemaData);
      }
      
      // КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: обновляем ID узлов и связей
      if (nodeIdMap) {
        console.log("Node ID mapping from backend:", nodeIdMap);
        
        // 1. Обновляем ID узлов
        const updatedNodes = editorStore.nodes.map(node => ({
          ...node,
          id: nodeIdMap[node.id] || node.id,
        }));
        editorStore.setNodes(updatedNodes);
        
        // 2. Обновляем ID в связях
        const updatedEdges = editorStore.edges.map(edge => ({
          ...edge,
          sourceNodeId: nodeIdMap[edge.sourceNodeId] || edge.sourceNodeId,
          targetNodeId: nodeIdMap[edge.targetNodeId] || edge.targetNodeId,
        }));
        editorStore.setEdges(updatedEdges);
        
        console.log("Updated nodes:", updatedNodes.map(n => ({ oldId: n.id, newId: n.id })));
        console.log("Updated edges:", updatedEdges);
        
        // 3. Обновляем черновик
        draftStore.updateDraft(schemaId ?? "", {
          nodes: updatedNodes,
          edges: updatedEdges,
        });
      }
      
      draftStore.markAsSaved(schemaId ?? "");
      alert("Схема сохранена");
    } catch (error) {
      console.error("Failed to save schema:", error);
      alert("Ошибка при сохранении схемы");
    } finally {
      setIsSaving(false);
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
