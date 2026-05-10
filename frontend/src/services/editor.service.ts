import { SchemaFull, ValidationResult } from "../shared";
import { api } from "../utils/api";

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

  async createNode(schemaId: string, deviceId: string, position: { x: number; y: number }, customName?: string): Promise<{ id: string }> {
    const response = await api.post(`/schemas/${schemaId}/nodes/devices/${deviceId}`, {
      positionX: position.x,
      positionY: position.y,
      customName,
    });
    return response.data;
  }

  async updateNodePosition(nodeId: string, position: { x: number; y: number }): Promise<void> {
    await api.put(`/schemas/nodes/${nodeId}/position`, {
      positionX: position.x,
      positionY: position.y,
    });
  }

  async deleteNode(nodeId: string): Promise<void> {
    await api.delete(`/schemas/nodes/${nodeId}`);
  }

  async updateConnection(connectionId: string, lengthM: number): Promise<void> {
    await api.put(`/schemas/connections/${connectionId}`, { lengthM });
  }

  async deleteConnection(connectionId: string): Promise<void> {
    await api.delete(`/schemas/connections/${connectionId}`);
  }

  async validateSchema(schemaId: string): Promise<ValidationResult> {
    const response = await api.post<ValidationResult>(`/schemas/${schemaId}/validate`);
    return response.data;
  }

  async cloneSchema(schemaId: string, newName: string): Promise<{ id: string; name: string }> {
    const response = await api.post(`/schemas/${schemaId}/clone`, { name: newName });
    return response.data;
  }

  async createCableNode(schemaId: string, cableNode: any): Promise<any> {
    const response = await api.post(`/schemas/${schemaId}/nodes/cables`, {
      name: cableNode.name,
      customName: cableNode.customName,
      positionX: cableNode.position.x,
      positionY: cableNode.position.y,
      lengthM: cableNode.lengthM,
      cableType: cableNode.cableType,
    });
    return response.data;
  }

  async createConnection(schemaId: string, sourceNodeId: string, targetNodeId: string, cableId: string, lengthM: number): Promise<any> {
    const response = await api.post(`/schemas/${schemaId}/connections`, {
      sourceNodeId,
      targetNodeId,
      cableId,
      lengthM,
    });
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
