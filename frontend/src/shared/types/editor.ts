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

// ============ EDITOR NODE ============
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

  deviceType?: string;
  
  // ============ ДЛЯ DEVICE ============
  deviceId?: string;
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
  ports?: Port[];
  
  // Переопределяемые параметры
  baseLatencyMs?: number;
  maxThroughputMbps?: number;
  manufacturer?: string;
  portCount?: number;
  
  // Промышленные коэффициенты
  tempCoefficient?: number;
  emiCoefficient?: number;
  vibrationCoefficient?: number;
  dustCoefficient?: number;
  
  // Допустимые диапазоны
  maxOperatingTemp?: number;
  minOperatingTemp?: number;
  maxEmiTolerance?: number;
  maxVibrationTolerance?: number;
  
  // Надежность
  mtbfHours?: number;
  mttrMinutes?: number;
  warmUpTimeSeconds?: number;
  
  // Экономические показатели
  replacementCost?: number;
  repairCost?: number;
  
  // Энергопотребление и защита
  powerConsumptionWatts?: number;
  heatGenerationWatts?: number;
  ipRating?: string;
  operatingHumidityMax?: number;
  needsCooling?: boolean;
  hasRedundantPower?: boolean;
  
  // ============ ДЛЯ CABLE ============
  lengthM?: number;
  cableLengthM?: number;
  cableType?: string;
  bandwidthMbps?: number;
  
  // 👇 ДОБАВИТЬ ЭТИ ПОЛЯ
  maxLengthM?: number;              // максимальная длина
  attenuationDbPerKm?: number;      // затухание дБ/км
  propagationSpeed?: number;        // скорость распространения
  bendingRadiusMm?: number;         // мин. радиус изгиба
  tensileStrengthN?: number;        // прочность на разрыв
  operatingTensionMaxN?: number;    // макс. рабочее натяжение
  
  // Электрические/оптические параметры
  impedanceOhms?: number;
  coreDiameterUm?: number;
  capacitancePerKmNf?: number;
  resistancePerKmOhms?: number;
  
  // Частотные характеристики
  maxFrequencyMhz?: number;
  signalToNoiseRatioDb?: number;
  
  // Промышленная устойчивость кабеля
  immunityRating?: number;
  temperatureRating?: number;
  shieldingType?: number;
  oilResistance?: boolean;
  uvResistance?: boolean;
  chemicalResistance?: string;
  
  // Срок службы кабеля
  expectedLifetimeYears?: number;
  degradationRatePerYear?: number;
  
  // ============ ДЛЯ FACTOR ============
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
  
  // Прямые поля для FACTOR
  factorType?: string;
  factorValue?: number;
  factorUnit?: string;
  factorRadius?: number;
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
  
  // ============ ДЛЯ SUBSCHEMA ============
  schemaId?: string;
  
  // ============ ПРОМЫШЛЕННЫЕ СМЕЩЕНИЯ ============
  temperatureOffset?: number;
  emiOffset?: number;
  vibrationOffset?: number;
  dustOffset?: number;
  
  // ============ ВИЗУАЛЬНЫЕ ============
  icon?: string;
  color?: string;
  
  // ============ ФЛАГИ ============
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
