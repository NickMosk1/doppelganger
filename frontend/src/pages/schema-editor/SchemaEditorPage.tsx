import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { debounce } from "lodash";
import { useStores } from "../../hooks/useStores";
import {
  EditorContainer,
  HeaderActions,
  SchemaName,
  ActionButtons,
  MainContent,
  DraftIndicator,
} from "./SchemaEditorPage.styles";
import { Button, LeftPanel, NetworkCanvas, RightPanel } from "../../shared";
import EditorService from "../../services/editor.service";
import SimulationService from "../../services/simulation.service";
import CatalogService from "../../services/catalog.service";
import { generateDefaultPorts, getDeviceIcon } from "../../shared/components/Canvas/utils";

const editorService = new EditorService();
const simulationService = new SimulationService();
const catalogService = new CatalogService();

export const SchemaEditorPage: React.FC = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { editorStore, draftStore, simulationStore, catalogStore } = useStores();
  const [schemaName, setSchemaName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
useEffect(() => {
    const loadSchema = async () => {
      if (!id || id === "new") {
        // Новая схема - создаем черновик
        const newId = `draft-${Date.now()}`;
        draftStore.createDraft(newId, "Новая схема", [], []);
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
          
          // Конвертируем узлы с портами
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
            // Генерируем порты для устройств
            ports: node.device ? generateDefaultPorts(node.device.type) : undefined,
            icon: node.device?.type ? getDeviceIcon(node.device.type) : "📡",
          }));

          // Конвертируем связи с новыми полями
          const edges = fullSchema.connections.map(conn => ({
            id: conn.id,
            source: conn.sourceNode.id,      // ID порта источника
            target: conn.targetNode.id,      // ID порта назначения
            sourceNodeId: conn.sourceNode.id, // ID узла-источника (добавляем)
            targetNodeId: conn.targetNode.id, // ID узла-назначения (добавляем)
            cableId: conn.cable?.id,
            lengthM: conn.lengthM,
            isActive: true,
          }));

          editorStore.setNodes(nodes);
          editorStore.setEdges(edges);
          editorStore.setCurrentSchemaId(id);
          setSchemaName(fullSchema.name);

          // Создаем черновик
          draftStore.createDraft(id, fullSchema.name, nodes, edges);
          draftStore.markAsSaved(id);
        } catch (error) {
          console.error("Failed to load schema:", error);
        } finally {
          editorStore.setLoading(false);
        }
      }
    };

    loadSchema();

    return () => {
      // Не очищаем editorStore при размонтировании, чтобы сохранить черновик
    };
  }, [id]);

  // Автосохранение черновика при изменениях (debounced)
  const autoSaveDraft = useCallback(
    debounce((schemaId: string, name: string, nodes: any[], edges: any[]) => {
      if (schemaId) {
        draftStore.updateDraft(schemaId, {
          schemaName: name,
          nodes: nodes,
          edges: edges,
        });
        console.log("Draft auto-saved");
      }
    }, 1000),
    []
  );

  // Следим за изменениями и автосохраняем
  useEffect(() => {
    if (draftStore.currentDraft && id) {
      autoSaveDraft(id, schemaName, editorStore.nodes, editorStore.edges);
    }
  }, [editorStore.nodes, editorStore.edges, schemaName, id]);

  const handleSave = async () => {
    if (!id || id === "new") {
      // Создаем новую схему на бэке
      setIsSaving(true);
      try {
        const newSchema = await editorService.createSchema(
          schemaName,
          "",
          false
        );
        
        // Сохраняем узлы и связи
        for (const node of editorStore.nodes) {
          if (node.type === "DEVICE" && node.deviceId) {
            await editorService.createNode(newSchema.id, node.deviceId, node.position, node.customName);
          }
        }
        
        for (const edge of editorStore.edges) {
          await editorService.createConnection(newSchema.id, edge.source, edge.target, edge.cableId || "", edge.lengthM);
        }
        
        draftStore.markAsSaved(newSchema.id);
        draftStore.clearDraft(id ?? "");
        editorStore.setCurrentSchemaId(newSchema.id);
        navigate(`/editor/${newSchema.id}`, { replace: true });
      } catch (error) {
        console.error("Failed to save schema:", error);
        alert("Ошибка при сохранении схемы");
      } finally {
        setIsSaving(false);
      }
    } else {
      // Обновляем существующую схему
      setIsSaving(true);
      try {
        await editorService.updateSchema(id, { name: schemaName });
        // TODO: Обновить узлы и связи (опционально)
        draftStore.markAsSaved(id);
        alert("Схема сохранена");
      } catch (error) {
        console.error("Failed to save schema:", error);
        alert("Ошибка при сохранении схемы");
      } finally {
        setIsSaving(false);
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
      
      // Показываем результат
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

  return (
    <EditorContainer onDragOver={(e) => e.preventDefault()}>
      <HeaderActions>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <SchemaName>
            <input
              type="text"
              value={schemaName}
              onChange={(e) => setSchemaName(e.target.value)}
              placeholder="Название схемы"
            />
          </SchemaName>
          {draftStore.hasLocalChanges && (
            <DraftIndicator>
              📝 Черновик
            </DraftIndicator>
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
          <Button variant="outline" onClick={handleValidate}>
            ✓ Валидация
          </Button>
          <Button variant="outline" onClick={handleRunSimulation} disabled={simulationStore.isRunning}>
            {simulationStore.isRunning ? "⏳ Симуляция..." : "▶ Симуляция"}
          </Button>
          <Button variant="outline" onClick={handleShowHistory}>
            📊 История
          </Button>
          <Button onClick={handleSave} loading={isSaving}>
            💾 Сохранить
          </Button>
        </ActionButtons>
      </HeaderActions>

      <MainContent>
        <LeftPanel />
        <NetworkCanvas schemaId={id || "new"} />
        <RightPanel />
      </MainContent>
    </EditorContainer>
  );
});

export default SchemaEditorPage;
