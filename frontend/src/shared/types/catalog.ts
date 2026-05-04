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
  authorId?: string;
  isCustom?: boolean;
  description?: string;
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
  authorId?: string;
  isCustom?: boolean;
  description?: string;
};

export interface CatalogSubSchema {
  id: string;
  name: string;
  description: string;
  ownerName: string;
};

export const deviceCategoryLabels: Record<DeviceCategories, string> = {
  [DeviceCategories.ROUTERS]: "Маршрутизаторы",
  [DeviceCategories.SWITCHES]: "Коммутаторы",
  [DeviceCategories.PLCS]: "ПЛК",
  [DeviceCategories.SERVERS]: "Серверы",
  [DeviceCategories.WORK_STATIONS]: "Рабочие станции",
  [DeviceCategories.FIRE_WALLS]: "Фаерволы",
};

export const cableTypeLabels: Record<CableTypes, string> = {
  [CableTypes.COPPER]: "Медные",
  [CableTypes.FIBER]: "Оптоволокно",
  [CableTypes.TWISTED_PAIR]: "Витая пара",
  [CableTypes.COAXIAL]: "Коаксиальные",
  [CableTypes.SHIELDED]: "Экранированные",
  [CableTypes.INDUSTRIAL]: "Промышленные",
};
