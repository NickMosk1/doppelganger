import { NodeStatus } from "./schema";

export interface NodePosition {
  x: number;
  y: number;
};

export enum EditorNodes {
  DEVICE = "DEVICE",
  SUBSCHEMA = "SUBSCHEMA",
};

export interface EditorNode {
  id: string;
  type: EditorNodes;
  deviceId?: string;
  schemaId?: string;
  name: string;
  position: NodePosition;
  customName?: string;
};

export interface EditorEdge {
  id: string;
  source: string;
  target: string;
  cableId?: string;
  cableInfo?: CableInfo;
  lengthM: number;
};

export enum EdgeStatus {
  ACTIVE = "ACTIVE",
  DEGRADED = "DEGRADED",
  FAILED = "FAILED",
  OVERLOADED = "OVERLOADED",
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

export interface EditorNode {
  id: string;
  type: EditorNodes;
  deviceId?: string;
  schemaId?: string;
  name: string;
  position: NodePosition;
  customName?: string;
  
  // Статус и состояние
  status?: NodeStatus;
  isEnabled?: boolean;
  
  // Промышленные факторы (смещения для конкретного узла)
  temperatureOffset?: number;    // °C (добавка к глобальной температуре)
  emiOffset?: number;            // dBm (добавка к глобальным помехам)
  vibrationOffset?: number;      // Hz (добавка к глобальной вибрации)
  dustOffset?: number;           // mg/m³ (добавка к запыленности)
  
  // Параметры устройства
  baseLatencyMs?: number;
  maxThroughputMbps?: number;
  
  // Визуальные параметры
  icon?: string;
  color?: string;
};

export interface EditorEdge {
  id: string;
  source: string;
  target: string;
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
