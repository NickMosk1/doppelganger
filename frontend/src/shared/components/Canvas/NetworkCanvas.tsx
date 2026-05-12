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
import { reaction } from "mobx";
import { useStores } from "../../../hooks/useStores";
import { DeviceNode, SubSchemaNode, CableNode, FactorNode } from "./nodes";
import { CanvasContainer, CanvasWrapper } from "./NetworkCanvas.styles";
import AxesWithGrid from "./AxesWithGrid";
import { ConnectionType, EditorEdge, EditorNode, EditorNodes } from "../../types";

const nodeTypes: NodeTypes = {
  device: DeviceNode,
  subschema: SubSchemaNode,
  cable: CableNode,
  factor: FactorNode,
};

interface NetworkCanvasProps {
  schemaId: string;
}

const CanvasContent: React.FC<NetworkCanvasProps> = observer(({ schemaId }) => {
  const { editorStore, draftStore } = useStores();
  const { setCenter, setViewport } = useReactFlow();
  const viewport = useViewport();

  // Отладка
  useEffect(() => {
    (window as any).debugStore = {
      editorStore,
      draftStore,
      nodes: editorStore.nodes,
      edges: editorStore.edges,
    };
  }, [editorStore, draftStore]);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // ============ КОНВЕРТАЦИЯ УЗЛОВ ============
  const convertToReactFlowNodes = useCallback((storeNodes: EditorNode[]): Node[] => {
    return storeNodes.map(node => {
      const isSelected = editorStore.selectedNodeId === node.id;
      
      if (node.type === EditorNodes.FACTOR) {
        return {
          id: node.id,
          type: "factor",
          position: node.position,
          selected: isSelected,
          data: {
            id: node.id,
            factorType: node.factorType,
            name: node.name,
            customName: node.customName,
            value: node.factorValue,
            unit: node.factorUnit,
            radius: node.factorRadius,
          },
        };
      }
      
      if (node.type === EditorNodes.CABLE) {
        return {
          id: node.id,
          type: "cable",
          position: node.position,
          selected: isSelected,
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
          selected: isSelected,
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
        selected: isSelected,
        data: {
          id: node.id,
          label: node.customName || node.name,
          schemaId: node.schemaId,
        },
      };
    });
  }, [editorStore.nodes, editorStore.selectedNodeId]);

  // ============ КОНВЕРТАЦИЯ СВЯЗЕЙ ============
  const convertToReactFlowEdges = useCallback((storeEdges: EditorEdge[]): Edge[] => {
    return storeEdges
      .filter(edge => {
        const sourceExists = editorStore.nodes.some(n => n.id === edge.sourceNodeId);
        const targetExists = editorStore.nodes.some(n => n.id === edge.targetNodeId);
        if (!sourceExists || !targetExists) {
          console.warn(`Edge ${edge.id}: source=${edge.sourceNodeId} exists=${sourceExists}, target=${edge.targetNodeId} exists=${targetExists}`);
        }
        return sourceExists && targetExists;
      })
      .map(edge => {
        const isSelected = editorStore.selectedEdgeId === edge.id;
        const isHovered = editorStore.hoveredEdgeId === edge.id;
        
        const getEdgeStyle = () => {
          const baseStyle = { strokeWidth: isSelected ? 3 : 2 };
          if (edge.connectionType === ConnectionType.CABLE_DEVICE) {
            return { ...baseStyle, stroke: isSelected ? '#e54848' : (isHovered ? '#3b82f6' : '#94a3b8') };
          }
          if (edge.connectionType === ConnectionType.FACTOR_ELEMENT) {
            return { ...baseStyle, stroke: isSelected ? '#e54848' : (isHovered ? '#f59e0b' : '#d97706'), strokeDasharray: '5,5' };
          }
          return { ...baseStyle, stroke: isSelected ? '#e54848' : (isHovered ? '#3b82f6' : '#94a3b8') };
        };
        
        const getEdgeLabel = () => {
          if (edge.connectionType === ConnectionType.FACTOR_ELEMENT) {
            return `${edge.factorData?.distance || 0}м`;
          }
          return '';
        };
        
        const getLabelStyle = () => {
          if (edge.connectionType === ConnectionType.CABLE_DEVICE) {
            return { fill: '#3b82f6', fontSize: 10, fontWeight: 500 };
          }
          if (edge.connectionType === ConnectionType.FACTOR_ELEMENT) {
            return { fill: '#d97706', fontSize: 10, fontWeight: 500 };
          }
          return { fill: '#94a3b8', fontSize: 10 };
        };
        
        const baseEdge: Edge = {
          id: edge.id,
          source: edge.sourceNodeId,
          target: edge.targetNodeId,
          sourceHandle: edge.source,
          targetHandle: edge.target,
          label: getEdgeLabel(),
          selected: isSelected,
          style: getEdgeStyle(),
          labelStyle: getLabelStyle(),
          data: { connectionType: edge.connectionType, factorData: edge.factorData, lengthM: edge.lengthM },
        };
        
        if (edge.connectionType === ConnectionType.FACTOR_ELEMENT) {
          return { ...baseEdge, animated: true, style: { ...baseEdge.style, strokeDasharray: '5,5' } };
        }
        return baseEdge;
      });
  }, [editorStore.nodes, editorStore.selectedEdgeId, editorStore.hoveredEdgeId]);

  // ============ ОБНОВЛЕНИЕ КАНВАСА ============
  const refreshCanvas = useCallback(() => {
    setNodes(convertToReactFlowNodes(editorStore.nodes));
    setEdges(convertToReactFlowEdges(editorStore.edges));
  }, [editorStore.nodes, editorStore.edges, convertToReactFlowNodes, convertToReactFlowEdges, setNodes, setEdges]);

  // Следим за выделением и обновляем канвас
  useEffect(() => {
    refreshCanvas();
  }, [editorStore.selectedNodeId, editorStore.selectedEdgeId, refreshCanvas]);

  // Следим за изменением количества узлов и связей
  useEffect(() => {
    refreshCanvas();
  }, [editorStore.nodes.length, editorStore.edges.length, refreshCanvas]);

  // Инициализация
  useEffect(() => {
    refreshCanvas();
  }, [refreshCanvas]);

  // ============ MOBX REACTIONS ДЛЯ АВТОСОХРАНЕНИЯ ЧЕРНОВИКА ============
  
  // Реакция на изменение узлов
  useEffect(() => {
    const dispose = reaction(
      () => editorStore.nodes.map(n => ({ 
        id: n.id, 
        name: n.customName || n.name, 
        position: n.position,
        lengthM: n.lengthM,
        cableType: n.cableType,
      })),
      () => {
        console.log("🔄 Nodes changed, updating draft");
        const schemaId = editorStore.currentSchemaId;
        if (schemaId && draftStore.currentDraft) {
          draftStore.updateDraft(schemaId, {
            nodes: editorStore.nodes,
            edges: editorStore.edges,
          });
        }
      },
      { delay: 500 }
    );
    return () => dispose();
  }, [editorStore.nodes, draftStore, editorStore.currentSchemaId]);

  // Реакция на изменение связей
  useEffect(() => {
    const dispose = reaction(
      () => editorStore.edges.map(e => ({ id: e.id, lengthM: e.lengthM, sourceNodeId: e.sourceNodeId, targetNodeId: e.targetNodeId })),
      () => {
        console.log("🔄 Edges changed, updating draft");
        const schemaId = editorStore.currentSchemaId;
        if (schemaId && draftStore.currentDraft) {
          draftStore.updateDraft(schemaId, {
            nodes: editorStore.nodes,
            edges: editorStore.edges,
          });
        }
      },
      { delay: 500 }
    );
    return () => dispose();
  }, [editorStore.edges, draftStore, editorStore.currentSchemaId]);

  // ============ ОБРАБОТЧИКИ ============
  
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

  const onNodesDelete = useCallback((nodesToDelete: Node[]) => {
    nodesToDelete.forEach(node => editorStore.removeNode(node.id));
    refreshCanvas();
  }, [editorStore, refreshCanvas]);

  const onEdgesDelete = useCallback((edgesToDelete: Edge[]) => {
    edgesToDelete.forEach(edge => editorStore.removeEdge(edge.id));
    refreshCanvas();
  }, [editorStore, refreshCanvas]);

  const onConnect = useCallback((connection: Connection) => {
    console.log("=== CONNECTION DETECTED ===", connection);
    
    if (!connection.source || !connection.target) return;
    
    const sourceNode = editorStore.nodes.find(n => n.id === connection.source);
    const targetNode = editorStore.nodes.find(n => n.id === connection.target);
    
    if (!sourceNode || !targetNode) {
      console.warn("Source or target node not found");
      return;
    }
    
    // ❌ Запрещаем связь устройство-устройство
    if (sourceNode.type === EditorNodes.DEVICE && targetNode.type === EditorNodes.DEVICE) {
      console.warn("❌ Cannot connect device to device directly");
      return;
    }
    
    const edgeId = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    let connectionType: ConnectionType = ConnectionType.CABLE_DEVICE;
    let edgeData: Partial<EditorEdge> = {
      id: edgeId,
      source: connection.sourceHandle!,
      target: connection.targetHandle!,
      sourceNodeId: connection.source,
      targetNodeId: connection.target,
      isActive: true,
    };
    
    const isSourceFactor = sourceNode.type === EditorNodes.FACTOR;
    const isTargetFactor = targetNode.type === EditorNodes.FACTOR;
    const isSourceCable = sourceNode.type === EditorNodes.CABLE;
    const isTargetCable = targetNode.type === EditorNodes.CABLE;
    const isSourceDevice = sourceNode.type === EditorNodes.DEVICE;
    const isTargetDevice = targetNode.type === EditorNodes.DEVICE;
    
    // Если один из узлов - ФАКТОР, то это FACTOR_ELEMENT связь
    if (isSourceFactor || isTargetFactor) {
      connectionType = ConnectionType.FACTOR_ELEMENT;
      const factorNode = isSourceFactor ? sourceNode : targetNode;
      const elementNode = isSourceFactor ? targetNode : sourceNode;
      
      // Проверяем, что элемент - это устройство или кабель (не фактор)
      if (elementNode.type !== EditorNodes.DEVICE && elementNode.type !== EditorNodes.CABLE) {
        console.warn("❌ Factor can only connect to DEVICE or CABLE");
        return;
      }
      
      edgeData = {
        ...edgeData,
        connectionType,
        factorData: {
          factorId: factorNode.id,
          factorType: factorNode.factorType || "UNKNOWN",
          distance: 10,
          attenuation: 0,
        },
        lengthM: undefined,
      };
      
      console.log(`✅ Creating FACTOR_ELEMENT connection: ${factorNode.name} → ${elementNode.name}`);
    } 
    // Если кабель с устройством - CABLE_DEVICE связь
    else if ((isSourceDevice && isTargetCable) || (isSourceCable && isTargetDevice)) {
      connectionType = ConnectionType.CABLE_DEVICE;
      edgeData = {
        ...edgeData,
        connectionType,
        lengthM: 10,
        bandwidthMbps: 1000,
      };
      console.log(`✅ Creating CABLE_DEVICE connection: ${sourceNode.name} ↔ ${targetNode.name}`);
    }
    else {
      console.warn(`❌ Unsupported connection type: ${sourceNode.type} → ${targetNode.type}`);
      return;
    }
    
    const newEdge = edgeData as EditorEdge;
    const added = editorStore.addEdge(newEdge);
    
    if (added) {
      const getEdgeStyle = () => {
        if (connectionType === ConnectionType.FACTOR_ELEMENT) {
          return { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,5' };
        }
        return { stroke: '#e54848', strokeWidth: 2 };
      };
      
      const getEdgeLabel = () => {
        if (connectionType === ConnectionType.FACTOR_ELEMENT) {
          return '10м';
        }
        return '';
      };
      
      const reactFlowEdge: Edge = {
        id: edgeId,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        label: getEdgeLabel(),
        style: getEdgeStyle(),
        data: { connectionType, ...edgeData },
      };
      
      setEdges((eds) => addEdge(reactFlowEdge, eds));
      
      // Обновляем состояние портов (только для CABLE_DEVICE)
      if (connectionType === ConnectionType.CABLE_DEVICE) {
        editorStore.updatePortConnection(connection.source, connection.sourceHandle!, true);
        editorStore.updatePortConnection(connection.target, connection.targetHandle!, true);
      }
    }
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

  useEffect(() => {
    setTimeout(() => setViewport({ x: 0, y: 0, zoom: 1 }), 100);
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
          <AxesWithGrid baseGridSize={50} axisOpacity={0.4} gridOpacity={0.4} minStepPx={15} maxStepPx={150} />
          <Controls showInteractive={false} />
          <MiniMap />
          <Panel position="top-left">
            <div style={{ background: "white", padding: "4px 12px", borderRadius: "6px", fontSize: "12px" }}>
              🎯 Сетка | 📐 Zoom: {(viewport.zoom * 100).toFixed(0)}%
            </div>
          </Panel>
          <Panel position="top-right">
            <div style={{ background: "white", padding: "4px 12px", borderRadius: "6px", fontSize: "12px" }}>
              📊 Устройств: {nodes.filter(n => n.type === 'device').length} | 🔌 Кабелей: {nodes.filter(n => n.type === 'cable').length} | 🔗 Связей: {edges.length}
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
