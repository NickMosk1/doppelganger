import { Handle, Position } from "reactflow";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { Port, PortType } from "../../../../types";

const DeviceNodeContainer = styled.div<{ selected: boolean }>`
  padding: 12px;
  background: white;
  border: 2px solid ${props => props.selected ? '#e54848' : '#e2e8f0'};
  border-radius: 12px;
  min-width: 160px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
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

const StatusIndicator = styled.div<{ status?: string }>`
  font-size: 9px;
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px solid #e2e8f0;
  color: ${props => 
    props.status === 'OPERATIONAL' ? '#10b981' : 
    props.status === 'DEGRADED' ? '#f59e0b' : 
    props.status === 'FAILED' ? '#ef4444' : '#94a3b8'
  };
  text-align: center;
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
  };
  selected: boolean;
}

const DeviceNode: React.FC<DeviceNodeProps> = observer(({ data, selected }) => {
  // Разделяем порты на левые и правые
  const leftPorts = data.ports?.filter((_, i) => i % 2 === 0) || [];
  const rightPorts = data.ports?.filter((_, i) => i % 2 === 1) || [];

  return (
    <DeviceNodeContainer selected={selected}>
      <DeviceHeader>
        <DeviceIcon>{data.icon || "🖥️"}</DeviceIcon>
        <DeviceInfo>
          <DeviceName>{data.label}</DeviceName>
          <DeviceType>{data.type}</DeviceType>
        </DeviceInfo>
      </DeviceHeader>

      <PortsContainer>
        <PortsColumn>
          {leftPorts.map((port, idx) => (
            <PortItem
              key={port.id}
              isConnected={port.isConnected}
              portType={port.type}
            >
              <PortDot portType={port.type} isConnected={port.isConnected} />
              <PortName>{port.name}</PortName>
              {port.speed && <PortSpeed>{port.speed}M</PortSpeed>}
              {/* Handle для соединения - левая сторона */}
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
          {rightPorts.map((port, idx) => (
            <PortItem
              key={port.id}
              isConnected={port.isConnected}
              portType={port.type}
            >
              <PortDot portType={port.type} isConnected={port.isConnected} />
              <PortName>{port.name}</PortName>
              {port.speed && <PortSpeed>{port.speed}M</PortSpeed>}
              {/* Handle для соединения - правая сторона */}
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

      <StatusIndicator status={data.status}>
        {data.status === 'OPERATIONAL' && '🟢 Online'}
        {data.status === 'DEGRADED' && '🟡 Degraded'}
        {data.status === 'FAILED' && '🔴 Offline'}
        {!data.status && '⚪ Unknown'}
      </StatusIndicator>
    </DeviceNodeContainer>
  );
});

export default DeviceNode;
