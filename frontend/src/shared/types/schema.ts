import { CableTypes, ConnectionType, DeviceTypes, EditorNodes } from "./index";

export interface SchemaNodeDevice {
  id: string;
  name: string;
  type: DeviceTypes;
  manufacturer: string;
  baseLatencyMs?: number;
  maxThroughputMbps?: number;
}

export interface SchemaNodeRef {
  id: string;
  customName: string;
  nodeType?: EditorNodes;
}

export interface SchemaConnectionCable {
  id: string;
  name: string;
  type: CableTypes;
  maxLengthM?: number;
  attenuationDbPerKm?: number;
}

// src/services/editor.service.ts

export interface SchemaNode {
  id: string;
  customName: string;
  nodeType: string;
  positionX: number;
  positionY: number;
  device?: {
    id: string;
    name: string;
    type: string;
    manufacturer: string;
  };
  // Добавляем поля для кабелей
  lengthM?: number;
  cableType?: string;
  bandwidthMbps?: number;
  // Добавляем поля для факторов
  factorType?: string;
  factorValue?: number;
  factorUnit?: string;
  factorRadius?: number;
}

export interface SchemaConnection {
  id: string;
  lengthM: number;
  sourceNode: { id: string; customName: string };
  targetNode: { id: string; customName: string };
  cable?: { id: string; name: string; type: string };
  // Добавляем поля для портов
  sourcePortId?: string;
  targetPortId?: string;
  // Добавляем тип связи
  connectionType: ConnectionType;
  // Добавляем данные для FACTOR_ELEMENT
  factorData?: {
    factorId: string;
    factorType: string;
    distance: number;
    attenuation: number;
  };
}

export interface SchemaFull {
  id: string;
  name: string;
  description: string;
  depth: number;
  path: string;
  isPublic?: boolean;
  usageCount?: number;
  createdAt: string;
  updatedAt: string;
  nodes: SchemaNode[];
  connections: SchemaConnection[];
}

export interface SchemaSummary {
  id: string;
  name: string;
  description: string;
  depth: number;
  isPublic: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  devicesCount?: number;
  cablesCount?: number;
  connectionsCount?: number;
}

export interface SchemaStats {
  nodesCount: number;
  connectionsCount: number;
  depth: number;
  devicesCount: number;
  cablesCount: number;
  subschemasCount: number;
}
