import { useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  NodeChange,
  NodeTypes,
  OnNodesChange,
  OnEdgesChange,
} from "reactflow";
import "reactflow/dist/style.css";
import { observer } from "mobx-react-lite";
import { useStores } from "../../../hooks/useStores";
import { DeviceNode, SubSchemaNode } from "./nodes";
import { CanvasContainer, CanvasWrapper } from "./NetworkCanvas.styles";

const nodeTypes: NodeTypes = {
  device: DeviceNode,
  subschema: SubSchemaNode,
};

export const NetworkCanvas: React.FC<{ schemaId: string }> = observer(({ schemaId }) => {
  const { editorStore } = useStores();

  // Конвертируем EditorNode в ReactFlow Node
  const initialNodes: Node[] = editorStore.nodes.map(node => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: {
      label: node.customName || node.name,
      deviceId: node.deviceId,
      schemaId: node.schemaId,
      type: node.type,
    },
  }));

  // Конвертируем EditorEdge в ReactFlow Edge
  const initialEdges: Edge[] = editorStore.edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: `${edge.lengthM}м`,
    data: { cableId: edge.cableId, lengthM: edge.lengthM },
  }));

  const [nodes, _, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Синхронизация между ReactFlow и Store
  const onNodesChangeHandler: OnNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);
    // Обновляем позиции в store
    changes.forEach((change) => {
      if (change.type === "position" && "position" in change && change.position) {
        editorStore.updateNodePosition(change.id, { x: change.position.x, y: change.position.y });
      }
    });
  }, [editorStore, onNodesChange]);

  const onEdgesChangeHandler: OnEdgesChange = useCallback((changes) => {
    onEdgesChange(changes);
  }, [onEdgesChange]);

  const onConnect = useCallback((connection: Connection) => {
    const newEdge: Edge = {
      ...connection,
      id: `edge-${Date.now()}`,
      label: "10м",
      data: { lengthM: 10 },
    } as Edge;
    setEdges((eds) => addEdge(newEdge, eds));
  }, [setEdges]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    editorStore.selectNode(node.id);
  }, [editorStore]);

  const onEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    editorStore.selectEdge(edge.id);
  }, [editorStore]);

  const onPaneClick = useCallback(() => {
    editorStore.clearSelection();
  }, [editorStore]);

  return (
    <CanvasContainer>
      <CanvasWrapper>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChangeHandler}
          onEdgesChange={onEdgesChangeHandler}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid
          snapGrid={[16, 16]}
        >
          <Background color="#e5e5e5" gap={16} />
          <Controls />
          <MiniMap />
          <Panel position="top-right">
            <div style={{ background: "white", padding: "8px 16px", borderRadius: "8px", fontSize: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
              📊 Устройств: {nodes.length} | 🔗 Связей: {edges.length}
            </div>
          </Panel>
        </ReactFlow>
      </CanvasWrapper>
    </CanvasContainer>
  );
});

export default NetworkCanvas;
