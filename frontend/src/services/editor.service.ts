import { SchemaFull } from "../shared";
import { api } from "../utils/api";

class EditorService {
  async getSchemaFull(id: string): Promise<SchemaFull> {
    const response = await api.get<SchemaFull>(`/schemas/${id}/full`);
    return response.data;
  }

  async updateSchema(id: string, data: { name?: string; description?: string; isPublic?: boolean }): Promise<any> {
    const response = await api.put(`/schemas/${id}`, data);
    return response.data;
  }

  async validateSchema(id: string): Promise<any> {
    const response = await api.post(`/schemas/${id}/validate`);
    return response.data;
  }
}

export default EditorService;
