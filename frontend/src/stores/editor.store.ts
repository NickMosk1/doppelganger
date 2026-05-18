import { makeAutoObservable } from "mobx";
import { ConnectionType, EditorEdge, EditorNode, EditorNodes, NodePosition, NodeStatus, Port } from "../shared";
import { Nullable } from "../utils";

class EditorStore {
  private _nodes: EditorNode[] = [];
  private _edges: EditorEdge[] = [];
  private _selectedNodeId: Nullable<string> = null;
  private _selectedEdgeId: Nullable<string> = null;
  private _selectedCableId: Nullable<string> = null;
  private _hoveredEdgeId: Nullable<string> = null;
  private _isLoading: boolean = false;
  private _validationErrors: any[] = [];

  // Дополнительные поля для редактора
  private _currentSchemaId: Nullable<string> = null;
  private _schemaName: string = "";
  private _zoom: number = 1;
  private _viewport: { x: number; y: number } = { x: 0, y: 0 };

  private _startPointId: Nullable<string> = null;
  private _endPointId: Nullable<string> = null;

  get startPointId() {
    return this._startPointId;
  }

  get endPointId() {
    return this._endPointId;
  }

  get hasStartAndEndPoints(): boolean {
    return this._startPointId !== null && this._endPointId !== null;
  }

  // EditorStore.ts
  setStartPoint(nodeId: string) {
    this._startPointId = nodeId;
    console.log("📍 Start point set to:", nodeId);
  }

  setEndPoint(nodeId: string) {
    this._endPointId = nodeId;
    console.log("🎯 End point set to:", nodeId);
  }

  clearPoints() {
    this._startPointId = null;
    this._endPointId = null;
    console.log("✗ Points cleared");
  }

  constructor() {
    makeAutoObservable(this);
  }

  get hoveredEdgeId() {
    return this._hoveredEdgeId;
  }

  setHoveredEdgeId(id: Nullable<string>) {
    this._hoveredEdgeId = id;
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

  // ============ EDGE METHODS ============

  updateEdge(edgeId: string, data: Partial<EditorEdge>) {
    const edge = this._edges.find(e => e.id === edgeId);
    if (edge) {
      // Применяем все переданные поля
      Object.assign(edge, data);
      
      // Обработка специфичных для FACTOR_ELEMENT полей
      if (data.factorData && edge.factorData) {
        edge.factorData = { ...edge.factorData, ...data.factorData };
      }
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

  // ============ SELECTION METHODS ============

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
    this._hoveredEdgeId = null;
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

  // Метод для получения связей по порту
  getEdgeByPort(nodeId: string, portId: string): EditorEdge | undefined {
    return this._edges.find(
      e => (e.sourceNodeId === nodeId && e.source === portId) ||
          (e.targetNodeId === nodeId && e.target === portId)
    );
  }

    canCreateEdge(sourceNodeId: string, sourcePortId: string, targetNodeId: string, targetPortId: string): boolean {
    // 1. Нельзя соединять узел с самим собой
    if (sourceNodeId === targetNodeId) {
      console.warn("Cannot connect node to itself");
      return false;
    }
    
    // 2. Проверяем, не занят ли порт источника
    const sourcePortOccupied = this.isPortConnected(sourceNodeId, sourcePortId);
    if (sourcePortOccupied) {
      console.warn("Source port is already connected");
      return false;
    }
    
    // 3. Проверяем, не занят ли порт назначения
    const targetPortOccupied = this.isPortConnected(targetNodeId, targetPortId);
    if (targetPortOccupied) {
      console.warn("Target port is already connected");
      return false;
    }
    
    // 4. Проверяем, не существует ли уже такой связи
    const edgeExists = this._edges.some(e => 
      (e.source === sourcePortId && e.target === targetPortId) ||
      (e.source === targetPortId && e.target === sourcePortId)
    );
    if (edgeExists) {
      console.warn("Edge already exists");
      return false;
    }
    
    return true;
  }

  // Проверка, занят ли порт
  isPortConnected(nodeId: string, portId: string): boolean {
    const node = this._nodes.find(n => n.id === nodeId);
    if (!node || !node.ports) return false;
    
    const port = node.ports.find(p => p.id === portId);
    return port?.isConnected || false;
  }

  // Добавление связи (только локально, без API)
  addEdge(edge: EditorEdge): boolean {
    // Проверяем, не существует ли уже такой связи
    const existingEdge = this._edges.find(
      e => (e.sourceNodeId === edge.sourceNodeId && e.targetNodeId === edge.targetNodeId) ||
          (e.sourceNodeId === edge.targetNodeId && e.targetNodeId === edge.sourceNodeId)
    );
    
    if (existingEdge) {
      console.warn("⚠️ Edge already exists between these nodes");
      return false;
    }
    
    // Для CABLE_DEVICE проверяем занятость портов
    if (edge.connectionType === ConnectionType.CABLE_DEVICE) {
      const sourcePortOccupied = this.isPortConnected(edge.sourceNodeId, edge.source);
      const targetPortOccupied = this.isPortConnected(edge.targetNodeId, edge.target);
      
      if (sourcePortOccupied || targetPortOccupied) {
        console.warn("⚠️ Port already connected! Source:", sourcePortOccupied, "Target:", targetPortOccupied);
        return false;
      }
    }
    
    // Для FACTOR_ELEMENT не проверяем занятость портов (у факторов нет портов)
    // И разрешаем множественные связи с одним фактором
    if (edge.connectionType === ConnectionType.FACTOR_ELEMENT) {
      // Проверяем только на дублирование
      const existing = this._edges.some(
        e => e.connectionType === ConnectionType.FACTOR_ELEMENT &&
            e.sourceNodeId === edge.sourceNodeId &&
            e.targetNodeId === edge.targetNodeId
      );
      if (existing) {
        console.warn("⚠️ Factor already connected to this element");
        return false;
      }
    }
    
    this._edges.push(edge);
    console.log("✅ Edge added successfully");
    return true;
  }

  // Обновление состояния порта
  updatePortConnection(nodeId: string, portId: string, isConnected: boolean) {
    const node = this._nodes.find(n => n.id === nodeId);
    if (node && node.ports) {
      const port = node.ports.find(p => p.id === portId);
      if (port) {
        port.isConnected = isConnected;
      }
    }
  }

  removeEdge(edgeId: string) {
    console.log("🗑️ EditorStore.removeEdge called:", edgeId);
    
    const edge = this._edges.find(e => e.id === edgeId);
    if (!edge) {
      console.log("⚠️ Edge not found:", edgeId);
      return;
    }
    
    // Освобождаем порты
    this.updatePortConnection(edge.sourceNodeId, edge.source, false);
    this.updatePortConnection(edge.targetNodeId, edge.target, false);
    
    // Удаляем
    const before = this._edges.length;
    this._edges = this._edges.filter(e => e.id !== edgeId);
    console.log(`📊 Edges: ${before} → ${this._edges.length}`);
    
    if (this._selectedEdgeId === edgeId) {
      this._selectedEdgeId = null;
    }
  }

  removeNode(nodeId: string) {
    console.log("🗑️ EditorStore.removeNode called:", nodeId);
    
    // Находим все связи
    const connectedEdges = this._edges.filter(e => 
      e.sourceNodeId === nodeId || e.targetNodeId === nodeId
    );
    console.log(`📊 Found ${connectedEdges.length} connected edges`);
    
    // Удаляем связи (освобождая порты)
    connectedEdges.forEach(edge => {
      if (edge.sourceNodeId === nodeId) {
        this.updatePortConnection(edge.targetNodeId, edge.target, false);
      } else {
        this.updatePortConnection(edge.sourceNodeId, edge.source, false);
      }
    });
    
    // Удаляем связи
    const beforeEdges = this._edges.length;
    this._edges = this._edges.filter(e => 
      e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId
    );
    console.log(`📊 Edges: ${beforeEdges} → ${this._edges.length}`);
    
    // Удаляем узел
    const beforeNodes = this._nodes.length;
    this._nodes = this._nodes.filter(n => n.id !== nodeId);
    console.log(`📊 Nodes: ${beforeNodes} → ${this._nodes.length}`);
    
    if (this._selectedNodeId === nodeId) {
      this._selectedNodeId = null;
    }
  }

  // Геттер для проверки выделен ли узел
  isNodeSelected(nodeId: string): boolean {
    return this._selectedNodeId === nodeId;
  }

  // Геттер для проверки выделено ли ребро
  isEdgeSelected(edgeId: string): boolean {
    return this._selectedEdgeId === edgeId;
  }

  selectNode(nodeId: string | null) {
    console.log("🎯 selectNode called:", nodeId);
    console.log("Previous selectedNodeId:", this._selectedNodeId);
    this._selectedNodeId = nodeId;
    this._selectedEdgeId = null;
    this._selectedCableId = null;
    console.log("New selectedNodeId:", this._selectedNodeId);
  }

  selectEdge(edgeId: string | null) {
    console.log("🎯 selectEdge called:", edgeId);
    console.log("Previous selectedEdgeId:", this._selectedEdgeId);
    this._selectedEdgeId = edgeId;
    this._selectedNodeId = null;
    this._selectedCableId = null;
    console.log("New selectedEdgeId:", this._selectedEdgeId);
  }

  setPortConnection(nodeId: string, portId: string, isConnected: boolean) {
    const node = this._nodes.find(n => n.id === nodeId);
    if (node && node.ports) {
      const port = node.ports.find(p => p.id === portId);
      if (port) {
        port.isConnected = isConnected;
      }
    }
  }

  updateNode(nodeId: string, updates: Partial<EditorNode>) {
    console.log(`🔄 updateNode: ${nodeId}`, updates);
    const node = this._nodes.find(n => n.id === nodeId);
    if (!node) {
      console.warn(`Node ${nodeId} not found`);
      return;
    }
    
    // Обновляем все переданные поля
    Object.keys(updates).forEach(key => {
      const field = key as keyof EditorNode;
      (node as any)[field] = updates[field];
    });
    
    // Специальная обработка для FACTOR: синхронизируем корень и вложенный объект
    if (node.type === EditorNodes.FACTOR) {
      // Создаем factor объект если его нет
      if (!node.factor) {
        node.factor = {
          factorType: node.factorType || "TEMPERATURE",
          factorValue: node.factorValue ?? 0,
          factorUnit: node.factorUnit || "",
          factorRadius: node.factorRadius ?? 10,
        };
      }
      
      // Синхронизация: корень -> factor
      if (updates.factorType !== undefined) {
        node.factor.factorType = updates.factorType;
      }
      if (updates.factorValue !== undefined) {
        node.factor.factorValue = updates.factorValue;
      }
      if (updates.factorUnit !== undefined) {
        node.factor.factorUnit = updates.factorUnit;
      }
      if (updates.factorRadius !== undefined) {
        node.factor.factorRadius = updates.factorRadius;
      }
      
      // Синхронизация: factor -> корень (если обновились через вложенный объект)
      if (updates.factor?.factorType !== undefined) {
        node.factorType = updates.factor.factorType;
      }
      if (updates.factor?.factorValue !== undefined) {
        node.factorValue = updates.factor.factorValue;
      }
      if (updates.factor?.factorUnit !== undefined) {
        node.factorUnit = updates.factor.factorUnit;
      }
      if (updates.factor?.factorRadius !== undefined) {
        node.factorRadius = updates.factor.factorRadius;
      }
    }
    
    // Специальная обработка для DEVICE: синхронизируем корень и device объект
    if (node.type === EditorNodes.DEVICE) {
      if (!node.device) {
        node.device = {
          id: node.id,
          name: node.name,
          type: node.deviceType || "CUSTOM",
          manufacturer: node.manufacturer || "",
        };
      }
      
      if (updates.baseLatencyMs !== undefined) {
        node.device.baseLatencyMs = updates.baseLatencyMs;
      }
      if (updates.maxThroughputMbps !== undefined) {
        node.device.maxThroughputMbps = updates.maxThroughputMbps;
      }
      
      // Обратная синхронизация
      if (updates.device?.baseLatencyMs !== undefined) {
        node.baseLatencyMs = updates.device.baseLatencyMs;
      }
      if (updates.device?.maxThroughputMbps !== undefined) {
        node.maxThroughputMbps = updates.device.maxThroughputMbps;
      }
    }
    
    // Для CABLE
    if (node.type === EditorNodes.CABLE) {
      if (updates.lengthM !== undefined) {
        node.lengthM = updates.lengthM;
        node.cableLengthM = updates.lengthM; // синхронизация
      }
      if (updates.cableLengthM !== undefined) {
        node.lengthM = updates.cableLengthM;
        node.cableLengthM = updates.cableLengthM;
      }
      if (updates.customName !== undefined) {
        node.customName = updates.customName;
      }
      if (updates.bandwidthMbps !== undefined) {
        node.bandwidthMbps = updates.bandwidthMbps;
      }
    }
    
    console.log(`✅ Node updated: ${node.customName || node.name}`, {
      factorValue: node.factorValue,
      factor: node.factor,
    });
  }

  updateNodeField<T extends keyof EditorNode>(nodeId: string, field: T, value: EditorNode[T]) {
    console.log(`🔄 updateNodeField: ${nodeId}, ${String(field)} = ${value}`);
    
    // Для всех полей используем updateNode
    this.updateNode(nodeId, { [field]: value } as Partial<EditorNode>);
  }

  // Для обновления промышленных коэффициентов устройства
  updateDeviceCoefficients(nodeId: string, coefficients: {
    tempCoefficient?: number;
    emiCoefficient?: number;
    vibrationCoefficient?: number;
    dustCoefficient?: number;
  }) {
    const node = this._nodes.find(n => n.id === nodeId);
    if (node && node.type === EditorNodes.DEVICE) {
      if (coefficients.tempCoefficient !== undefined) node.tempCoefficient = coefficients.tempCoefficient;
      if (coefficients.emiCoefficient !== undefined) node.emiCoefficient = coefficients.emiCoefficient;
      if (coefficients.vibrationCoefficient !== undefined) node.vibrationCoefficient = coefficients.vibrationCoefficient;
      if (coefficients.dustCoefficient !== undefined) node.dustCoefficient = coefficients.dustCoefficient;
      
      // Синхронизация с device объектом
      if (node.device) {
        if (coefficients.tempCoefficient !== undefined) node.device.tempCoefficient = coefficients.tempCoefficient;
        if (coefficients.emiCoefficient !== undefined) node.device.emiCoefficient = coefficients.emiCoefficient;
        if (coefficients.vibrationCoefficient !== undefined) node.device.vibrationCoefficient = coefficients.vibrationCoefficient;
        if (coefficients.dustCoefficient !== undefined) node.device.dustCoefficient = coefficients.dustCoefficient;
      }
    }
  }

  // Для обновления динамических параметров фактора
  updateFactorDynamicParams(nodeId: string, params: {
    changeRatePerSecond?: number;
    minValue?: number;
    maxValue?: number;
    valueChangePattern?: string;
    frequencyHz?: number;
    startTimeSeconds?: number;
    durationSeconds?: number;
    falloffType?: string;
    falloffExponent?: number;
    warningThreshold?: number;
    criticalThreshold?: number;
    failureThreshold?: number;
    priority?: number;
  }) {
    const node = this._nodes.find(n => n.id === nodeId);
    if (node && node.type === EditorNodes.FACTOR) {
      Object.assign(node, params);
      
      // Синхронизация с factor объектом
      if (node.factor) {
        Object.assign(node.factor, params);
      }
    }
  }
}

export default EditorStore;
