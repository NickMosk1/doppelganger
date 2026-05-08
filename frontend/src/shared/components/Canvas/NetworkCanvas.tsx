import { useCallback, useEffect } from "react";
import ReactFlow, {
  Controls,
  MiniMap,
  Panel,
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
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import { observer } from "mobx-react-lite";
import { useStores } from "../../../hooks/useStores";
import { DeviceNode, SubSchemaNode, CableNode } from "./nodes";
import { CanvasContainer, CanvasWrapper } from "./NetworkCanvas.styles";
import AxesWithGrid from "./AxesWithGrid";
import { EditorEdge, EditorNode, EditorNodes } from "../../types";

const nodeTypes: NodeTypes = {
  device: DeviceNode,
  subschema: SubSchemaNode,
  cable: CableNode,
};

interface NetworkCanvasProps {
  schemaId: string;
}

const CanvasContent: React.FC<NetworkCanvasProps> = observer(({ schemaId }) => {
  const { editorStore } = useStores();
  const { setCenter } = useReactFlow();
  const viewport = useViewport();

  // Конвертация узлов
  const convertToReactFlowNodes = useCallback((nodes: EditorNode[]): Node[] => {
    return nodes.map(node => {
      if (node.type === EditorNodes.CABLE) {
        return {
          id: node.id,
          type: "cable",
          position: node.position,
          data: {
            id: node.id,
            name: node.name,
            lengthM: node.lengthM || 10,
            cableType: node.cableType || "Ethernet",
          },
        };
      }
      
      if (node.type === EditorNodes.DEVICE) {
        return {
          id: node.id,
          type: "device",
          position: node.position,
          data: {
            id: node.id,
            label: node.customName || node.name,
            deviceId: node.deviceId,
            type: "DEVICE",
            status: node.status,
            ports: node.ports,
            icon: node.icon,
          },
        };
      }
      
      return {
        id: node.id,
        type: "subschema",
        position: node.position,
        data: {
          id: node.id,
          label: node.customName || node.name,
          schemaId: node.schemaId,
        },
      };
    });
  }, []);

  // Конвертация связей (ВАЖНО: правильные поля для React Flow)
  const convertToReactFlowEdges = useCallback((edges: EditorEdge[]): Edge[] => {
    return edges.map(edge => ({
      id: edge.id,
      source: edge.sourceNodeId,
      target: edge.targetNodeId,
      sourceHandle: edge.source,
      targetHandle: edge.target,
      label: `${edge.lengthM}м`,
      style: { stroke: '#e54848', strokeWidth: 2 },
    }));
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Инициализация при монтировании
  useEffect(() => {
    const initialNodes = convertToReactFlowNodes(editorStore.nodes);
    const initialEdges = convertToReactFlowEdges(editorStore.edges);
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, []);

  // Синхронизация из store (при изменении количества узлов)
  useEffect(() => {
    if (editorStore.nodes.length !== nodes.length) {
      setNodes(convertToReactFlowNodes(editorStore.nodes));
    }
  }, [editorStore.nodes.length]);

  // Синхронизация связей из store
  useEffect(() => {
    setEdges(convertToReactFlowEdges(editorStore.edges));
  }, [editorStore.edges.length, editorStore.edges]);

  // Обработка изменений в React Flow
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

  // Создание новой связи
  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;
    
    const edgeId = `edge-${Date.now()}`;
    
    // Добавляем в React Flow
    setEdges((eds) => addEdge({ ...connection, id: edgeId, style: { stroke: '#e54848', strokeWidth: 2 } }, eds));
    
    // Сохраняем в store
    editorStore.addEdge({
      id: edgeId,
      source: connection.sourceHandle!,
      target: connection.targetHandle!,
      sourceNodeId: connection.source,
      targetNodeId: connection.target,
      lengthM: 10,
      isActive: true,
    });
    
    // Обновляем состояние портов
    editorStore.updatePortConnection(connection.source, connection.sourceHandle!, true);
    editorStore.updatePortConnection(connection.target, connection.targetHandle!, true);
    
  }, [editorStore, setEdges]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    editorStore.selectNode(node.id);
  }, [editorStore]);

  const onEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    editorStore.selectEdge(edge.id);
  }, [editorStore]);

  const onPaneClick = useCallback(() => {
    editorStore.clearSelection();
  }, [editorStore]);

  // Центрирование
  useEffect(() => {
    setTimeout(() => setCenter(0, 0, { zoom: 1, duration: 300 }), 100);
  }, [setCenter]);

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
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#cbd5e1" />
          <AxesWithGrid baseGridSize={50} axisOpacity={0.3} gridOpacity={0.4} minStepPx={15} maxStepPx={150} />
          <Controls showInteractive={false} />
          <MiniMap />
          <Panel position="top-left">
            <div style={{ background: "white", padding: "4px 12px", borderRadius: "6px", fontSize: "12px" }}>
              Zoom: {(viewport.zoom * 100).toFixed(0)}%
            </div>
          </Panel>
          <Panel position="top-right">
            <div style={{ background: "white", padding: "4px 12px", borderRadius: "6px", fontSize: "12px" }}>
              Устройств: {nodes.filter(n => n.type === 'device').length} | Связей: {edges.length}
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
