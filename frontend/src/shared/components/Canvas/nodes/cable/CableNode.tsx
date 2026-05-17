// src/shared/components/Canvas/nodes/CableNode.tsx
import { Handle, Position } from "reactflow";
import { observer } from "mobx-react-lite";
import styled from "styled-components";

const CableNodeContainer = styled.div<{ $selected: boolean }>`
  padding: 4px 12px;
  background: #f8fafc;
  border: 2px solid ${props => props.$selected ? '#e54848' : '#94a3b8'};
  border-radius: 20px;
  min-width: 100px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  position: relative;

  &:hover {
    border-color: #e54848;
    background: #fef2f2;
  }
`;

const CableIcon = styled.span`
  font-size: 14px;
`;

const CableName = styled.span`
  font-size: 10px;
  font-weight: 500;
  color: #475569;
`;

const CableLength = styled.span`
  font-size: 9px;
  color: #94a3b8;
`;

// Handle для подключения факторов (снизу)
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

interface CableNodeProps {
  data: {
    id: string;
    name: string;
    lengthM: number;
    cableType: string;
  };
  selected: boolean;
}

const CableNode: React.FC<CableNodeProps> = observer(({ data, selected }) => {
  return (
    <CableNodeContainer $selected={selected}>
      {/* Левый порт (вход) */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{
          width: 10,
          height: 10,
          background: '#3b82f6',
          borderRadius: '50%',
          border: '2px solid white',
          cursor: 'crosshair',
          zIndex: 10,
        }}
      />
      
      <CableIcon>🔌</CableIcon>
      <CableName>{data.name}</CableName>
      <CableLength>{data.lengthM}м</CableLength>
      
      {/* Правый порт (выход) */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{
          width: 10,
          height: 10,
          background: '#3b82f6',
          borderRadius: '50%',
          border: '2px solid white',
          cursor: 'crosshair',
          zIndex: 10,
        }}
      />

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
    </CableNodeContainer>
  );
});

export default CableNode;
