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
import { FactorsTab } from "./components";
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
  
  // Флаги для предотвращения бесконечного цикла
  const isSwitchingRef = useRef(false);
  const prevSelectedNodeIdRef = useRef<string | null>(null);
  const prevSelectedEdgeIdRef = useRef<string | null>(null);

  const selectedNode = editorStore.selectedNode;
  const selectedEdge = editorStore.selectedEdge;
  const hasSelection = selectedNode || selectedEdge;

  // Отслеживаем изменение selection
  useEffect(() => {
    // Если мы в процессе переключения - пропускаем
    if (isSwitchingRef.current) {
      return;
    }
    
    const currentNodeId = selectedNode?.id || null;
    const currentEdgeId = selectedEdge?.id || null;
    
    const prevNodeId = prevSelectedNodeIdRef.current;
    const prevEdgeId = prevSelectedEdgeIdRef.current;
    
    // Если мы в режиме редактирования и selection изменился
    if (mode === "edit" && (currentNodeId !== prevNodeId || currentEdgeId !== prevEdgeId)) {
      // Если есть несохраненные изменения
      if (pendingChanges) {
        // Помечаем, что начинаем переключение
        isSwitchingRef.current = true;
        
        // Запоминаем, на какой элемент хотели переключиться
        setPendingNodeChange(currentNodeId);
        setPendingEdgeChange(currentEdgeId);
        // Показываем диалог подтверждения
        setShowConfirmDialog(true);
        
        // Возвращаем старый selection
        if (prevNodeId) {
          editorStore.selectNode(prevNodeId);
        } else if (prevEdgeId) {
          editorStore.selectEdge(prevEdgeId);
        }
        
        // Сбрасываем флаг после завершения
        setTimeout(() => {
          isSwitchingRef.current = false;
        }, 100);
        
        return;
      }
    }
    
    // Обновляем refs
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

  // Функция сохранения черновика
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

  // Сохраняем изменения в store и на канвас
  const handleSave = () => {
    if (pendingChanges && selectedNode) {
      console.log("✅ Applying changes to store:", pendingChanges);
      
      editorStore.updateNode(selectedNode.id, pendingChanges);
      
      setPendingChanges(null);
      
      setTimeout(() => {
        saveDraft();
      }, 100);
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
      
      setTimeout(() => {
        saveDraft();
      }, 100);
    }
    
    setMode("view");
  };

  // Сохранить и переключиться на новую ноду
  const handleSaveAndSwitch = () => {
    // Сначала сохраняем текущие изменения
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
    
    // Сохраняем черновик
    saveDraft();
    
    // Переключаемся на новую ноду
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

  // Отмена изменений и переключение
  const handleCancelAndSwitch = () => {
    setPendingChanges(null);
    
    // Переключаемся на новую ноду
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

  // Отмена изменений (без переключения)
  const handleCancel = () => {
    setPendingChanges(null);
    setMode("view");
    setShowConfirmDialog(false);
  };

  // Переключение в режим редактирования
  const handleEdit = () => {
    if (selectedNode) {
      if (selectedNode.type === EditorNodes.FACTOR) {
        const currentData = {
          customName: selectedNode.customName || selectedNode.name,
          factorValue: selectedNode.factorValue ?? selectedNode.factor?.factorValue ?? 25,
          factorRadius: selectedNode.factorRadius ?? selectedNode.factor?.factorRadius ?? 10,
          isEnabled: selectedNode.isEnabled !== false,
        };
        setPendingChanges(currentData);
      } else if (selectedNode.type === EditorNodes.DEVICE) {
        const currentData = {
          customName: selectedNode.customName || selectedNode.name,
          baseLatencyMs: selectedNode.baseLatencyMs ?? selectedNode.device?.baseLatencyMs ?? 0,
          maxThroughputMbps: selectedNode.maxThroughputMbps ?? selectedNode.device?.maxThroughputMbps ?? 0,
        };
        setPendingChanges(currentData);
      } else if (selectedNode.type === EditorNodes.CABLE) {
        const currentData = {
          customName: selectedNode.customName || selectedNode.name,
          lengthM: selectedNode.lengthM ?? selectedNode.cableLengthM ?? 10,
          bandwidthMbps: selectedNode.bandwidthMbps ?? 1000,
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

  // Попытка выхода из режима редактирования
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

  // Обработка изменений из Edit компонентов
  const handleDataChange = (updatedData: any) => {
    console.log("📝 Data changed:", updatedData);
    setPendingChanges(updatedData);
  };

  // Получаем актуальную ноду из стора
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
        {/* <Tab active={activeTab === "factors"} onClick={() => setActiveTab("factors")}>
          Факторы
        </Tab> */}
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
        {activeTab === "factors" && <FactorsTab />}
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

      {/* Диалог подтверждения при смене ноды в режиме редактирования */}
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
