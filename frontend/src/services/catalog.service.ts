import { api } from "../utils/api";
import {
  CatalogDevice,
  CatalogCable,
  CatalogSubSchema,
  CatalogFactor
} from "../shared/types/catalog";

class CatalogService {
  
  // ============ DEVICES ============
  
  async getDevices(): Promise<CatalogDevice[]> {
    const response = await api.get<CatalogDevice[]>('/devices');
    return response.data;
  }

  async addDevice(device: Omit<CatalogDevice, 'id'>): Promise<CatalogDevice> {
    const response = await api.post<CatalogDevice>('/devices', device);
    return response.data;
  }

  async updateDevice(id: string, device: Partial<CatalogDevice>): Promise<CatalogDevice> {
    const response = await api.put<CatalogDevice>(`/devices/${id}`, device);
    return response.data;
  }

  async deleteDevice(id: string): Promise<void> {
    await api.delete(`/devices/${id}`);
  }

  // ============ CABLES ============
  
  async getCables(): Promise<CatalogCable[]> {
    const response = await api.get<CatalogCable[]>('/cables');
    return response.data;
  }

  async addCable(cable: Omit<CatalogCable, 'id'>): Promise<CatalogCable> {
    const response = await api.post<CatalogCable>('/cables', cable);
    return response.data;
  }

  async updateCable(id: string, cable: Partial<CatalogCable>): Promise<CatalogCable> {
    const response = await api.put<CatalogCable>(`/cables/${id}`, cable);
    return response.data;
  }

  async deleteCable(id: string): Promise<void> {
    await api.delete(`/cables/${id}`);
  }

  // ============ FACTORS ============
  
  async getFactors(): Promise<CatalogFactor[]> {
    const response = await api.get<CatalogFactor[]>('/factors');
    return response.data;
  }

  async getFactorsBySchema(schemaId: string): Promise<CatalogFactor[]> {
    const response = await api.get<CatalogFactor[]>(`/factors/schema/${schemaId}`);
    return response.data;
  }

  async getFactorsByType(type: string): Promise<CatalogFactor[]> {
    const response = await api.get<CatalogFactor[]>(`/factors/type/${type}`);
    return response.data;
  }

  async addFactor(factor: Omit<CatalogFactor, 'id'>): Promise<CatalogFactor> {
    const response = await api.post<CatalogFactor>('/factors', factor);
    return response.data;
  }

  async updateFactor(id: string, factor: Partial<CatalogFactor>): Promise<CatalogFactor> {
    const response = await api.put<CatalogFactor>(`/factors/${id}`, factor);
    return response.data;
  }

  async deleteFactor(id: string): Promise<void> {
    await api.delete(`/factors/${id}`);
  }

  // ============ PUBLIC SCHEMAS ============
  
  async getPublicSchemas(): Promise<CatalogSubSchema[]> {
    const response = await api.get<CatalogSubSchema[]>('/schemas/public');
    return response.data;
  }
}

export default CatalogService;
