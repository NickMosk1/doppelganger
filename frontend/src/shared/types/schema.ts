import { CableTypes, DeviceTypes, EditorNodes, NodeStatus } from "./index";

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

export interface SchemaConnection {
  id: string;
  lengthM: number;
  bandwidthMbps?: number;
  sourceNode: SchemaNodeRef;
  targetNode: SchemaNodeRef;
  cable: SchemaConnectionCable;
  sourcePortId?: string;  // Добавлено
  targetPortId?: string;  // Добавлено
}

export interface SchemaNode {
  id: string;
  customName: string;
  nodeType: EditorNodes;
  positionX: number;
  positionY: number;
  device?: SchemaNodeDevice;
  childSchemaId?: string;
  isEnabled?: boolean;
  status?: NodeStatus;
  temperatureOffset?: number;
  emiOffset?: number;
  vibrationOffset?: number;
  
  // Поля для кабелей
  cableLengthM?: number;
  cableType?: string;
  name?: string;
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
