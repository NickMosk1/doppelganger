import { Port, PortType } from "../../types/editor";

export const generateDefaultPorts = (deviceType: string): Port[] => {
  const ports: Port[] = [];
  
  switch (deviceType) {
    case "ROUTER":
      for (let i = 1; i <= 4; i++) {
        ports.push({
          id: `port-${i}`,
          name: `Eth${i}`,
          type: PortType.ETHERNET,
          speed: 1000,
          isConnected: false,
        });
      }
      break;
    case "SWITCH":
      for (let i = 1; i <= 8; i++) {
        ports.push({
          id: `port-${i}`,
          name: `Port ${i}`,
          type: PortType.ETHERNET,
          speed: 1000,
          isConnected: false,
        });
      }
      break;
    case "PLC":
      for (let i = 1; i <= 2; i++) {
        ports.push({
          id: `port-${i}`,
          name: `IO${i}`,
          type: PortType.SERIAL,
          speed: 100,
          isConnected: false,
        });
      }
      break;
    case "SERVER":
    case "WORKSTATION":
      for (let i = 1; i <= 2; i++) {
        ports.push({
          id: `port-${i}`,
          name: `NIC${i}`,
          type: PortType.ETHERNET,
          speed: 10000,
          isConnected: false,
        });
      }
      break;
    case "FIREWALL":
      for (let i = 1; i <= 4; i++) {
        ports.push({
          id: `port-${i}`,
          name: `Port ${i}`,
          type: PortType.ETHERNET,
          speed: 1000,
          isConnected: false,
        });
      }
      break;
    default:
      for (let i = 1; i <= 2; i++) {
        ports.push({
          id: `port-${i}`,
          name: `Port ${i}`,
          type: PortType.ETHERNET,
          speed: 1000,
          isConnected: false,
        });
      }
  }
  
  return ports;
};

export const getDeviceIcon = (type: string): string => {
  const icons: Record<string, string> = {
    ROUTER: "🌐",
    SWITCH: "🔌",
    PLC: "⚙️",
    SERVER: "🖥️",
    WORKSTATION: "💻",
    FIREWALL: "🛡️",
    ACCESS_POINT: "📡",
    CUSTOM: "🔧",
  };
  return icons[type] || "🔧";
};
