// src/shared/types/schema.ts

import { CableTypes, ConnectionType, DeviceTypes, EditorNodes } from "./index";

export interface SchemaNodeDevice {
  id: string;
  name: string;
  type: DeviceTypes;
  manufacturer: string;
  baseLatencyMs?: number;
  maxThroughputMbps?: number;
  portCount?: number;
  tempCoefficient?: number;
  emiCoefficient?: number;
  vibrationCoefficient?: number;
  dustCoefficient?: number;
  maxOperatingTemp?: number;
  minOperatingTemp?: number;
  maxEmiTolerance?: number;
  maxVibrationTolerance?: number;
  mtbfHours?: number;
  mttrMinutes?: number;
  warmUpTimeSeconds?: number;
  replacementCost?: number;
  repairCost?: number;
  powerConsumptionWatts?: number;
  heatGenerationWatts?: number;
  ipRating?: string;
  operatingHumidityMax?: number;
  needsCooling?: boolean;
  hasRedundantPower?: boolean;
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

// ============ Schema Node (расширенный) ============
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
    portCount?: number;
    tempCoefficient?: number;
    emiCoefficient?: number;
    vibrationCoefficient?: number;
    dustCoefficient?: number;
    maxOperatingTemp?: number;
    minOperatingTemp?: number;
    maxEmiTolerance?: number;
    maxVibrationTolerance?: number;
    mtbfHours?: number;
    mttrMinutes?: number;
    warmUpTimeSeconds?: number;
    replacementCost?: number;
    repairCost?: number;
    powerConsumptionWatts?: number;
    heatGenerationWatts?: number;
    ipRating?: string;
    operatingHumidityMax?: number;
    needsCooling?: boolean;
    hasRedundantPower?: boolean;
  };
  
  // Для CABLE
  cableLengthM?: number;
  cableType?: string;
  bandwidthMbps?: number;
  propagationSpeed?: number;
  bendingRadiusMm?: number;
  tensileStrengthN?: number;
  operatingTensionMaxN?: number;
  impedanceOhms?: number;
  coreDiameterUm?: number;
  capacitancePerKmNf?: number;
  resistancePerKmOhms?: number;
  maxFrequencyMhz?: number;
  signalToNoiseRatioDb?: number;
  immunityRating?: number;
  temperatureRating?: number;
  shieldingType?: number;
  oilResistance?: boolean;
  uvResistance?: boolean;
  chemicalResistance?: string;
  expectedLifetimeYears?: number;
  degradationRatePerYear?: number;
  
  // Для FACTOR (расширенный объект factor)
  factor?: {
    factorType: string;
    factorValue: number;
    factorUnit: string;
    factorRadius: number;
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
  };
  
  // Устаревшие поля (для обратной совместимости)
  lengthM?: number;
  factorType?: string;
  factorValue?: number;
  factorUnit?: string;
  factorRadius?: number;
}

// ============ Schema Connection ============
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

// ============ Schema Full ============
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

// ============ Schema Summary ============
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

// ============ Schema Stats ============
export interface SchemaStats {
  nodesCount: number;
  connectionsCount: number;
  depth: number;
  devicesCount: number;
  cablesCount: number;
  factorsCount: number;
  subschemasCount: number;
}
