// src/services/editor.service.ts

import { SchemaFull, ValidationResult } from "../shared";
import { api } from "../utils/api";
import { ConnectionType } from "../shared/types";

class EditorService {
  
  async getSchemaFull(id: string): Promise<SchemaFull> {
    const response = await api.get<SchemaFull>(`/schemas/${id}/full`);
    return response.data;
  }

  async getSchemaSummary(id: string): Promise<{ id: string; name: string; description: string }> {
    const response = await api.get(`/schemas/${id}`);
    return response.data;
  }

  async createSchema(name: string, description: string, isPublic: boolean): Promise<{ id: string; name: string; createdAt: string }> {
    const response = await api.post('/schemas', { name, description, isPublic });
    return response.data;
  }

  async updateSchema(id: string, data: { name?: string; description?: string; isPublic?: boolean }): Promise<void> {
    await api.put(`/schemas/${id}`, data);
  }

  async deleteSchema(id: string): Promise<void> {
    await api.delete(`/schemas/${id}`);
  }

  // ============ УЗЛЫ ============
  
  async createDeviceNode(schemaId: string, deviceId: string, position: { x: number; y: number }, customName?: string): Promise<{ id: string }> {
    const response = await api.post(`/schemas/${schemaId}/nodes/devices/${deviceId}`, {
      positionX: position.x,
      positionY: position.y,
      customName,
    });
    return response.data;
  }

  async createCableNode(schemaId: string, cableNode: {
    name: string;
    customName?: string;
    position: { x: number; y: number };
    lengthM: number;
    cableType: string;
    bandwidthMbps?: number;
  }): Promise<{ id: string }> {
    const response = await api.post(`/schemas/${schemaId}/nodes/cables`, {
      name: cableNode.name,
      customName: cableNode.customName,
      positionX: cableNode.position.x,
      positionY: cableNode.position.y,
      lengthM: cableNode.lengthM,
      cableType: cableNode.cableType,
      bandwidthMbps: cableNode.bandwidthMbps,
    });
    return response.data;
  }

  async createFactorNode(schemaId: string, factorNode: {
    factorType: string;
    name: string;
    position: { x: number; y: number };
    value: number;
    unit: string;
    radius?: number;
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
  }): Promise<{ id: string }> {
    const response = await api.post(`/schemas/${schemaId}/nodes/factors`, {
      factorType: factorNode.factorType,
      name: factorNode.name,
      positionX: factorNode.position.x,
      positionY: factorNode.position.y,
      factorValue: factorNode.value,
      factorUnit: factorNode.unit,
      factorRadius: factorNode.radius,
      changeRatePerSecond: factorNode.changeRatePerSecond,
      minValue: factorNode.minValue,
      maxValue: factorNode.maxValue,
      valueChangePattern: factorNode.valueChangePattern,
      frequencyHz: factorNode.frequencyHz,
      startTimeSeconds: factorNode.startTimeSeconds,
      durationSeconds: factorNode.durationSeconds,
      falloffType: factorNode.falloffType,
      falloffExponent: factorNode.falloffExponent,
      warningThreshold: factorNode.warningThreshold,
      criticalThreshold: factorNode.criticalThreshold,
      failureThreshold: factorNode.failureThreshold,
      priority: factorNode.priority,
    });
    return response.data;
  }

  async updateNodePosition(nodeId: string, position: { x: number; y: number }): Promise<void> {
    await api.put(`/schemas/nodes/${nodeId}/position`, {
      positionX: position.x,
      positionY: position.y,
    });
  }

  async updateNodeName(nodeId: string, customName: string): Promise<void> {
    await api.put(`/schemas/nodes/${nodeId}/name`, { customName });
  }

  async deleteNode(nodeId: string): Promise<void> {
    await api.delete(`/schemas/nodes/${nodeId}`);
  }

  // ============ СВЯЗИ ============
  
  async createConnection(
    schemaId: string, 
    sourceNodeId: string, 
    targetNodeId: string, 
    data: {
      sourcePortId?: string;
      targetPortId?: string;
      connectionType: ConnectionType;
      lengthM?: number;
      distance?: number;
      factorId?: string;
      factorType?: string;
      attenuation?: number;
    }
  ): Promise<{ id: string }> {
    const response = await api.post(`/schemas/${schemaId}/connections`, {
      sourceNodeId,
      targetNodeId,
      sourcePortId: data.sourcePortId,
      targetPortId: data.targetPortId,
      connectionType: data.connectionType,
      lengthM: data.lengthM,
      distance: data.distance,
      factorData: data.factorId ? {
        factorId: data.factorId,
        factorType: data.factorType,
        distance: data.distance,
        attenuation: data.attenuation,
      } : undefined,
    });
    return response.data;
  }

  async updateConnection(connectionId: string, data: { lengthM?: number; distance?: number; isActive?: boolean }): Promise<void> {
    await api.put(`/schemas/connections/${connectionId}`, data);
  }

  async deleteConnection(connectionId: string): Promise<void> {
    await api.delete(`/schemas/connections/${connectionId}`);
  }

  // ============ ВАЛИДАЦИЯ И ПРОЧЕЕ ============
  
  async validateSchema(schemaId: string): Promise<ValidationResult> {
    const response = await api.post<ValidationResult>(`/schemas/${schemaId}/validate`);
    return response.data;
  }

  async cloneSchema(schemaId: string, newName: string): Promise<{ id: string; name: string }> {
    const response = await api.post(`/schemas/${schemaId}/clone`, { name: newName });
    return response.data;
  }

  async getSchemaNodes(schemaId: string): Promise<any[]> {
    const response = await api.get(`/schemas/${schemaId}/nodes`);
    return response.data;
  }

  async getSchemaConnections(schemaId: string): Promise<any[]> {
    const response = await api.get(`/schemas/${schemaId}/connections`);
    return response.data;
  }

  async updateFullSchema(schemaId: string, schemaData: any): Promise<Record<string, string>> {
    const response = await api.put(`/schemas/${schemaId}/full`, schemaData);
    return response.data;
  }
}

export default EditorService;
