// src/shared/types/catalog.ts

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

export enum FactorTypes {
  TEMPERATURE = "TEMPERATURE",
  EMI = "EMI",
  VIBRATION = "VIBRATION",
  DUST = "DUST",
};

// ============ DEVICE ============
export interface CatalogDevice {
  id: string;
  name: string;
  type: DeviceTypes;
  manufacturer: string;
  icon: string;
  category: DeviceCategories;
  
  // Сетевые параметры
  baseLatencyMs?: number;
  maxThroughputMbps?: number;
  portCount?: number;
  
  // Промышленные коэффициенты
  tempCoefficient?: number;
  emiCoefficient?: number;
  vibrationCoefficient?: number;
  dustCoefficient?: number;
  
  // Допустимые диапазоны
  maxOperatingTemp?: number;
  minOperatingTemp?: number;
  maxEmiTolerance?: number;
  maxVibrationTolerance?: number;
  
  // Надежность
  mtbfHours?: number;
  mttrMinutes?: number;
  warmUpTimeSeconds?: number;
  
  // Экономические показатели
  replacementCost?: number;
  repairCost?: number;
  
  // Энергопотребление и защита
  powerConsumptionWatts?: number;
  heatGenerationWatts?: number;
  ipRating?: string;
  operatingHumidityMax?: number;
  needsCooling?: boolean;
  hasRedundantPower?: boolean;
  
  authorId?: string;
  isCustom?: boolean;
  description?: string;
};

// ============ CABLE ============
export interface CatalogCable {
  id: string;
  name: string;
  type: CableTypes;
  maxLengthM: number;
  attenuationDbPerKm: number;
  pricePerMeter: number;
  icon: string;
  
  // Физические характеристики
  propagationSpeed?: number;
  bendingRadiusMm?: number;
  tensileStrengthN?: number;
  operatingTensionMaxN?: number;
  
  // Электрические/оптические параметры
  impedanceOhms?: number;
  coreDiameterUm?: number;
  capacitancePerKmNf?: number;
  resistancePerKmOhms?: number;
  
  // Частотные характеристики
  maxFrequencyMhz?: number;
  signalToNoiseRatioDb?: number;
  
  // Промышленная устойчивость
  immunityRating?: number;
  temperatureRating?: number;
  shieldingType?: number;
  oilResistance?: boolean;
  uvResistance?: boolean;
  chemicalResistance?: string;
  
  // Срок службы
  expectedLifetimeYears?: number;
  degradationRatePerYear?: number;
  
  authorId?: string;
  isCustom?: boolean;
  description?: string;
};

// ============ FACTOR ============
export interface CatalogFactor {
  id: string;
  name: string;
  factorType: FactorTypes;
  factorValue: number;
  factorUnit: string;
  factorRadius: number;
  icon: string;
  
  // Динамика изменения
  changeRatePerSecond?: number;
  minValue?: number;
  maxValue?: number;
  valueChangePattern?: string; // LINEAR, SINE, STEP, RANDOM, NONE
  frequencyHz?: number;
  
  // Временные характеристики
  startTimeSeconds?: number;
  durationSeconds?: number;
  
  // Пространственное распределение
  falloffType?: string; // INVERSE_SQUARE, LINEAR, STEP, NONE
  falloffExponent?: number;
  
  // Пороги срабатывания
  warningThreshold?: number;
  criticalThreshold?: number;
  failureThreshold?: number;
  
  // Приоритет
  priority?: number;
  
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

// ============ LABELS ============
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

export const factorTypeLabels: Record<FactorTypes, string> = {
  [FactorTypes.TEMPERATURE]: "Температура",
  [FactorTypes.EMI]: "Электромагнитные помехи",
  [FactorTypes.VIBRATION]: "Вибрация",
  [FactorTypes.DUST]: "Запыленность",
};
