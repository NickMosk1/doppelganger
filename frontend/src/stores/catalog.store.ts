import { makeAutoObservable } from "mobx";
import {
  CatalogDevice,
  CatalogCable,
  CatalogSubSchema,
  CatalogFactor,
  DeviceCategories,
  CableTypes,
  FactorTypes
} from "../shared/types/catalog";

class CatalogStore {

  private _devices: CatalogDevice[] = [];
  private _cables: CatalogCable[] = [];
  private _publicSchemas: CatalogSubSchema[] = [];
  private _factors: CatalogFactor[] = [];
  private _searchQuery: string = "";
  private _isLoading: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  // ============ GETTERS ============

  get devices() {
    if (!this._searchQuery) return this._devices;
    return this._devices.filter(d =>
      d.name.toLowerCase().includes(this._searchQuery.toLowerCase()) ||
      d.manufacturer?.toLowerCase().includes(this._searchQuery.toLowerCase())
    );
  }

  get cables() {
    if (!this._searchQuery) return this._cables;
    return this._cables.filter(c =>
      c.name.toLowerCase().includes(this._searchQuery.toLowerCase())
    );
  }

  get publicSchemas() {
    if (!this._searchQuery) return this._publicSchemas;
    return this._publicSchemas.filter(s => 
      s.name.toLowerCase().includes(this._searchQuery.toLowerCase())
    );
  }

  get factors() {
    if (!this._searchQuery) return this._factors;
    return this._factors.filter(f => 
      f.name.toLowerCase().includes(this._searchQuery.toLowerCase())
    );
  }

  get searchQuery() {
    return this._searchQuery;
  }

  get isLoading() {
    return this._isLoading;
  }

  get groupedFactors() {
    const groups: Record<FactorTypes, CatalogFactor[]> = {
      [FactorTypes.TEMPERATURE]: [],
      [FactorTypes.EMI]: [],
      [FactorTypes.VIBRATION]: [],
      [FactorTypes.DUST]: [],
    };

    this.factors.forEach(factor => {
      groups[factor.factorType]?.push(factor);
    });

    return groups;
  }

  get groupedDevices() {
    const groups: Record<DeviceCategories, CatalogDevice[]> = {
      [DeviceCategories.ROUTERS]: [],
      [DeviceCategories.SWITCHES]: [],
      [DeviceCategories.PLCS]: [],
      [DeviceCategories.SERVERS]: [],
      [DeviceCategories.WORK_STATIONS]: [],
      [DeviceCategories.FIRE_WALLS]: [],
    };

    this.devices.forEach(device => {
      groups[device.category]?.push(device);
    });

    return groups;
  }

  get groupedCables() {
    const groups: Record<CableTypes, CatalogCable[]> = {
      [CableTypes.COPPER]: [],
      [CableTypes.FIBER]: [],
      [CableTypes.TWISTED_PAIR]: [],
      [CableTypes.COAXIAL]: [],
      [CableTypes.SHIELDED]: [],
      [CableTypes.INDUSTRIAL]: [],
    };

    this.cables.forEach(cable => {
      groups[cable.type]?.push(cable);
    });

    return groups;
  }

  // ============ SETTERS ============
  
  setDevices(devices: CatalogDevice[]) {
    this._devices = devices;
  }

  setCables(cables: CatalogCable[]) {
    this._cables = cables;
  }

  setPublicSchemas(schemas: CatalogSubSchema[]) {
    this._publicSchemas = schemas;
  }

  setFactors(factors: CatalogFactor[]) {
    this._factors = factors;
  }

  setSearchQuery(query: string) {
    this._searchQuery = query;
  }

  setLoading(loading: boolean) {
    this._isLoading = loading;
  }

  // ============ ACTIONS ============
  
  addDeviceSync(device: CatalogDevice) {
    this._devices.push(device);
  }

  addCableSync(cable: CatalogCable) {
    this._cables.push(cable);
  }

  addFactorSync(factor: CatalogFactor) {
    this._factors.push(factor);
  }

  updateDeviceSync(id: string, data: Partial<CatalogDevice>) {
    const index = this._devices.findIndex(d => d.id === id);
    if (index !== -1) {
      this._devices[index] = { ...this._devices[index], ...data };
    }
  }

  updateCableSync(id: string, data: Partial<CatalogCable>) {
    const index = this._cables.findIndex(c => c.id === id);
    if (index !== -1) {
      this._cables[index] = { ...this._cables[index], ...data };
    }
  }

  updateFactorSync(id: string, data: Partial<CatalogFactor>) {
    const index = this._factors.findIndex(f => f.id === id);
    if (index !== -1) {
      this._factors[index] = { ...this._factors[index], ...data };
    }
  }

  removeDeviceSync(id: string) {
    this._devices = this._devices.filter(d => d.id !== id);
  }

  removeCableSync(id: string) {
    this._cables = this._cables.filter(c => c.id !== id);
  }

  removeFactorSync(id: string) {
    this._factors = this._factors.filter(f => f.id !== id);
  }

  clear() {
    this._devices = [];
    this._cables = [];
    this._publicSchemas = [];
    this._factors = [];
    this._searchQuery = "";
  }
}

export default CatalogStore;
