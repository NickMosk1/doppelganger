export interface DeviceMetric {
  latencyMs: number;
  packetLossPercent: number;
  throughputMbps: number;
  temperature: number;
  emiLevel?: number;
  vibrationLevel?: number;
  dustLevel?: number;
  currentUtilizationPercent?: number;
  status: string;
  degradationCause?: string;
}

export interface CableMetric {
  cableId: string;
  cableName: string;
  packetLossPercent: number;
  throughputMbps: number;
  attenuationDb: number;
  bitErrorRate: number;
  status: string;
  degradationCause?: string;
}

export interface FactorValue {
  factorType: string;
  currentValue: number;
  severity: string;
}

export interface TimelinePoint {
  timestamp: number;
  avgLatencyMs: number;
  packetLossPercent: number;
  devices?: Record<string, DeviceMetric>;
  cables?: Record<string, CableMetric>;
  factorValues?: Record<string, FactorValue>;
  totalThroughputMbps?: number;
  activeAlertsCount?: number;
  activeCriticalCount?: number;
}

export interface CriticalEvent {
  timestamp: number;
  type: string;
  deviceId: string;
  deviceName: string;
  message: string;
  severity: string;
  recommendation?: string;
  affectedElementType?: string;
  factorType?: string;
  factorValue?: number;
  threshold?: number;
  estimatedCost?: number;
}

export interface EconomicImpact {
  totalReplacementCost: number;
  totalRepairCost: number;
  estimatedDowntimeCost: number;
  totalLoss: number;
  deviceLosses?: Record<string, number>;
  cableLosses?: Record<string, number>;
}

export interface Summary {
  maxLatencyMs: number;
  avgLatencyMs: number;
  minLatencyMs?: number;
  packetLossPercent: number;
  throughputMbps: number;
  devicesFailed: number;
  cablesFailed: number;
  bottlenecks?: string[];
  recommendation?: string;
  totalReplacementCost?: number;
  totalRepairCost?: number;
  totalDowntimeSeconds?: number;
  worstAffectedDevice?: string;
  worstAffectedCable?: string;
}

export interface SimulationResult {
  id: string;
  name: string;
  startNodeName: string;
  endNodeName: string;
  durationSeconds: number;
  grade: string;
  score: number;
  createdAt: string;
  summary?: Summary;
  timeline?: TimelinePoint[];
  events?: CriticalEvent[];
  economicImpact?: EconomicImpact;
}
