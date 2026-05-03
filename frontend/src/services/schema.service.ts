import { api } from "../utils/api";
import { SchemaSummary, SchemaFull, SchemaStats } from "../shared/types/schema";

class SchemaService {

  async getAllSchemas(): Promise<SchemaSummary[]> {
    const response = await api.get<SchemaSummary[]>('/schemas');
    return response.data;
  }

  async getSchemasByUser(userId: string): Promise<SchemaSummary[]> {
    const response = await api.get<SchemaSummary[]>(`/schemas/user/${userId}`);
    return response.data;
  }

  async getPublicSchemas(): Promise<SchemaSummary[]> {
    const response = await api.get<SchemaSummary[]>('/schemas/public');
    return response.data;
  }

  async getSchemaById(id: string): Promise<SchemaFull> {
    const response = await api.get<SchemaFull>(`/schemas/${id}`);
    return response.data;
  }

  async getSchemaStats(id: string): Promise<SchemaStats> {
    const response = await api.get<SchemaStats>(`/schemas/${id}/stats`);
    return response.data;
  }

  async createSchema(name: string, description: string, isPublic: boolean = false): Promise<SchemaSummary> {
    const response = await api.post<SchemaSummary>('/schemas', { name, description, isPublic });
    return response.data;
  }

  async updateSchema(id: string, data: { name?: string; description?: string; isPublic?: boolean }): Promise<SchemaSummary> {
    const response = await api.put<SchemaSummary>(`/schemas/${id}`, data);
    return response.data;
  }

  async deleteSchema(id: string): Promise<void> {
    await api.delete(`/schemas/${id}`);
  }

  async cloneSchema(id: string, newName: string): Promise<SchemaSummary> {
    const response = await api.post<SchemaSummary>(`/schemas/${id}/clone`, { name: newName });
    return response.data;
  }
}

export default SchemaService;
