import { api } from "../utils/api";
import { CatalogDevice, CatalogCable, CatalogSubSchema } from "../shared/types/catalog";

class CatalogService {
  async getDevices(): Promise<CatalogDevice[]> {
    const response = await api.get<CatalogDevice[]>('/devices');
    return response.data;
  }

  async getCables(): Promise<CatalogCable[]> {
    const response = await api.get<CatalogCable[]>('/cables');
    return response.data;
  }

  async getPublicSchemas(): Promise<CatalogSubSchema[]> {
    const response = await api.get<CatalogSubSchema[]>('/schemas/public');
    return response.data;
  }

  async addDevice(device: any): Promise<CatalogDevice> {
    const { id, icon, ...deviceToSend } = device;
    const response = await api.post<CatalogDevice>('/devices', deviceToSend);
    return response.data;
  }

  async addCable(cable: any): Promise<CatalogCable> {
    const { id, icon, ...cableToSend } = cable;
    const response = await api.post<CatalogCable>('/cables', cableToSend);
    return response.data;
  }

  async updateDevice(id: string, device: Partial<CatalogDevice>): Promise<CatalogDevice> {
    const response = await api.put<CatalogDevice>(`/devices/${id}`, device);
    return response.data;
  }

  async updateCable(id: string, cable: Partial<CatalogCable>): Promise<CatalogCable> {
    const response = await api.put<CatalogCable>(`/cables/${id}`, cable);
    return response.data;
  }

  async deleteDevice(id: string): Promise<void> {
    await api.delete(`/devices/${id}`);
  }

  async deleteCable(id: string): Promise<void> {
    await api.delete(`/cables/${id}`);
  }
}

export default CatalogService;
