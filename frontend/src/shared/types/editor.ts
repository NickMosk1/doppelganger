// src/shared/types/editor.ts

export interface NodePosition {
  x: number;
  y: number;
}

export enum EditorNodes {
  DEVICE = "DEVICE",
  SUBSCHEMA = "SUBSCHEMA",
  CABLE = "CABLE",
  FACTOR = "FACTOR",
}

export enum EdgeStatus {
  ACTIVE = "ACTIVE",
  DEGRADED = "DEGRADED",
  FAILED = "FAILED",
  OVERLOADED = "OVERLOADED",
}

export enum NodeStatus {
  OPERATIONAL = "OPERATIONAL",
  DEGRADED = "DEGRADED",
  FAILED = "FAILED",
  OVERHEATING = "OVERHEATING",
  OFFLINE = "OFFLINE",
}

export enum PortType {
  INPUT = "INPUT",
  OUTPUT = "OUTPUT",
  ETHERNET = "ETHERNET",
  FIBER = "FIBER",
  SERIAL = "SERIAL",
}

export interface Port {
  id: string;
  name: string;
  type: PortType;
  speed?: number;
  isConnected: boolean;
  position?: NodePosition;
}

export interface CableInfo {
  id: string;
  name: string;
  type: string;
  maxLengthM: number;
  attenuationDbPerKm: number;
  pricePerMeter?: number;
  immunityRating?: number;
  temperatureRating?: number;
  icon?: string;
}

// Типы связей
export enum ConnectionType {
  CABLE_DEVICE = "CABLE_DEVICE",
  FACTOR_ELEMENT = "FACTOR_ELEMENT",
}

export interface FactorConnectionData {
  factorId: string;
  factorType: string;
  distance: number;
  attenuation: number;
}

export interface EditorEdge {
  id: string;
  source: string;
  target: string;
  sourceNodeId: string;
  targetNodeId: string;
  connectionType: ConnectionType;
  
  // Для CABLE_DEVICE
  lengthM?: number;
  bandwidthMbps?: number;
  cableId?: string;
  cableInfo?: CableInfo;
  status?: EdgeStatus;
  
  // Для FACTOR_ELEMENT
  factorData?: {
    factorId: string;
    factorType: string;
    distance: number;
    attenuation: number;
  };
  
  isActive?: boolean;
}

// src/shared/types/editor.ts

export interface EditorNode {
  id: string;
  type: EditorNodes;
  
  // Базовые поля
  name: string;
  customName?: string;
  position: NodePosition;
  
  // Статус и состояние
  status?: NodeStatus;
  isEnabled?: boolean;
  
  // Для DEVICE
  deviceId?: string;
  device?: {
    id: string;
    name: string;
    type: string;
    manufacturer: string;
    baseLatencyMs?: number;
    maxThroughputMbps?: number;
  };
  ports?: Port[];
  baseLatencyMs?: number;
  maxThroughputMbps?: number;
  manufacturer?: string;
  
  // Для CABLE
  lengthM?: number;
  cableLengthM?: number;
  cableType?: string;
  bandwidthMbps?: number;
  
  // Для FACTOR
  factor?: {
    factorType: string;
    factorValue: number;
    factorUnit: string;
    factorRadius: number;
  };

  deviceType?: string;
  
  // 🔧 ДОБАВИТЬ: Прямые поля для FACTOR (для удобства работы)
  factorType?: string;
  factorValue?: number;
  factorUnit?: string;
  factorRadius?: number;
  
  // Для SUBSCHEMA
  schemaId?: string;
  
  // Промышленные смещения (для всех типов)
  temperatureOffset?: number;
  emiOffset?: number;
  vibrationOffset?: number;
  dustOffset?: number;
  
  // Визуальные
  icon?: string;
  color?: string;
  
  // Флаги
  isCustom?: boolean;
}

// Для обратной совместимости с CableNode
export interface CableNode extends EditorNode {
  type: EditorNodes.CABLE;
  sourcePortId: string;
  targetPortId: string;
  sourceNodeId: string;
  targetNodeId: string;
  cableId?: string;
  lengthM: number;
  bandwidthMbps?: number;
}

export interface UpdateFullSchemaRequest {
  name: string;
  description: string;
  nodes: EditorNode[];
  edges: EditorEdge[];
}
