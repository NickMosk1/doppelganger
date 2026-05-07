import { makeAutoObservable } from "mobx";
import { EditorEdge, EditorNode, EditorNodes, NodePosition, NodeStatus, Port } from "../shared";
import { Nullable } from "../utils";

class EditorStore {
  private _nodes: EditorNode[] = [];
  private _edges: EditorEdge[] = [];
  private _selectedNodeId: Nullable<string> = null;
  private _selectedEdgeId: Nullable<string> = null;
  private _selectedCableId: Nullable<string> = null;
  private _isLoading: boolean = false;
  private _validationErrors: any[] = [];

  // Дополнительные поля для редактора
  private _currentSchemaId: Nullable<string> = null;
  private _schemaName: string = "";
  private _zoom: number = 1;
  private _viewport: { x: number; y: number } = { x: 0, y: 0 };

  constructor() {
    makeAutoObservable(this);
  }

  get nodes() {
    return this._nodes;
  }

  get edges() {
    return this._edges;
  }

  get selectedNode() {
    return this._nodes.find(n => n.id === this._selectedNodeId);
  }

  get selectedEdge() {
    return this._edges.find(e => e.id === this._selectedEdgeId);
  }

  get selectedCableId() {
    return this._selectedCableId;
  }

  get selectedNodeId() {
    return this._selectedNodeId;
  }

  get selectedEdgeId() {
    return this._selectedEdgeId;
  }

  get isLoading() {
    return this._isLoading;
  }

  get validationErrors() {
    return this._validationErrors;
  }

  get currentSchemaId() {
    return this._currentSchemaId;
  }

  get schemaName() {
    return this._schemaName;
  }

  get zoom() {
    return this._zoom;
  }

  get viewport() {
    return this._viewport;
  }

  // Статистика
  get devicesCount() {
    return this._nodes.filter(n => n.type === EditorNodes.DEVICE).length;
  }

  get subschemasCount() {
    return this._nodes.filter(n => n.type === EditorNodes.SUBSCHEMA).length;
  }

  get connectionsCount() {
    return this._edges.length;
  }

  // ============ SETTERS ============
  
  setNodes(nodes: EditorNode[]) {
    this._nodes = nodes;
  }

  setEdges(edges: EditorEdge[]) {
    this._edges = edges;
  }

  setCurrentSchemaId(id: Nullable<string>) {
    this._currentSchemaId = id;
  }

  setSchemaName(name: string) {
    this._schemaName = name;
  }

  setZoom(zoom: number) {
    this._zoom = zoom;
  }

  setViewport(x: number, y: number) {
    this._viewport = { x, y };
  }

  // ============ NODE METHODS ============
  
  addNode(node: EditorNode) {
    this._nodes.push(node);
  }

  updateNodePosition(nodeId: string, position: NodePosition) {
    const node = this._nodes.find(n => n.id === nodeId);
    if (node) {
      node.position = position;
    }
  }

  updateNodeName(nodeId: string, customName: string) {
    const node = this._nodes.find(n => n.id === nodeId);
    if (node) {
      node.customName = customName;
    }
  }

  updateNodeField<T extends keyof EditorNode>(nodeId: string, field: T, value: EditorNode[T]) {
    const node = this._nodes.find(n => n.id === nodeId);
    if (node) {
      node[field] = value;
    }
  }

  updateNodeStatus(nodeId: string, status: NodeStatus) {
    const node = this._nodes.find(n => n.id === nodeId);
    if (node) {
      node.status = status;
    }
  }

  updateNodeEnabled(nodeId: string, isEnabled: boolean) {
    const node = this._nodes.find(n => n.id === nodeId);
    if (node) {
      node.isEnabled = isEnabled;
      if (!isEnabled) {
        node.status = NodeStatus.OFFLINE;
      }
    }
  }

  updateNodeOffsets(nodeId: string, offsets: {
    temperatureOffset?: number;
    emiOffset?: number;
    vibrationOffset?: number;
    dustOffset?: number;
  }) {
    const node = this._nodes.find(n => n.id === nodeId);
    if (node) {
      if (offsets.temperatureOffset !== undefined) node.temperatureOffset = offsets.temperatureOffset;
      if (offsets.emiOffset !== undefined) node.emiOffset = offsets.emiOffset;
      if (offsets.vibrationOffset !== undefined) node.vibrationOffset = offsets.vibrationOffset;
      if (offsets.dustOffset !== undefined) node.dustOffset = offsets.dustOffset;
    }
  }

  removeNode(nodeId: string) {
    this._nodes = this._nodes.filter(n => n.id !== nodeId);
    this._edges = this._edges.filter(e => e.source !== nodeId && e.target !== nodeId);
    if (this._selectedNodeId === nodeId) {
      this._selectedNodeId = null;
    }
  }

  // ============ EDGE METHODS ============
  
  addEdge(edge: EditorEdge) {
    this._edges.push(edge);
  }

  updateEdge(edgeId: string, data: Partial<EditorEdge>) {
    const edge = this._edges.find(e => e.id === edgeId);
    if (edge) {
      if (data.lengthM !== undefined) edge.lengthM = data.lengthM;
      if (data.cableId !== undefined) edge.cableId = data.cableId;
      if (data.cableInfo !== undefined) edge.cableInfo = data.cableInfo;
      if (data.bandwidthMbps !== undefined) edge.bandwidthMbps = data.bandwidthMbps;
      if (data.isActive !== undefined) edge.isActive = data.isActive;
      if (data.status !== undefined) edge.status = data.status;
    }
  }

  updateEdgeBandwidth(edgeId: string, bandwidthMbps: number) {
    const edge = this._edges.find(e => e.id === edgeId);
    if (edge) {
      edge.bandwidthMbps = bandwidthMbps;
    }
  }

  updateEdgeActive(edgeId: string, isActive: boolean) {
    const edge = this._edges.find(e => e.id === edgeId);
    if (edge) {
      edge.isActive = isActive;
    }
  }

  removeEdge(edgeId: string) {
    this._edges = this._edges.filter(e => e.id !== edgeId);
    if (this._selectedEdgeId === edgeId) {
      this._selectedEdgeId = null;
    }
  }

  // ============ SELECTION METHODS ============
  
  selectNode(nodeId: Nullable<string>) {
    this._selectedNodeId = nodeId;
    this._selectedEdgeId = null;
    this._selectedCableId = null;
  }

  selectEdge(edgeId: Nullable<string>) {
    this._selectedEdgeId = edgeId;
    this._selectedNodeId = null;
    this._selectedCableId = null;
  }

  selectCable(cableId: Nullable<string>) {
    this._selectedCableId = cableId;
    this._selectedNodeId = null;
    this._selectedEdgeId = null;
  }

  clearSelection() {
    this._selectedNodeId = null;
    this._selectedEdgeId = null;
    this._selectedCableId = null;
  }

  // ============ UTILITY METHODS ============
  
  setLoading(loading: boolean) {
    this._isLoading = loading;
  }

  setValidationErrors(errors: any[]) {
    this._validationErrors = errors;
  }

  clearEditor() {
    this._nodes = [];
    this._edges = [];
    this._selectedNodeId = null;
    this._selectedEdgeId = null;
    this._selectedCableId = null;
    this._validationErrors = [];
    this._currentSchemaId = null;
    this._schemaName = "";
  }

  // ============ BULK OPERATIONS ============
  
  loadSchema(schemaId: string, schemaName: string, nodes: EditorNode[], edges: EditorEdge[]) {
    this._currentSchemaId = schemaId;
    this._schemaName = schemaName;
    this._nodes = nodes;
    this._edges = edges;
    this._selectedNodeId = null;
    this._selectedEdgeId = null;
    this._validationErrors = [];
  }

  getNodeById(nodeId: string): EditorNode | undefined {
    return this._nodes.find(n => n.id === nodeId);
  }

  getEdgeById(edgeId: string): EditorEdge | undefined {
    return this._edges.find(e => e.id === edgeId);
  }

  getEdgesByNode(nodeId: string): EditorEdge[] {
    return this._edges.filter(e => e.source === nodeId || e.target === nodeId);
  }

  get initialEdges(): EditorEdge[] {
    return this._edges;
  }

  // Метод для обновления состояния порта
  updatePortConnection(nodeId: string, portId: string, isConnected: boolean) {
    console.log("updatePortConnection:", nodeId, portId, isConnected);
    const node = this._nodes.find(n => n.id === nodeId);
    if (node && node.ports) {
      const port = node.ports.find(p => p.id === portId);
      if (port) {
        port.isConnected = isConnected;
        console.log(`Port ${portId} on node ${nodeId} set to ${isConnected}`);
      } else {
        console.log(`Port ${portId} not found on node ${nodeId}`);
      }
    } else {
      console.log(`Node ${nodeId} not found or has no ports`);
    }
  }

  // Метод для добавления портов к устройству
  addPortsToNode(nodeId: string, ports: Port[]) {
    const node = this._nodes.find(n => n.id === nodeId);
    if (node) {
      node.ports = ports;
    }
  }

  // Метод для обновления кабеля
  updateCableLength(cableId: string, lengthM: number) {
    const cable = this._edges.find(e => e.id === cableId);
    if (cable) {
      cable.lengthM = lengthM;
    }
  }

  // Метод для получения всех связей узла
  getNodeConnections(nodeId: string): EditorEdge[] {
    return this._edges.filter(e => e.sourceNodeId === nodeId || e.targetNodeId === nodeId);
  }

  // Метод для получения связей по порту
  getPortConnections(portId: string): EditorEdge[] {
    return this._edges.filter(e => e.source === portId || e.target === portId);
  }
}

export default EditorStore;
