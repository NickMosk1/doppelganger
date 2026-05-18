import { Handle, Position } from "reactflow";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { Port, PortType } from "../../../../types";
import { colors } from "../../../../theme";
import { formatPortSpeed } from "../../utils";

const DeviceNodeContainer = styled.div<{ selected: boolean; isStartPoint?: boolean; isEndPoint?: boolean }>`
  padding: 12px;
  background: white;
  border: 2px solid ${props => {
    if (props.isStartPoint) return '#10b981';
    if (props.isEndPoint) return '#ef4444';
    if (props.selected) return colors.primary;
    return '#e2e8f0';
  }};
  border-radius: 12px;
  min-width: 220px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

// Простая плашка сверху
const TopBadge = styled.div<{ type: 'start' | 'end' }>`
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.type === 'start' ? '#10b981' : '#ef4444'};
  color: white;
  font-size: 10px;
  padding: 2px 10px;
  border-radius: 12px;
  font-weight: 500;
  z-index: 20;
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const DeviceHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
`;

const DeviceIcon = styled.div`
  font-size: 24px;
`;

const DeviceInfo = styled.div`
  flex: 1;
`;

const DeviceName = styled.div`
  font-weight: 600;
  font-size: 13px;
  color: #1e293b;
`;

const DeviceType = styled.div`
  font-size: 10px;
  color: #64748b;
`;

const PortsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
`;

const PortsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  position: relative;
`;

const PortItem = styled.div<{ isConnected: boolean; portType: PortType }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  background: ${props => props.isConnected ? '#e5484820' : '#f1f5f9'};
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${props => props.isConnected ? '#e54848' : 'transparent'};
  position: relative;

  &:hover {
    background: ${props => props.isConnected ? '#e5484830' : '#e2e8f0'};
  }
`;

const PortDot = styled.div<{ portType: PortType; isConnected: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => 
    props.isConnected ? '#e54848' : 
    props.portType === PortType.ETHERNET ? '#3b82f6' :
    props.portType === PortType.FIBER ? '#10b981' : '#f59e0b'
  };
`;

const PortName = styled.span`
  font-size: 9px;
  color: #475569;
  flex: 1;
`;

const PortSpeed = styled.span`
  font-size: 8px;
  color: #94a3b8;
`;

const FactorHandle = styled(Handle)`
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  background: #f59e0b;
  border-radius: 50%;
  border: 2px solid white;
  cursor: crosshair;
  z-index: 10;
  
  &:hover {
    background: #e54848;
    transform: translateX(-50%) scale(1.2);
  }
`;

// Handle для подключения факторов (снизу)
const TopFactorHandle = styled(Handle)`
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  background: #f59e0b;
  border-radius: 50%;
  border: 2px solid white;
  cursor: crosshair;
  z-index: 10;
  
  &:hover {
    background: #e54848;
    transform: translateX(-50%) scale(1.2);
  }
`;

interface DeviceNodeProps {
  data: {
    id: string;
    label: string;
    deviceId: string;
    type: string;
    status?: string;
    ports?: Port[];
    icon?: string;
    isStartPoint?: boolean;
    isEndPoint?: boolean;
  };
  selected: boolean;
}

const DeviceNode: React.FC<DeviceNodeProps> = observer(({ data, selected }) => {
  const leftPorts = data.ports?.filter((_, i) => i % 2 === 0) || [];
  const rightPorts = data.ports?.filter((_, i) => i % 2 === 1) || [];

  return (
    <DeviceNodeContainer selected={selected} isStartPoint={data.isStartPoint} isEndPoint={data.isEndPoint}>
      {/* Плашка сверху, если нода - точка старта */}
      {data.isStartPoint && <TopBadge type="start">▶ СТАРТ</TopBadge>}
      {/* Плашка сверху, если нода - точка финиша */}
      {data.isEndPoint && <TopBadge type="end">■ ФИНИШ</TopBadge>}

      <DeviceHeader>
        <DeviceIcon>{data.icon || "🖥️"}</DeviceIcon>
        <DeviceInfo>
          <DeviceName>{data.label}</DeviceName>
          <DeviceType>{data.type}</DeviceType>
        </DeviceInfo>
      </DeviceHeader>

      <PortsContainer>
        <PortsColumn>
          {leftPorts.map((port) => (
            <PortItem
              key={port.id}
              isConnected={port.isConnected}
              portType={port.type}
            >
              <PortDot portType={port.type} isConnected={port.isConnected} />
              <PortName>{port.name}</PortName>
              {port.speed && <PortSpeed title="Мегабит в секунду">{formatPortSpeed(port.speed)}</PortSpeed>}
              <Handle
                type="source"
                position={Position.Left}
                id={`${port.id}`}
                style={{
                  position: 'absolute',
                  left: -8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 10,
                  height: 10,
                  background: port.isConnected ? '#e54848' : '#3b82f6',
                  borderRadius: '50%',
                  border: '2px solid white',
                  cursor: 'crosshair',
                  zIndex: 10,
                }}
              />
            </PortItem>
          ))}
        </PortsColumn>

        <PortsColumn>
          {rightPorts.map((port) => (
            <PortItem
              key={port.id}
              isConnected={port.isConnected}
              portType={port.type}
            >
              <PortDot portType={port.type} isConnected={port.isConnected} />
              <PortName>{port.name}</PortName>
              {port.speed && <PortSpeed title="Мегабит в секунду">{formatPortSpeed(port.speed)}</PortSpeed>}
              <Handle
                type="target"
                position={Position.Right}
                id={`${port.id}`}
                style={{
                  position: 'absolute',
                  right: -8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 10,
                  height: 10,
                  background: port.isConnected ? '#e54848' : '#3b82f6',
                  borderRadius: '50%',
                  border: '2px solid white',
                  cursor: 'crosshair',
                  zIndex: 10,
                }}
              />
            </PortItem>
          ))}
        </PortsColumn>
      </PortsContainer>

      {/* Handle для подключения факторов (снизу) */}
      <FactorHandle
        type="target"
        position={Position.Bottom}
        id="factor-connection-bottom"
      />

      {/* Handle для подключения факторов (сверху) */}
      <TopFactorHandle
        type="target"
        position={Position.Top}
        id="factor-connection-top"
      />
    </DeviceNodeContainer>
  );
});

export default DeviceNode;