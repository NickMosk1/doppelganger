export interface NodePosition {
  x: number;
  y: number;
};

export enum EditorNodes {
  DEVICE = "DEVICE",
  SUBSCHEMA = "SUBSCHEMA",
  CABLE = "CABLE",
};

export enum EdgeStatus {
  ACTIVE = "ACTIVE",
  DEGRADED = "DEGRADED",
  FAILED = "FAILED",
  OVERLOADED = "OVERLOADED",
};

export enum NodeStatus {
  OPERATIONAL = "OPERATIONAL",
  DEGRADED = "DEGRADED",
  FAILED = "FAILED",
  OVERHEATING = "OVERHEATING",
  OFFLINE = "OFFLINE",
};

export enum PortType {
  INPUT = "INPUT",
  OUTPUT = "OUTPUT",
  ETHERNET = "ETHERNET",
  FIBER = "FIBER",
  SERIAL = "SERIAL",
};

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
};

export interface CableNode extends EditorNode {
  type: EditorNodes.CABLE;
  sourcePortId: string;
  targetPortId: string;
  sourceNodeId: string;
  targetNodeId: string;
  cableId?: string;
  lengthM: number;
  bandwidthMbps?: number;
};

export interface EditorNode {
  id: string;
  type: EditorNodes;
  deviceId?: string;
  schemaId?: string;
  name: string;
  position: NodePosition;
  customName?: string;
  status?: NodeStatus;
  isEnabled?: boolean;
  ports?: Port[];
  
  // Для кабелей
  lengthM?: number;
  cableType?: string;
  
  // Промышленные факторы
  temperatureOffset?: number;
  emiOffset?: number;
  vibrationOffset?: number;
  dustOffset?: number;
  
  // Параметры устройства
  baseLatencyMs?: number;
  maxThroughputMbps?: number;
  icon?: string;
  color?: string;
};

export interface EditorEdge {
  id: string;
  source: string;
  target: string;
  sourceNodeId: string; // ID узла-источника (добавляем)
  targetNodeId: string; // ID узла-назначения (добавляем)
  cableId?: string;
  cableInfo?: CableInfo;
  lengthM: number;

  // Параметры соединения
  bandwidthMbps?: number;        // Пропускная способность (Мбит/с)
  latencyMs?: number;            // Задержка на этом соединении (мс)
  packetLossPercent?: number;    // Потери пакетов (%)

  // Статус соединения
  isActive?: boolean;
  status?: EdgeStatus;
};

export interface Port {
  id: string;
  name: string;
  type: PortType;
  speed?: number; // Мбит/с
  isConnected: boolean;
  position?: NodePosition; // Относительная позиция на ноде
};
