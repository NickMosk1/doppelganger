import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useStores } from "../../hooks/useStores";
import {
  EditorContainer,
  HeaderActions,
  SchemaName,
  SchemaNameText,
  ActionButtons,
  MainContent,
  DraftIndicator,
  SavedIndicator,
} from "./SchemaEditorPage.styles";
import { Button, ConnectionType, EditorNodes, LeftPanel, NetworkCanvas, NodeStatus, PortType, RightPanel } from "../../shared";
import EditorService from "../../services/editor.service";
import SimulationService from "../../services/simulation.service";
import CatalogService from "../../services/catalog.service";
import { EditSchemaModal } from "../../shared/ui";
import { generateDefaultPorts, getDeviceIcon, getFactorIcon } from "../../shared/components/Canvas/utils";

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
          
          const nodes = fullSchema.nodes.map(node => {
            const baseNode = {
              id: node.id,
              type: node.nodeType === "DEVICE" ? EditorNodes.DEVICE :
                    node.nodeType === "CABLE" ? EditorNodes.CABLE :
                    node.nodeType === "FACTOR" ? EditorNodes.FACTOR : EditorNodes.SUBSCHEMA,
              name: node.device?.name || node.customName || "Элемент",
              customName: node.customName,
              position: { x: node.positionX, y: node.positionY },
              isEnabled: true,
              status: NodeStatus.OPERATIONAL,
            };
            
            // Для DEVICE
            if (node.nodeType === "DEVICE" && node.device) {
              return {
                ...baseNode,
                deviceId: node.device.id,
                manufacturer: node.device.manufacturer,
                baseLatencyMs: node.device.baseLatencyMs || 0,
                maxThroughputMbps: node.device.maxThroughputMbps || 0,
                device: node.device, // сохраняем оригинальный объект
                ports: generateDefaultPorts(node.device.type),
                icon: getDeviceIcon(node.device.type),
              };
            }
            
            // Для CABLE
            if (node.nodeType === "CABLE") {
              return {
                ...baseNode,
                lengthM: node.cableLengthM || 10,
                cableType: node.cableType,
                bandwidthMbps: node.bandwidthMbps || 1000,
                icon: "🔌",
                ports: [
                  { id: "left", name: "Left", type: PortType.ETHERNET, isConnected: false },
                  { id: "right", name: "Right", type: PortType.ETHERNET, isConnected: false },
                ],
              };
            }
            
            // Для FACTOR
            if (node.nodeType === "FACTOR" && node.factor) {
              return {
                ...baseNode,
                factorType: node.factor.factorType,
                factorValue: node.factor.factorValue,
                factorUnit: node.factor.factorUnit,
                factorRadius: node.factor.factorRadius,
                factor: node.factor,
                icon: getFactorIcon(node.factor.factorType),
              };
            }
            
            // Для SUBSCHEMA
            return {
              ...baseNode,
              schemaId: node.id,
              icon: "📁",
            };
          });
          
          const edges = fullSchema.connections?.map(conn => ({
            id: conn.id,
            sourceNodeId: conn.sourceNode.id,
            targetNodeId: conn.targetNode.id,
            source: conn.sourcePortId || "left",
            target: conn.targetPortId || "right",
            connectionType: conn.connectionType || ConnectionType.CABLE_DEVICE,
            lengthM: conn.lengthM || 10,
            factorData: conn.factorData,
            isActive: true,
          })) || [];
          
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

  const handleOpenEditModal = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (newName: string, newDescription: string) => {
    setSchemaName(newName);
    setSchemaDescription(newDescription);
    
    if (draftStore.currentDraft && id) {
      draftStore.updateDraft(id, {
        schemaName: newName,
        schemaDescription: newDescription,
      });
    }
    
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const schemaData = {
        name: schemaName,
        description: schemaDescription,
        nodes: editorStore.nodes.map(node => {
          console.log("📦 Node being saved:", {
            id: node.id,
            type: node.type,
            name: node.name,
            isFactor: node.type === "FACTOR",
            factorType: node.factorType,
          });
          
          return {
            id: node.id,
            type: node.type,
            deviceId: node.deviceId,
            name: node.name,
            customName: node.customName,
            positionX: node.position.x,
            positionY: node.position.y,
            lengthM: node.lengthM,
            cableType: node.cableType,
            bandwidthMbps: node.bandwidthMbps,
            factorType: node.factorType,
            factorValue: node.factorValue,
            factorUnit: node.factorUnit,
            factorRadius: node.factorRadius,
          };
        }),
        connections: editorStore.edges.map(edge => ({
          sourceNodeId: edge.sourceNodeId,
          targetNodeId: edge.targetNodeId,
          sourcePortId: edge.source,
          targetPortId: edge.target,
          connectionType: edge.connectionType,
          lengthM: edge.lengthM,
          factorData: edge.factorData,
        })),
      };
      
      let schemaId = id;
      let nodeIdMap = null;
      
      if (!id || id === "new" || id.startsWith("draft-")) {
        const newSchema = await editorService.createSchema(schemaName, schemaDescription, false);
        schemaId = newSchema.id;
        nodeIdMap = await editorService.updateFullSchema(schemaId, schemaData);
        navigate(`/editor/${schemaId}`, { replace: true });
      } else {
        await editorService.updateSchema(id, { name: schemaName, description: schemaDescription });
        nodeIdMap = await editorService.updateFullSchema(id, schemaData);
      }
      
      if (nodeIdMap) {
        const updatedNodes = editorStore.nodes.map(node => ({
          ...node,
          id: nodeIdMap[node.id] || node.id,
        }));
        editorStore.setNodes(updatedNodes);
        
        const updatedEdges = editorStore.edges.map(edge => ({
          ...edge,
          sourceNodeId: nodeIdMap[edge.sourceNodeId] || edge.sourceNodeId,
          targetNodeId: nodeIdMap[edge.targetNodeId] || edge.targetNodeId,
        }));
        editorStore.setEdges(updatedEdges);
        
        draftStore.updateDraft(schemaId ?? "", {
          nodes: updatedNodes,
          edges: updatedEdges,
        });
      }
      
      // После успешного сохранения на бэке сбрасываем флаг
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
              {schemaName || "Без названия"}
            </SchemaNameText>
          </SchemaName>
          {draftStore.hasUnsavedChanges ? (
            <DraftIndicator>📝 Черновик</DraftIndicator>
          ) : (
            <SavedIndicator>💾 Сохранено</SavedIndicator>
          )}
          {draftStore.lastValidationTime && draftStore.validationErrors.length === 0 && (
            <DraftIndicator $isValid>
              ✅ Валидация: {new Date(draftStore.lastValidationTime).toLocaleTimeString()}
            </DraftIndicator>
          )}
          {draftStore.lastValidationTime && draftStore.validationErrors.length > 0 && (
            <DraftIndicator style={{ background: "#ef444420", color: "#ef4444", borderColor: "#ef4444" }}>
              ⚠️ {draftStore.validationErrors.length} ошибок
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
