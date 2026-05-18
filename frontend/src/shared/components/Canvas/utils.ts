import { Port, PortType } from "../../types";

export const generateDefaultPorts = (
  deviceType: string,
  maxThroughputMbps?: number,
  portCountFromDb?: number  // 👈 добавить параметр
): Port[] => {
  const ports: Port[] = [];
  
  // Используем реальное количество портов из БД, если оно есть
  let portCount = portCountFromDb && portCountFromDb > 0 ? portCountFromDb : 4;
  let baseSpeed = 1000;
  
  // Только если нет portCount из БД, используем значения по умолчанию
  if (!portCountFromDb) {
    switch (deviceType) {
      case "ROUTER": portCount = 4; break;
      case "SWITCH": portCount = 8; break;
      case "PLC": portCount = 2; baseSpeed = 100; break;
      case "SERVER": portCount = 2; baseSpeed = 10000; break;
      case "WORKSTATION": portCount = 2; break;
      case "FIREWALL": portCount = 4; break;
      default: portCount = 2;
    }
  }
  
  // Расчёт скорости порта
  let portSpeed = baseSpeed;
  if (maxThroughputMbps && maxThroughputMbps > 0) {
    const maxPortSpeed = Math.floor(maxThroughputMbps / portCount);
    portSpeed = Math.min(baseSpeed, maxPortSpeed);
  }
  
  // Генерируем порты
  for (let i = 1; i <= portCount; i++) {
    let portName = `Port ${i}`;
    if (deviceType === "ROUTER") {
      portName = `Eth${i}`;
    } else if (deviceType === "PLC") {
      portName = `IO${i}`;
    } else if (deviceType === "SERVER" || deviceType === "WORKSTATION") {
      portName = `NIC${i}`;
    }
    
    ports.push({
      id: `port-${i}`,
      name: portName,
      type: deviceType === "PLC" ? PortType.SERIAL : PortType.ETHERNET,
      speed: portSpeed,
      isConnected: false,
    });
  }
  
  return ports;
};

// Вспомогательная функция для форматирования скорости порта (для отображения)
export const formatPortSpeed = (speed?: number): string => {
  if (!speed) return '';
  if (speed >= 10000) return `${speed / 1000}G`;
  return `${speed}M`;
};

// Получение иконки для устройства
export const getDeviceIcon = (deviceType: string): string => {
  switch (deviceType) {
    case "ROUTER": return "🌐";
    case "SWITCH": return "🔌";
    case "PLC": return "⚙️";
    case "SERVER": return "🖥️";
    case "WORKSTATION": return "💻";
    case "FIREWALL": return "🛡️";
    default: return "📟";
  }
};

// Получение иконки для фактора
export const getFactorIcon = (factorType: string): string => {
  switch (factorType) {
    case "TEMPERATURE": return "🌡️";
    case "EMI": return "⚡";
    case "VIBRATION": return "📳";
    case "DUST": return "🏭";
    default: return "📊";
  }
};
