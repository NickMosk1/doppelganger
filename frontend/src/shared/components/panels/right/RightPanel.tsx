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
import { FactorsTab, SimulationTab } from "./components";
import { EditorNodes } from "../../../types";
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
      // НЕ вызываем markAsSaved, так как изменения еще не сохранены на бэке
    }
  }, [editorStore, draftStore]);

  // Сохраняем изменения в store и на канвас
  const handleSave = () => {
    if (pendingChanges) {
      console.log("✅ Applying changes to store:", pendingChanges);
      
      if (selectedNode) {
        Object.entries(pendingChanges).forEach(([key, value]) => {
          editorStore.updateNodeField(selectedNode.id, key as any, value);
        });
      }
      if (selectedEdge) {
        Object.entries(pendingChanges).forEach(([key, value]) => {
          editorStore.updateEdge(selectedEdge.id, { [key]: value });
        });
      }
      setPendingChanges(null);
      
      // Сохраняем черновик после изменений
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
    // Загружаем текущие данные в форму
    if (selectedNode) {
      const currentData = {
        customName: selectedNode.customName || selectedNode.name,
        baseLatencyMs: selectedNode.baseLatencyMs || 0,
        maxThroughputMbps: selectedNode.maxThroughputMbps || 0,
        lengthM: selectedNode.lengthM || 10,
      };
      setPendingChanges(currentData);
    }
    if (selectedEdge) {
      const currentData = {
        lengthM: selectedEdge.lengthM || 10,
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
      if (selectedEdge) return <EdgeView edge={selectedEdge} editorStore={editorStore} />;  // EdgeView сам обрабатывает оба типа
    }

    if (mode === "edit") {
      if (selectedNode?.type === EditorNodes.DEVICE) return <DeviceEdit node={selectedNode} onDataChange={handleDataChange} initialData={pendingChanges} />;
      if (selectedNode?.type === EditorNodes.CABLE) return <CableEdit node={selectedNode} onDataChange={handleDataChange} initialData={pendingChanges} />;
      if (selectedNode?.type === EditorNodes.FACTOR) return <FactorEdit node={selectedNode} onDataChange={handleDataChange} initialData={pendingChanges} />;
      if (selectedNode?.type === EditorNodes.SUBSCHEMA) return <SubSchemaEdit node={selectedNode} onDataChange={handleDataChange} initialData={pendingChanges} />;
      if (selectedEdge) return <EdgeEdit edge={selectedEdge} onDataChange={handleDataChange} initialData={pendingChanges} />;  // EdgeEdit сам обрабатывает оба типа
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
        <Tab active={activeTab === "simulation"} onClick={() => setActiveTab("simulation")}>
          Симуляция
        </Tab>
      </Tabs>

      {activeTab === "properties" && (
        <PanelHeader>
          <PanelTitle>{getTitle()}</PanelTitle>
          {hasSelection && (
            <ButtonGroup>
              {!!selectedNode?.type && (
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
        {activeTab === "simulation" && <SimulationTab />}
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
