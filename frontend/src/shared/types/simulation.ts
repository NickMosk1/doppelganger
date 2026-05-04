import { NodeStatus } from "./schema";

export interface GlobalFactors {
  temperature: number;
  emi: number;
  vibration: number;
  dust: number;
};

export interface SimulationConfig {
  durationSeconds: number;
  stepSeconds: number;
  globalFactors: GlobalFactors;
};

export interface SimulationProgress {
  currentTime: number;
  totalDuration: number;
  percentage: number;
  isRunning: boolean;
};

export interface SimulationHistoryItem {
  id: string;
  name: string;
  startedAt: string;
  duration: number;
  score: number;
  grade: string;
};

export interface CriticalEvent {
  id: string;
  timestamp: number;
  type: "OVERHEAT" | "EMI_SPIKE" | "VIBRATION_HIGH" | "LINK_FAILURE" | "DEVICE_DOWN" | "PACKET_LOSS_HIGH";
  severity: "WARNING" | "CRITICAL" | "FATAL";
  nodeId: string;
  nodeName: string;
  message: string;
  value?: number;
  threshold?: number;
};

export interface SimulationMetrics {
  latencyMs: number;
  packetLossPercent: number;
  throughputMbps: number;
  temperatureCelsius: number;
  emiDb: number;
  vibrationHz: number;
  cpuUsagePercent?: number;
  memoryUsagePercent?: number;
};

export interface NodeSimulationResult {
  nodeId: string;
  nodeName: string;
  metrics: SimulationMetrics;
  status: NodeStatus;
  criticalEvents: CriticalEvent[];
};

export interface SimulationResult {
  id: string;
  name: string;
  schemaId: string;
  schemaName: string;
  startedAt: string;
  finishedAt: string;
  durationSeconds: number;
  summary: {
    maxLatencyMs: number;
    avgLatencyMs: number;
    maxPacketLossPercent: number;
    avgPacketLossPercent: number;
    minThroughputMbps: number;
    grade: string;
  };
  timeline: Array<{
    timestamp: number;
    devices: Record<string, {
      latencyMs: number;
      packetLossPercent: number;
      throughputMbps: number;
      status: string;
      temperature: number;
    }>;
  }>;
  criticalEvents: CriticalEvent[];
};

export interface RunSimulationRequest {
  name: string;
  durationSeconds: number;
  factors: {
    temperature: number;
    emi: number;
    vibration: number;
    dust: number;
  };
};
