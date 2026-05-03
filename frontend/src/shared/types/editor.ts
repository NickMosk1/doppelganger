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

export interface CableInfo {
  id: string;
  name: string;
  type: string;
  maxLengthM: number;
  attenuationDbPerKm: number;
};

export interface EditorEdge {
  id: string;
  source: string;
  target: string;
  cableId?: string;
  cableInfo?: CableInfo;
  lengthM: number;
};
