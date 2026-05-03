import { makeAutoObservable } from "mobx";
import {
  CatalogDevice,
  CatalogCable,
  CatalogSubSchema,
  CableTypes,
  DeviceCategories,
} from "../shared/types/catalog";

class CatalogStore {
  private _devices: CatalogDevice[] = [];
  private _cables: CatalogCable[] = [];
  private _publicSchemas: CatalogSubSchema[] = [];
  private _searchQuery: string = "";
  private _isLoading: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  get devices() {
    if (!this._searchQuery) return this._devices;
    return this._devices.filter(d =>
      d.name.toLowerCase().includes(this._searchQuery.toLowerCase()) ||
      d.manufacturer.toLowerCase().includes(this._searchQuery.toLowerCase())
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

  get searchQuery() {
    return this._searchQuery;
  }

  get isLoading() {
    return this._isLoading;
  }

  setDevices(devices: CatalogDevice[]) {
    this._devices = devices;
  }

  setCables(cables: CatalogCable[]) {
    this._cables = cables;
  }

  setPublicSchemas(schemas: CatalogSubSchema[]) {
    this._publicSchemas = schemas;
  }

  setSearchQuery(query: string) {
    this._searchQuery = query;
  }

  setLoading(loading: boolean) {
    this._isLoading = loading;
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
      groups[device.category].push(device);
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
      groups[cable.type].push(cable);
    });

    return groups;
  }
}

export default CatalogStore;
