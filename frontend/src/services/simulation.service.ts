import { RunSimulationRequest, SimulationResult, ValidationResponse, SimulationHistoryItem } from "../shared";
import { api } from "../utils/api";

class SimulationService {
  async runSimulation(schemaId: string, request: RunSimulationRequest): Promise<SimulationResult> {
    const response = await api.post<SimulationResult>(`/schemas/${schemaId}/simulate`, request);
    return response.data;
  }

  async validateSchema(schemaId: string): Promise<ValidationResponse> {
    const response = await api.post<ValidationResponse>(`/schemas/${schemaId}/validate`);
    return response.data;
  }

  async getSimulationHistory(schemaId: string): Promise<SimulationHistoryItem[]> {
    const response = await api.get<SimulationHistoryItem[]>(`/schemas/${schemaId}/simulations/history`);
    return response.data;
  }

  async getSimulationResult(simulationId: string): Promise<SimulationResult> {
    const response = await api.get<SimulationResult>(`/simulations/${simulationId}`);
    return response.data;
  }
}

export default SimulationService;
