// src/shared/types/schema.ts

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

export interface SchemaNode {
  id: string;
  customName: string;
  nodeType: string;
  positionX: number;
  positionY: number;
  
  // Для DEVICE (расширенный объект device)
  device?: {
    id: string;
    name: string;
    type: string;
    manufacturer: string;
    baseLatencyMs?: number;
    maxThroughputMbps?: number;
  };
  
  // Для CABLE
  cableLengthM?: number;
  cableType?: string;
  bandwidthMbps?: number;
  
  // Для FACTOR (новый объект factor)
  factor?: {
    factorType: string;
    factorValue: number;
    factorUnit: string;
    factorRadius: number;
  };
  
  // Устаревшие поля (для обратной совместимости, можно удалить позже)
  lengthM?: number;
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
  sourcePortId?: string;
  targetPortId?: string;
  connectionType: ConnectionType;
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
  factorsCount?: number;
  connectionsCount?: number;
}

export interface SchemaStats {
  nodesCount: number;
  connectionsCount: number;
  depth: number;
  devicesCount: number;
  cablesCount: number;
  factorsCount: number;
  subschemasCount: number;
}
