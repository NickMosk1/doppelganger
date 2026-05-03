import { DeviceTypes, CableTypes } from "./catalog";
import { EditorNodes } from "./editor";

export enum NodeStatus {
  OPERATIONAL = "OPERATIONAL",
  DEGRADED = "DEGRADED",
  FAILED = "FAILED",
  OVERHEATING = "OVERHEATING",
};

export interface SchemaNodeDevice {
  id: string;
  name: string;
  type: DeviceTypes;
  manufacturer: string;
  baseLatencyMs?: number;
  maxThroughputMbps?: number;
};

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
};

export interface SchemaConnectionCable {
  id: string;
  name: string;
  type: CableTypes;
  maxLengthM?: number;
  attenuationDbPerKm?: number;
};

export interface SchemaNodeRef {
  id: string;
  customName: string;
  nodeType?: EditorNodes;
};

export interface SchemaConnection {
  id: string;
  lengthM: number;
  bandwidthMbps?: number;
  sourceNode: SchemaNodeRef;
  targetNode: SchemaNodeRef;
  cable: SchemaConnectionCable;
};

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
};

export interface SchemaSummary {
  id: string;
  name: string;
  description: string;
  depth: number;
  isPublic: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  nodesCount?: number;
  connectionsCount?: number;
};

export interface SchemaStats {
  nodesCount: number;
  connectionsCount: number;
  depth: number;
  devicesCount: number;
  subschemasCount: number;
};
