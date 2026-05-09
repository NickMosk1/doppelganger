// src/shared/components/Canvas/NetworkCanvas.tsx
import { useCallback, useEffect, useRef, useState } from "react";
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
import { reaction } from "mobx";
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
  const { editorStore, draftStore } = useStores();
  const { setCenter, setViewport } = useReactFlow();
  const viewport = useViewport();
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Добавляем forceUpdate счетчик
  const [updateTrigger, setUpdateTrigger] = useState(0);
  
  // Функция принудительного обновления канваса
  const forceCanvasUpdate = useCallback(() => {
    console.log("🔄 Force canvas update");
    setNodes(convertToReactFlowNodes(editorStore.nodes));
    setEdges(convertToReactFlowEdges(editorStore.edges));
    setUpdateTrigger(prev => prev + 1);
  }, [editorStore.nodes, editorStore.edges]);

  // Следим за изменением количества узлов и связей
  useEffect(() => {
    console.log(`📊 Store changed - nodes: ${editorStore.nodes.length}, edges: ${editorStore.edges.length}`);
    forceCanvasUpdate();
  }, [editorStore.nodes.length, editorStore.edges.length, forceCanvasUpdate]);

  // Следим за самими узлами (изменение свойств)
  useEffect(() => {
    const nodesChanged = JSON.stringify(editorStore.nodes.map(n => ({ id: n.id, name: n.customName || n.name, position: n.position })));
    // вызываем обновление при любом изменении
    forceCanvasUpdate();
  }, [editorStore.nodes]);

  // Обработчик удаления узлов
  const onNodesDelete = useCallback((nodesToDelete: Node[]) => {
    console.log("🗑️ Nodes delete event:", nodesToDelete.map(n => n.id));
    
    nodesToDelete.forEach(node => {
      editorStore.removeNode(node.id);
    });
    
    // Принудительно обновляем канвас
    setTimeout(() => {
      forceCanvasUpdate();
    }, 10);
    
    // Сохраняем черновик
    const schemaId = editorStore.currentSchemaId;
    if (schemaId && draftStore.currentDraft) {
      setTimeout(() => {
        draftStore.updateDraft(schemaId, {
          nodes: editorStore.nodes,
          edges: editorStore.edges,
        });
      }, 100);
    }
  }, [editorStore, draftStore, forceCanvasUpdate]);

  // Обработчик удаления связей
  const onEdgesDelete = useCallback((edgesToDelete: Edge[]) => {
    console.log("🗑️ Edges delete event:", edgesToDelete.map(e => e.id));
    
    edgesToDelete.forEach(edge => {
      editorStore.removeEdge(edge.id);
    });
    
    // Принудительно обновляем канвас
    setTimeout(() => {
      forceCanvasUpdate();
    }, 10);
    
    // Сохраняем черновик
    const schemaId = editorStore.currentSchemaId;
    if (schemaId && draftStore.currentDraft) {
      setTimeout(() => {
        draftStore.updateDraft(schemaId, {
          edges: editorStore.edges,
        });
      }, 100);
    }
  }, [editorStore, draftStore, forceCanvasUpdate]);

  // Конвертация узлов
  const convertToReactFlowNodes = useCallback((storeNodes: EditorNode[]): Node[] => {
    return storeNodes.map(node => {
      if (node.type === EditorNodes.CABLE) {
        return {
          id: node.id,
          type: "cable",
          position: node.position,
          data: {
            id: node.id,
            name: node.customName || node.name,
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

  // Конвертация связей
  const convertToReactFlowEdges = useCallback((storeEdges: EditorEdge[]): Edge[] => {
    return storeEdges.map(edge => ({
      id: edge.id,
      source: edge.sourceNodeId,
      target: edge.targetNodeId,
      sourceHandle: edge.source,
      targetHandle: edge.target,
      label: `${edge.lengthM}м`,
      style: { stroke: '#e54848', strokeWidth: 2 },
    }));
  }, []);

  // MobX reaction для отслеживания изменений узлов
  useEffect(() => {
    const dispose = reaction(
      () => editorStore.nodes.map(n => ({ 
        id: n.id, 
        name: n.customName || n.name, 
        position: n.position,
        lengthM: n.lengthM,
      })),
      () => {
        console.log("🔄 Nodes changed, updating React Flow");
        setNodes(convertToReactFlowNodes(editorStore.nodes));
      },
      { delay: 100 }
    );
    
    return () => dispose();
  }, [editorStore.nodes, convertToReactFlowNodes, setNodes]);

  // MobX reaction для отслеживания изменений связей
  useEffect(() => {
    const dispose = reaction(
      () => editorStore.edges.map(e => ({ id: e.id, lengthM: e.lengthM })),
      () => {
        console.log("🔄 Edges changed, updating React Flow");
        setEdges(convertToReactFlowEdges(editorStore.edges));
      },
      { delay: 100 }
    );
    
    return () => dispose();
  }, [editorStore.edges, convertToReactFlowEdges, setEdges]);

  // Инициализация при монтировании
  useEffect(() => {
    setNodes(convertToReactFlowNodes(editorStore.nodes));
    setEdges(convertToReactFlowEdges(editorStore.edges));
  }, []);

  // Обработчики изменений
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

  // Обработчик создания связи
  const onConnect = useCallback((connection: Connection) => {
    console.log("=== CONNECTION DETECTED ===", connection);
    
    if (!connection.source || !connection.target) return;
    
    const edgeId = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    const newEdge: EditorEdge = {
      id: edgeId,
      source: connection.sourceHandle!,
      target: connection.targetHandle!,
      sourceNodeId: connection.source,
      targetNodeId: connection.target,
      lengthM: 10,
      isActive: true,
    };
    
    const added = editorStore.addEdge(newEdge);
    
    if (added) {
      const reactFlowEdge: Edge = {
        id: edgeId,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        label: '10м',
        style: { stroke: '#e54848', strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(reactFlowEdge, eds));
      
      // Сохраняем черновик
      const schemaId = editorStore.currentSchemaId;
      if (schemaId && draftStore.currentDraft) {
        setTimeout(() => {
          draftStore.updateDraft(schemaId, {
            edges: editorStore.edges,
          });
        }, 100);
      }
    }
  }, [editorStore, setEdges, draftStore]);

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
    setTimeout(() => {
      setCenter(0, 0, { zoom: 1, duration: 300 });
    }, 100);
  }, [setCenter]);

  useEffect(() => {
    setTimeout(() => {
      setViewport({ x: 0, y: 0, zoom: 1 });
    }, 100);
  }, [setViewport]);

  return (
    <CanvasContainer>
      <CanvasWrapper>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChangeHandler}
          onEdgesChange={onEdgesChangeHandler}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
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
          <AxesWithGrid baseGridSize={50} axisOpacity={0.8} gridOpacity={0.4} minStepPx={15} maxStepPx={150} />
          <Controls />
          <MiniMap />
          <Panel position="top-left">
            <div style={{ background: "white", padding: "4px 12px", borderRadius: "6px", fontSize: "12px" }}>
              🎯 Сетка | 📐 Zoom: {(viewport.zoom * 100).toFixed(0)}%
            </div>
          </Panel>
          <Panel position="top-right">
            <div style={{ background: "white", padding: "4px 12px", borderRadius: "6px", fontSize: "12px" }}>
              📊 Устройств: {nodes.filter(n => n.type === 'device').length} | 🔗 Связей: {edges.length}
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
