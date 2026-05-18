import { useState, useCallback, useRef, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { 
  RightPanelContainer, 
  ResizeHandle, 
  PanelHeader, 
  PanelTitle, 
  PanelContent, 
  ButtonGroup,
  EditModeButton,
  ViewModeButton,
  DeleteButton,
  Tabs,
  Tab,
} from "./RightPanel.styles";
import { useResizePanel } from "./hooks/useResizePanel";
import { DeviceView, CableView, EdgeView, SubSchemaView, EmptyView, FactorView } from "./components/ViewMode";
import { DeviceEdit, CableEdit, EdgeEdit, SubSchemaEdit, FactorEdit } from "./components/EditMode";
// import { FactorsTab } from "./components";
import { ConnectionType, EditorNodes } from "../../../types";
import { useStores } from "../../../../hooks";
import { Dialog } from "../../Dialog";

type TabType = "properties" | "factors" | "simulation";
type ModeType = "view" | "edit";

const RightPanel: React.FC = observer(() => {
  const { editorStore, draftStore } = useStores();
  const { width, startResize } = useResizePanel();
  const [activeTab, setActiveTab] = useState<TabType>("properties");
  const [mode, setMode] = useState<ModeType>("view");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingNodeChange, setPendingNodeChange] = useState<string | null>(null);
  const [pendingEdgeChange, setPendingEdgeChange] = useState<string | null>(null);
  
  const isSwitchingRef = useRef(false);
  const prevSelectedNodeIdRef = useRef<string | null>(null);
  const prevSelectedEdgeIdRef = useRef<string | null>(null);

  const selectedNode = editorStore.selectedNode;
  const selectedEdge = editorStore.selectedEdge;
  const hasSelection = selectedNode || selectedEdge;

  useEffect(() => {
    if (isSwitchingRef.current) {
      return;
    }
    
    const currentNodeId = selectedNode?.id || null;
    const currentEdgeId = selectedEdge?.id || null;
    
    const prevNodeId = prevSelectedNodeIdRef.current;
    const prevEdgeId = prevSelectedEdgeIdRef.current;
    
    if (mode === "edit" && (currentNodeId !== prevNodeId || currentEdgeId !== prevEdgeId)) {
      if (pendingChanges) {
        isSwitchingRef.current = true;
        setPendingNodeChange(currentNodeId);
        setPendingEdgeChange(currentEdgeId);
        setShowConfirmDialog(true);
        
        if (prevNodeId) {
          editorStore.selectNode(prevNodeId);
        } else if (prevEdgeId) {
          editorStore.selectEdge(prevEdgeId);
        }
        
        setTimeout(() => {
          isSwitchingRef.current = false;
        }, 100);
        return;
      }
    }
    
    prevSelectedNodeIdRef.current = currentNodeId;
    prevSelectedEdgeIdRef.current = currentEdgeId;
  }, [selectedNode, selectedEdge, mode, pendingChanges, editorStore]);

  const getTitle = () => {
    if (selectedNode?.type === EditorNodes.DEVICE) return "Устройство";
    if (selectedNode?.type === EditorNodes.CABLE) return "Кабель";
    if (selectedNode?.type === EditorNodes.FACTOR) return "Промышленный фактор";
    if (selectedNode?.type === EditorNodes.SUBSCHEMA) return "Вложенная схема";
    if (selectedEdge) return "Связь";
    return "Свойства";
  };

  const saveDraft = useCallback(() => {
    const schemaId = editorStore.currentSchemaId;
    if (schemaId && draftStore.currentDraft) {
      console.log("💾 Updating draft data");
      draftStore.updateDraft(schemaId, {
        nodes: editorStore.nodes,
        edges: editorStore.edges,
      });
    }
  }, [editorStore, draftStore]);

  const handleSave = () => {
    if (pendingChanges && selectedNode) {
      console.log("✅ Applying changes to store:", pendingChanges);
      editorStore.updateNode(selectedNode.id, pendingChanges);
      setPendingChanges(null);
      setTimeout(() => saveDraft(), 100);
    }
    
    if (pendingChanges && selectedEdge && selectedEdge.connectionType === ConnectionType.FACTOR_ELEMENT) {
      editorStore.updateEdge(selectedEdge.id, {
        factorData: {
          ...selectedEdge.factorData,
          distance: pendingChanges.distance,
          attenuation: pendingChanges.attenuation ?? 0,
        } as any,
        isActive: pendingChanges.isActive,
      });
      setPendingChanges(null);
      setTimeout(() => saveDraft(), 100);
    }
    
    setMode("view");
  };

  const handleSaveAndSwitch = () => {
    if (pendingChanges && selectedNode) {
      editorStore.updateNode(selectedNode.id, pendingChanges);
    }
    if (pendingChanges && selectedEdge && selectedEdge.connectionType === ConnectionType.FACTOR_ELEMENT) {
      editorStore.updateEdge(selectedEdge.id, {
        factorData: {
          ...selectedEdge.factorData,
          distance: pendingChanges.distance,
          attenuation: pendingChanges.attenuation ?? 0,
        } as any,
        isActive: pendingChanges.isActive,
      });
    }
    
    setPendingChanges(null);
    saveDraft();
    
    if (pendingNodeChange) {
      editorStore.selectNode(pendingNodeChange);
    } else if (pendingEdgeChange) {
      editorStore.selectEdge(pendingEdgeChange);
    }
    
    setPendingNodeChange(null);
    setPendingEdgeChange(null);
    setMode("view");
    setShowConfirmDialog(false);
  };

  const handleCancelAndSwitch = () => {
    setPendingChanges(null);
    
    if (pendingNodeChange) {
      editorStore.selectNode(pendingNodeChange);
    } else if (pendingEdgeChange) {
      editorStore.selectEdge(pendingEdgeChange);
    }
    
    setPendingNodeChange(null);
    setPendingEdgeChange(null);
    setMode("view");
    setShowConfirmDialog(false);
  };

  // ============ ОБНОВЛЕННЫЙ handleEdit ============
  const handleEdit = () => {
    if (selectedNode) {
      if (selectedNode.type === EditorNodes.FACTOR) {
        const currentData = {
          customName: selectedNode.customName || selectedNode.name,
          factorValue: selectedNode.factorValue ?? selectedNode.factor?.factorValue ?? 25,
          factorRadius: selectedNode.factorRadius ?? selectedNode.factor?.factorRadius ?? 10,
          factorUnit: selectedNode.factorUnit ?? selectedNode.factor?.factorUnit ?? "°C",
          factorType: selectedNode.factorType ?? selectedNode.factor?.factorType ?? "TEMPERATURE",
          isEnabled: selectedNode.isEnabled !== false,
          // Динамические поля
          changeRatePerSecond: selectedNode.changeRatePerSecond ?? selectedNode.factor?.changeRatePerSecond ?? 0,
          minValue: selectedNode.minValue ?? selectedNode.factor?.minValue,
          maxValue: selectedNode.maxValue ?? selectedNode.factor?.maxValue,
          valueChangePattern: selectedNode.valueChangePattern ?? selectedNode.factor?.valueChangePattern ?? "NONE",
          frequencyHz: selectedNode.frequencyHz ?? selectedNode.factor?.frequencyHz,
          startTimeSeconds: selectedNode.startTimeSeconds ?? selectedNode.factor?.startTimeSeconds,
          durationSeconds: selectedNode.durationSeconds ?? selectedNode.factor?.durationSeconds,
          falloffType: selectedNode.falloffType ?? selectedNode.factor?.falloffType ?? "NONE",
          falloffExponent: selectedNode.falloffExponent ?? selectedNode.factor?.falloffExponent ?? 2.0,
          warningThreshold: selectedNode.warningThreshold ?? selectedNode.factor?.warningThreshold,
          criticalThreshold: selectedNode.criticalThreshold ?? selectedNode.factor?.criticalThreshold,
          failureThreshold: selectedNode.failureThreshold ?? selectedNode.factor?.failureThreshold,
          priority: selectedNode.priority ?? selectedNode.factor?.priority ?? 5,
        };
        setPendingChanges(currentData);
      } else if (selectedNode.type === EditorNodes.DEVICE) {
        const currentData = {
          customName: selectedNode.customName || selectedNode.name,
          baseLatencyMs: selectedNode.baseLatencyMs ?? selectedNode.device?.baseLatencyMs ?? 0,
          maxThroughputMbps: selectedNode.maxThroughputMbps ?? selectedNode.device?.maxThroughputMbps ?? 0,
          manufacturer: selectedNode.manufacturer ?? selectedNode.device?.manufacturer ?? "",
          portCount: selectedNode.portCount ?? selectedNode.device?.portCount,
          // Промышленные коэффициенты
          tempCoefficient: selectedNode.tempCoefficient ?? selectedNode.device?.tempCoefficient ?? 1.0,
          emiCoefficient: selectedNode.emiCoefficient ?? selectedNode.device?.emiCoefficient ?? 1.0,
          vibrationCoefficient: selectedNode.vibrationCoefficient ?? selectedNode.device?.vibrationCoefficient ?? 1.0,
          dustCoefficient: selectedNode.dustCoefficient ?? selectedNode.device?.dustCoefficient ?? 1.0,
          // Допустимые диапазоны
          maxOperatingTemp: selectedNode.maxOperatingTemp ?? selectedNode.device?.maxOperatingTemp,
          minOperatingTemp: selectedNode.minOperatingTemp ?? selectedNode.device?.minOperatingTemp,
          maxEmiTolerance: selectedNode.maxEmiTolerance ?? selectedNode.device?.maxEmiTolerance,
          maxVibrationTolerance: selectedNode.maxVibrationTolerance ?? selectedNode.device?.maxVibrationTolerance,
          // Надежность
          mtbfHours: selectedNode.mtbfHours ?? selectedNode.device?.mtbfHours,
          mttrMinutes: selectedNode.mttrMinutes ?? selectedNode.device?.mttrMinutes,
          warmUpTimeSeconds: selectedNode.warmUpTimeSeconds ?? selectedNode.device?.warmUpTimeSeconds,
          // Экономика
          replacementCost: selectedNode.replacementCost ?? selectedNode.device?.replacementCost,
          repairCost: selectedNode.repairCost ?? selectedNode.device?.repairCost,
          // Энергопотребление
          powerConsumptionWatts: selectedNode.powerConsumptionWatts ?? selectedNode.device?.powerConsumptionWatts,
          heatGenerationWatts: selectedNode.heatGenerationWatts ?? selectedNode.device?.heatGenerationWatts,
          ipRating: selectedNode.ipRating ?? selectedNode.device?.ipRating,
          operatingHumidityMax: selectedNode.operatingHumidityMax ?? selectedNode.device?.operatingHumidityMax,
          needsCooling: selectedNode.needsCooling ?? selectedNode.device?.needsCooling,
          hasRedundantPower: selectedNode.hasRedundantPower ?? selectedNode.device?.hasRedundantPower,
          isEnabled: selectedNode.isEnabled !== false,
        };
        setPendingChanges(currentData);
      } else if (selectedNode.type === EditorNodes.CABLE) {
        const currentData = {
          customName: selectedNode.customName || selectedNode.name,
          lengthM: selectedNode.lengthM ?? selectedNode.cableLengthM ?? 10,
          bandwidthMbps: selectedNode.bandwidthMbps ?? 1000,
          cableType: selectedNode.cableType ?? "TWISTED_PAIR",
          // Физические характеристики
          propagationSpeed: selectedNode.propagationSpeed,
          bendingRadiusMm: selectedNode.bendingRadiusMm,
          tensileStrengthN: selectedNode.tensileStrengthN,
          operatingTensionMaxN: selectedNode.operatingTensionMaxN,
          // Электрические параметры
          impedanceOhms: selectedNode.impedanceOhms,
          coreDiameterUm: selectedNode.coreDiameterUm,
          capacitancePerKmNf: selectedNode.capacitancePerKmNf,
          resistancePerKmOhms: selectedNode.resistancePerKmOhms,
          // Частотные характеристики
          maxFrequencyMhz: selectedNode.maxFrequencyMhz,
          signalToNoiseRatioDb: selectedNode.signalToNoiseRatioDb,
          // Промышленная устойчивость
          immunityRating: selectedNode.immunityRating ?? 5,
          temperatureRating: selectedNode.temperatureRating ?? 60,
          shieldingType: selectedNode.shieldingType ?? 0,
          oilResistance: selectedNode.oilResistance ?? false,
          uvResistance: selectedNode.uvResistance ?? false,
          chemicalResistance: selectedNode.chemicalResistance,
          // Срок службы
          expectedLifetimeYears: selectedNode.expectedLifetimeYears,
          degradationRatePerYear: selectedNode.degradationRatePerYear,
          isEnabled: selectedNode.isEnabled !== false,
        };
        setPendingChanges(currentData);
      }
    }
    if (selectedEdge && selectedEdge.connectionType === ConnectionType.FACTOR_ELEMENT) {
      const currentData = {
        distance: selectedEdge.factorData?.distance || 10,
        attenuation: selectedEdge.factorData?.attenuation || 0,
        isActive: selectedEdge.isActive !== false,
      };
      setPendingChanges(currentData);
    }
    setMode("edit");
  };

  const handleExitEdit = () => {
    if (pendingChanges) {
      setShowConfirmDialog(true);
      setPendingNodeChange(null);
      setPendingEdgeChange(null);
    } else {
      setMode("view");
    }
  };

  const handleDelete = () => {
    if (selectedEdge) {
      editorStore.removeEdge(selectedEdge.id);
      saveDraft();
    }
    if (selectedNode) {
      editorStore.removeNode(selectedNode.id);
      saveDraft();
    }
    setShowDeleteDialog(false);
    editorStore.clearSelection();
    setMode("view");
    setPendingChanges(null);
  };

  const handleDataChange = (updatedData: any) => {
    console.log("📝 Data changed:", updatedData);
    setPendingChanges(updatedData);
  };

  const getActualNode = () => {
    if (!selectedNode) return null;
    return editorStore.getNodeById(selectedNode.id);
  };

  const getActualEdge = () => {
    if (!selectedEdge) return null;
    return editorStore.getEdgeById(selectedEdge.id);
  };

  const renderContent = () => {
    if (!hasSelection) return <EmptyView />;

    const actualNode = getActualNode();
    const actualEdge = getActualEdge();

    if (mode === "view") {
      if (actualNode?.type === EditorNodes.DEVICE) return <DeviceView node={actualNode} />;
      if (actualNode?.type === EditorNodes.CABLE) return <CableView node={actualNode} />;
      if (actualNode?.type === EditorNodes.FACTOR) return <FactorView node={actualNode} />;
      if (actualNode?.type === EditorNodes.SUBSCHEMA) return <SubSchemaView node={actualNode} />;
      if (actualEdge) return <EdgeView edge={actualEdge}/>;
    }

    if (mode === "edit") {
      if (actualNode?.type === EditorNodes.DEVICE) {
        return <DeviceEdit node={actualNode} onDataChange={handleDataChange} initialData={pendingChanges} />;
      }
      if (actualNode?.type === EditorNodes.CABLE) {
        return <CableEdit node={actualNode} onDataChange={handleDataChange} initialData={pendingChanges} />;
      }
      if (actualNode?.type === EditorNodes.FACTOR) {
        return <FactorEdit node={actualNode} onDataChange={handleDataChange} initialData={pendingChanges} />;
      }
      if (actualNode?.type === EditorNodes.SUBSCHEMA) {
        return <SubSchemaEdit node={actualNode} onDataChange={handleDataChange} initialData={pendingChanges} />;
      }
      if (actualEdge && actualEdge.connectionType === ConnectionType.FACTOR_ELEMENT) {
        return <EdgeEdit edge={actualEdge} onDataChange={handleDataChange} initialData={pendingChanges} />;
      }
    }

    return null;
  };

  const handleCloseConfirmDialog = () => {
    setShowConfirmDialog(false);
    setPendingNodeChange(null);
    setPendingEdgeChange(null);
    isSwitchingRef.current = false;
  };

  return (
    <RightPanelContainer style={{ width: `${width}px` }}>
      <ResizeHandle onMouseDown={startResize} />
      
      <Tabs>
        <Tab active={activeTab === "properties"} onClick={() => setActiveTab("properties")}>
          Свойства
        </Tab>
      </Tabs>

      {activeTab === "properties" && (
        <PanelHeader>
          <PanelTitle>{getTitle()}</PanelTitle>
          {hasSelection && (
            <ButtonGroup>
              {(selectedNode || selectedEdge?.connectionType === ConnectionType.FACTOR_ELEMENT) && (
                mode === "view" ? (
                  <EditModeButton onClick={handleEdit}>Редактировать</EditModeButton>
                ) : (
                  <>
                    <ViewModeButton onClick={handleSave}>Сохранить</ViewModeButton>
                    <EditModeButton onClick={handleExitEdit}>Отмена</EditModeButton>
                  </>
                )
              )}
              <DeleteButton onClick={() => setShowDeleteDialog(true)}>Удалить</DeleteButton>
            </ButtonGroup>
          )}
        </PanelHeader>
      )}

      <PanelContent>
        {activeTab === "properties" && renderContent()}
      </PanelContent>

      <Dialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Удаление элемента"
        message={`Вы уверены, что хотите удалить ${getTitle().toLowerCase()}? Это действие нельзя отменить.`}
        confirmText="Удалить"
        type="danger"
      />

      <Dialog
        isOpen={showConfirmDialog}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleSaveAndSwitch}
        onCancel={handleCancelAndSwitch}
        title="Несохраненные изменения"
        message="У вас есть несохраненные изменения. Хотите сохранить их перед переключением?"
        confirmText="Сохранить и переключиться"
        cancelText="Отменить и переключиться"
        type="warning"
      />
    </RightPanelContainer>
  );
});

export default RightPanel;
