export enum DeviceCategories {
  ROUTERS = "ROUTERS",
  SWITCHES = "SWITCHES",
  PLCS = "PLCS",
  SERVERS = "SERVERS",
  WORK_STATIONS = "WORK_STATIONS",
  FIRE_WALLS = "FIRE_WALLS",
};

export enum DeviceTypes {
  ROUTER = "ROUTER",
  SWITCH = "SWITCH",
  PLC = "PLC",
  SERVER = "SERVER",
  WORKSTATION = "WORKSTATION",
  FIREWALL = "FIREWALL",
  ACCESS_POINT = "ACCESS_POINT",
  CUSTOM = "CUSTOM",
};

export enum CableTypes {
  COPPER = "COPPER",
  FIBER = "FIBER",
  TWISTED_PAIR = "TWISTED_PAIR",
  COAXIAL = "COAXIAL",
  SHIELDED = "SHIELDED",
  INDUSTRIAL = "INDUSTRIAL",
};

export interface CatalogDevice {
  id: string;
  name: string;
  type: DeviceTypes;
  manufacturer: string;
  icon: string;
  category: DeviceCategories;
  baseLatencyMs?: number;
  maxThroughputMbps?: number;
};

export interface CatalogCable {
  id: string;
  name: string;
  type: CableTypes;
  maxLengthM: number;
  attenuationDbPerKm: number;
  pricePerMeter: number;
  icon: string;
  immunityRating?: number;
  temperatureRating?: number;
};

export interface CatalogSubSchema {
  id: string;
  name: string;
  description: string;
  ownerName: string;
};
