import { NodeStatus } from "./editor";

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


export interface RunSimulationRequest {
  name: string;
  startNodeId: string;      // Добавить
  endNodeId: string;        // Добавить
  durationSeconds: number;
}

export interface SimulationResult {
  id: string;
  name: string;
  schemaId: string;
  schemaName: string;
  startNodeId: string;       // Добавить
  startNodeName: string;     // Добавить
  endNodeId: string;         // Добавить
  endNodeName: string;       // Добавить
  durationSeconds: number;
  grade: string;             // Добавить
  score: number;             // Добавить
  createdAt: string;
  summary: {
    maxLatencyMs: number;
    avgLatencyMs: number;
    minLatencyMs: number;
    packetLossPercent: number;
    throughputMbps: number;
    devicesFailed: number;
    cablesFailed: number;
    bottlenecks: string[];
    recommendation: string;
  };
  timeline: Array<{
    timestamp: number;
    avgLatencyMs: number;
    packetLossPercent: number;
    devices: Record<string, {
      latencyMs: number;
      packetLossPercent: number;
      throughputMbps: number;
      temperature: number;
      status: string;
    }>;
  }>;
  events: Array<{
    timestamp: number;
    type: string;
    deviceId: string;
    deviceName: string;
    message: string;
    severity: string;
  }>;
}

export interface ValidationResponse {
  valid: boolean;
  errors: Array<{
    type: string;
    message: string;
    nodeId?: string;
  }>;
}

export interface SimulationHistoryItem {
  id: string;
  name: string;
  startNodeName: string;      // Добавить
  endNodeName: string;        // Добавить
  durationSeconds: number;    // Добавить
  createdAt: string;          // Добавить
  grade: string;
  score: number;
}
