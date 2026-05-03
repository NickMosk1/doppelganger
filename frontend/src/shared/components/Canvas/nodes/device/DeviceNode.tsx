import { Handle, Position } from "reactflow";
import { observer } from "mobx-react-lite";
import { DeviceNodeContainer, DeviceName, DeviceType, DeviceStatus } from "./DeviceNode.styles";

interface DeviceNodeProps {
  data: {
    label: string;
    deviceId: string;
    type: string;
    status?: string;
  };
  selected: boolean;
}

const DeviceNode: React.FC<DeviceNodeProps> = observer(({ data, selected }) => {
  const statusText = data.status === 'OPERATIONAL' ? '🟢 Online' : data.status === 'DEGRADED' ? '🟡 Degraded' : '🔴 Offline';
  return (
    <DeviceNodeContainer selected={selected}>
      <Handle type="target" position={Position.Top} />
      <DeviceName>{data.label}</DeviceName>
      <DeviceType>{data.type}</DeviceType>
      <DeviceStatus status={data.status}>{statusText}</DeviceStatus>
      <Handle type="source" position={Position.Bottom} />
    </DeviceNodeContainer>
  );
});

export default DeviceNode;
