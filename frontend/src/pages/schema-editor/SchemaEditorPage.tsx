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
import CatalogService from "../../services/catalog.service";
import { EditSchemaModal, SimulationModal } from "../../shared/ui";
import { generateDefaultPorts, getDeviceIcon, getFactorIcon } from "../../shared/components/Canvas/utils";

const editorService = new EditorService();
const catalogService = new CatalogService();

const SchemaEditorPage: React.FC = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { editorStore, draftStore, catalogStore, toastStore } = useStores();
  const [schemaName, setSchemaName] = useState("");
  const [schemaDescription, setSchemaDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);

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
                device: {
                  ...node.device,
                  // Копируем все новые поля из device
                  tempCoefficient: node.device.tempCoefficient,
                  emiCoefficient: node.device.emiCoefficient,
                  vibrationCoefficient: node.device.vibrationCoefficient,
                  dustCoefficient: node.device.dustCoefficient,
                  maxOperatingTemp: node.device.maxOperatingTemp,
                  minOperatingTemp: node.device.minOperatingTemp,
                  maxEmiTolerance: node.device.maxEmiTolerance,
                  maxVibrationTolerance: node.device.maxVibrationTolerance,
                  mtbfHours: node.device.mtbfHours,
                  mttrMinutes: node.device.mttrMinutes,
                  warmUpTimeSeconds: node.device.warmUpTimeSeconds,
                  replacementCost: node.device.replacementCost,
                  repairCost: node.device.repairCost,
                  powerConsumptionWatts: node.device.powerConsumptionWatts,
                  heatGenerationWatts: node.device.heatGenerationWatts,
                  ipRating: node.device.ipRating,
                  operatingHumidityMax: node.device.operatingHumidityMax,
                  needsCooling: node.device.needsCooling,
                  hasRedundantPower: node.device.hasRedundantPower,
                },
                ports: generateDefaultPorts(node.device.type, node.device.maxThroughputMbps, node.device.portCount),
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
                // Динамические поля фактора
                changeRatePerSecond: node.factor.changeRatePerSecond,
                minValue: node.factor.minValue,
                maxValue: node.factor.maxValue,
                valueChangePattern: node.factor.valueChangePattern,
                frequencyHz: node.factor.frequencyHz,
                startTimeSeconds: node.factor.startTimeSeconds,
                durationSeconds: node.factor.durationSeconds,
                falloffType: node.factor.falloffType,
                falloffExponent: node.factor.falloffExponent,
                warningThreshold: node.factor.warningThreshold,
                criticalThreshold: node.factor.criticalThreshold,
                failureThreshold: node.factor.failureThreshold,
                priority: node.factor.priority,
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

  const canRunSimulation = () => {
    const hasStartAndEnd = editorStore.startPointId && editorStore.endPointId;
    if (!hasStartAndEnd) return false;
    
    const hasPath = checkPathBetweenNodes(editorStore.startPointId!, editorStore.endPointId!);
    return hasPath;
  };

  const checkPathBetweenNodes = (startId: string, endId: string): boolean => {
    const adjacencyList = new Map<string, string[]>();
    
    editorStore.edges.forEach(edge => {
      if (edge.connectionType === 'CABLE_DEVICE') {
        adjacencyList.set(edge.sourceNodeId, [...(adjacencyList.get(edge.sourceNodeId) || []), edge.targetNodeId]);
        adjacencyList.set(edge.targetNodeId, [...(adjacencyList.get(edge.targetNodeId) || []), edge.sourceNodeId]);
      }
    });

    const queue: string[] = [startId];
    const visited = new Set<string>([startId]);

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === endId) return true;
      
      const neighbors = adjacencyList.get(current) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    return false;
  };

  const handleOpenSimulation = () => {
    if (!canRunSimulation()) {
      alert("Укажите точки старта и финиша, соединённые кабелями");
      return;
    }
    setIsSimulationModalOpen(true);
  };

  const handleSimulationSuccess = () => {
    navigate(`/history/${id}`);
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
          });
          
          // Базовые поля для всех узлов
          const baseNodeData: any = {
            id: node.id,
            type: node.type,
            name: node.name,
            customName: node.customName,
            positionX: node.position.x,
            positionY: node.position.y,
            isEnabled: node.isEnabled,
          };
          
          // Для DEVICE
          if (node.type === EditorNodes.DEVICE) {
            return {
              ...baseNodeData,
              deviceId: node.deviceId,
              // Все новые поля устройства
              baseLatencyMs: node.baseLatencyMs,
              maxThroughputMbps: node.maxThroughputMbps,
              manufacturer: node.manufacturer,
              tempCoefficient: node.tempCoefficient,
              emiCoefficient: node.emiCoefficient,
              vibrationCoefficient: node.vibrationCoefficient,
              dustCoefficient: node.dustCoefficient,
              maxOperatingTemp: node.maxOperatingTemp,
              minOperatingTemp: node.minOperatingTemp,
              maxEmiTolerance: node.maxEmiTolerance,
              maxVibrationTolerance: node.maxVibrationTolerance,
              mtbfHours: node.mtbfHours,
              mttrMinutes: node.mttrMinutes,
              warmUpTimeSeconds: node.warmUpTimeSeconds,
              replacementCost: node.replacementCost,
              repairCost: node.repairCost,
              powerConsumptionWatts: node.powerConsumptionWatts,
              heatGenerationWatts: node.heatGenerationWatts,
              ipRating: node.ipRating,
              operatingHumidityMax: node.operatingHumidityMax,
              needsCooling: node.needsCooling,
              hasRedundantPower: node.hasRedundantPower,
            };
          }
          
          // Для CABLE
          if (node.type === EditorNodes.CABLE) {
            return {
              ...baseNodeData,
              lengthM: node.lengthM,
              cableLengthM: node.cableLengthM,
              cableType: node.cableType,
              bandwidthMbps: node.bandwidthMbps,
              // Новые поля кабеля
              propagationSpeed: node.propagationSpeed,
              bendingRadiusMm: node.bendingRadiusMm,
              tensileStrengthN: node.tensileStrengthN,
              operatingTensionMaxN: node.operatingTensionMaxN,
              impedanceOhms: node.impedanceOhms,
              coreDiameterUm: node.coreDiameterUm,
              capacitancePerKmNf: node.capacitancePerKmNf,
              resistancePerKmOhms: node.resistancePerKmOhms,
              maxFrequencyMhz: node.maxFrequencyMhz,
              signalToNoiseRatioDb: node.signalToNoiseRatioDb,
              immunityRating: node.immunityRating,
              temperatureRating: node.temperatureRating,
              shieldingType: node.shieldingType,
              oilResistance: node.oilResistance,
              uvResistance: node.uvResistance,
              chemicalResistance: node.chemicalResistance,
              expectedLifetimeYears: node.expectedLifetimeYears,
              degradationRatePerYear: node.degradationRatePerYear,
            };
          }
          
          // Для FACTOR
          if (node.type === EditorNodes.FACTOR) {
            return {
              ...baseNodeData,
              factorType: node.factorType,
              factorValue: node.factorValue,
              factorUnit: node.factorUnit,
              factorRadius: node.factorRadius,
              // Динамические поля фактора
              changeRatePerSecond: node.changeRatePerSecond,
              minValue: node.minValue,
              maxValue: node.maxValue,
              valueChangePattern: node.valueChangePattern,
              frequencyHz: node.frequencyHz,
              startTimeSeconds: node.startTimeSeconds,
              durationSeconds: node.durationSeconds,
              falloffType: node.falloffType,
              falloffExponent: node.falloffExponent,
              warningThreshold: node.warningThreshold,
              criticalThreshold: node.criticalThreshold,
              failureThreshold: node.failureThreshold,
              priority: node.priority,
            };
          }
          
          // Для SUBSCHEMA
          if (node.type === EditorNodes.SUBSCHEMA) {
            return {
              ...baseNodeData,
              schemaId: node.schemaId,
            };
          }
          
          return baseNodeData;
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
        await editorService.updateSchema(id!, { name: schemaName, description: schemaDescription });
        nodeIdMap = await editorService.updateFullSchema(id!, schemaData);
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
      
      draftStore.markAsSaved(schemaId ?? "");
      toastStore.showSuccess("Схема успешно сохранена!");
    } catch (error) {
      console.error("Failed to save schema:", error);
      toastStore.showError("Ошибка при сохранении схемы");
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
          <Button variant="outline" onClick={handleOpenSimulation} disabled={!editorStore.hasStartAndEndPoints}>Симуляция</Button>
          <Button variant="outline" onClick={() => navigate(`/history/${id}`)}>История</Button>
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

      <SimulationModal
        isOpen={isSimulationModalOpen}
        onClose={() => setIsSimulationModalOpen(false)}
        onSuccess={handleSimulationSuccess}
      />
    </EditorContainer>
  );
});

export default SchemaEditorPage;
