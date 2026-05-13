import { useState, useCallback } from "react";
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

  const selectedNode = editorStore.selectedNode;
  const selectedEdge = editorStore.selectedEdge;
  const hasSelection = selectedNode || selectedEdge;

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
    if (pendingChanges) {
      console.log("✅ Applying changes to store:", pendingChanges);
      
      if (selectedNode) {
        // Для FACTOR
        if (selectedNode.type === EditorNodes.FACTOR) {
          if (pendingChanges.customName !== undefined) {
            editorStore.updateNodeField(selectedNode.id, "customName", pendingChanges.customName);
          }
          if (pendingChanges.factorValue !== undefined) {
            editorStore.updateNodeField(selectedNode.id, "factorValue", pendingChanges.factorValue);
          }
          if (pendingChanges.factorRadius !== undefined) {
            editorStore.updateNodeField(selectedNode.id, "factorRadius", pendingChanges.factorRadius);
          }
          if (pendingChanges.isEnabled !== undefined) {
            editorStore.updateNodeField(selectedNode.id, "isEnabled", pendingChanges.isEnabled);
          }
        }
        // Для DEVICE
        else if (selectedNode.type === EditorNodes.DEVICE) {
          if (pendingChanges.customName !== undefined) {
            editorStore.updateNodeField(selectedNode.id, "customName", pendingChanges.customName);
          }
          if (pendingChanges.baseLatencyMs !== undefined) {
            editorStore.updateNodeField(selectedNode.id, "baseLatencyMs", pendingChanges.baseLatencyMs);
          }
          if (pendingChanges.maxThroughputMbps !== undefined) {
            editorStore.updateNodeField(selectedNode.id, "maxThroughputMbps", pendingChanges.maxThroughputMbps);
          }
        }
        // Для CABLE
        else if (selectedNode.type === EditorNodes.CABLE) {
          if (pendingChanges.customName !== undefined) {
            editorStore.updateNodeField(selectedNode.id, "customName", pendingChanges.customName);
          }
          if (pendingChanges.lengthM !== undefined) {
            editorStore.updateNodeField(selectedNode.id, "lengthM", pendingChanges.lengthM);
          }
        }
      }
      
      if (selectedEdge && selectedEdge.connectionType === ConnectionType.FACTOR_ELEMENT) {
        if (pendingChanges.distance !== undefined) {
          editorStore.updateEdge(selectedEdge.id, { 
            factorData: {
              ...selectedEdge.factorData,
              distance: pendingChanges.distance,
            } as any
          });
        }
        if (pendingChanges.isActive !== undefined) {
          editorStore.updateEdge(selectedEdge.id, { isActive: pendingChanges.isActive });
        }
      }
      
      setPendingChanges(null);
      
      setTimeout(() => {
        saveDraft();
      }, 100);
    }
    setMode("view");
  };

  // Отмена изменений
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
          factorValue: selectedNode.factorValue || 25,
          factorRadius: selectedNode.factorRadius || 10,
          isEnabled: selectedNode.isEnabled !== false,
        };
        setPendingChanges(currentData);
      } else if (selectedNode.type === EditorNodes.DEVICE) {
        const currentData = {
          customName: selectedNode.customName || selectedNode.name,
          baseLatencyMs: selectedNode.baseLatencyMs || 0,
          maxThroughputMbps: selectedNode.maxThroughputMbps || 0,
        };
        setPendingChanges(currentData);
      } else if (selectedNode.type === EditorNodes.CABLE) {
        const currentData = {
          customName: selectedNode.customName || selectedNode.name,
          lengthM: selectedNode.lengthM || 10,
        };
        setPendingChanges(currentData);
      }
    }
    if (selectedEdge && selectedEdge.connectionType === ConnectionType.FACTOR_ELEMENT) {
      const currentData = {
        distance: selectedEdge.factorData?.distance || 10,
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

  const renderContent = () => {
    if (!hasSelection) return <EmptyView />;

    if (mode === "view") {
      if (selectedNode?.type === EditorNodes.DEVICE) return <DeviceView node={selectedNode} />;
      if (selectedNode?.type === EditorNodes.CABLE) return <CableView node={selectedNode} editorStore={editorStore} />;
      if (selectedNode?.type === EditorNodes.FACTOR) return <FactorView node={selectedNode} editorStore={editorStore} />;
      if (selectedNode?.type === EditorNodes.SUBSCHEMA) return <SubSchemaView node={selectedNode} />;
      if (selectedEdge) return <EdgeView edge={selectedEdge} editorStore={editorStore} />;
    }

    if (mode === "edit") {
      if (selectedNode?.type === EditorNodes.DEVICE) return <DeviceEdit node={selectedNode} onDataChange={handleDataChange} initialData={pendingChanges} />;
      if (selectedNode?.type === EditorNodes.CABLE) return <CableEdit node={selectedNode} onDataChange={handleDataChange} initialData={pendingChanges} />;
      if (selectedNode?.type === EditorNodes.FACTOR) return <FactorEdit node={selectedNode} onDataChange={handleDataChange} initialData={pendingChanges} />;
      if (selectedNode?.type === EditorNodes.SUBSCHEMA) return <SubSchemaEdit node={selectedNode} onDataChange={handleDataChange} initialData={pendingChanges} />;
      if (selectedEdge && selectedEdge.connectionType === ConnectionType.FACTOR_ELEMENT) {
        return <EdgeEdit edge={selectedEdge} onDataChange={handleDataChange} initialData={pendingChanges} />;
      }
    }

    return null;
  };

  return (
    <RightPanelContainer style={{ width: `${width}px` }}>
      <ResizeHandle onMouseDown={startResize} />
      
      <Tabs>
        <Tab active={activeTab === "properties"} onClick={() => setActiveTab("properties")}>
          Свойства
        </Tab>
        <Tab active={activeTab === "factors"} onClick={() => setActiveTab("factors")}>
          Факторы
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

      <Dialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleCancel}
        title="Отмена изменений"
        message="У вас есть несохраненные изменения. Вы уверены, что хотите выйти без сохранения?"
        confirmText="Выйти без сохранения"
        cancelText="Продолжить редактирование"
        type="warning"
      />
    </RightPanelContainer>
  );
});

export default RightPanel;
