import { makeAutoObservable } from "mobx";
import { EditorEdge, EditorNode, NodePosition } from "../shared";
import { Nullable } from "../utils";

class EditorStore {
  private _nodes: EditorNode[] = [];
  private _edges: EditorEdge[] = [];
  private _selectedNodeId: Nullable<string> = null;
  private _selectedEdgeId: Nullable<string> = null;
  private _selectedCableId: Nullable<string> = null;
  private _isLoading: boolean = false;
  private _validationErrors: any[] = [];

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

  setNodes(nodes: EditorNode[]) {
    this._nodes = nodes;
  }

  setEdges(edges: EditorEdge[]) {
    this._edges = edges;
  }

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

  removeNode(nodeId: string) {
    this._nodes = this._nodes.filter(n => n.id !== nodeId);
    this._edges = this._edges.filter(e => e.source !== nodeId && e.target !== nodeId);
    if (this._selectedNodeId === nodeId) {
      this._selectedNodeId = null;
    }
  }

  addEdge(edge: EditorEdge) {
    this._edges.push(edge);
  }

  updateEdge(edgeId: string, data: Partial<EditorEdge>) {
    const edge = this._edges.find(e => e.id === edgeId);
    if (edge) {
      if (data.lengthM !== undefined) edge.lengthM = data.lengthM;
      if (data.cableId !== undefined) edge.cableId = data.cableId;
      if (data.cableInfo !== undefined) edge.cableInfo = data.cableInfo;
    }
  }

  removeEdge(edgeId: string) {
    this._edges = this._edges.filter(e => e.id !== edgeId);
    if (this._selectedEdgeId === edgeId) {
      this._selectedEdgeId = null;
    }
  }

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
  }
}

export default EditorStore;
