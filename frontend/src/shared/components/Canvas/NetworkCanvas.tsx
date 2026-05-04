import { useCallback, useEffect } from "react";
import ReactFlow, {
  Controls,
  MiniMap,
  Panel,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  NodeTypes,
  OnNodesChange,
  OnEdgesChange,
  NodeChange,
  EdgeChange,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  useViewport,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { observer } from "mobx-react-lite";
import { useStores } from "../../../hooks/useStores";
import { DeviceNode, SubSchemaNode } from "./nodes";
import { CanvasContainer, CanvasWrapper } from "./NetworkCanvas.styles";
import AxesWithGrid from "./AxesWithGrid";

const nodeTypes: NodeTypes = {
  device: DeviceNode,
  subschema: SubSchemaNode,
};

interface NetworkCanvasProps {
  schemaId: string;
};

const CanvasContent: React.FC<NetworkCanvasProps> = observer(({}) => {
  const { editorStore } = useStores();
  const { setViewport } = useReactFlow();

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

  const initialEdges: Edge[] = editorStore.edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: `${edge.lengthM}м`,
    data: { cableId: edge.cableId, lengthM: edge.lengthM },
  }));

  const [nodes, _, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodesChangeHandler: OnNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);
    changes.forEach((change) => {
      if (change.type === "position" && "position" in change && change.position) {
        editorStore.updateNodePosition(change.id, { x: change.position.x, y: change.position.y });
      }
    });
  }, [editorStore, onNodesChange]);

  const onEdgesChangeHandler: OnEdgesChange = useCallback((changes: EdgeChange[]) => {
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

  useEffect(() => {
    setTimeout(() => {
      setViewport({ x: 0, y: 0, zoom: 1 });
    }, 100);
  }, []);

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
          fitViewOptions={{ padding: 0.2, includeHiddenNodes: true }}
          snapToGrid
          snapGrid={[16, 16]}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        >
          {/* Сетка из точек как фон */}
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#cbd5e1" />

          {/* Оси и динамическая сетка */}
          <AxesWithGrid
            baseGridSize={50}
            axisOpacity={0.8}
            gridOpacity={0.4}
            minStepPx={15}
            maxStepPx={150}
          />

          <Controls />
          <MiniMap />

          <Panel position="top-left">
            <div style={{ 
              background: "white", 
              padding: "4px 12px", 
              borderRadius: "6px", 
              fontSize: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}>
              🎯 Сетка | 📐 Zoom: {(useViewport().zoom * 100).toFixed(0)}%
            </div>
          </Panel>

          <Panel position="top-right">
            <div style={{ 
              background: "white", 
              padding: "4px 12px", 
              borderRadius: "6px", 
              fontSize: "12px",
              border: "1px solid #e2e8f0",
            }}>
              📊 Устройств: {nodes.length} | 🔗 Связей: {edges.length}
            </div>
          </Panel>
        </ReactFlow>
      </CanvasWrapper>
    </CanvasContainer>
  );
});

export const NetworkCanvas: React.FC<NetworkCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <CanvasContent {...props} />
    </ReactFlowProvider>
  );
};

export default NetworkCanvas;
