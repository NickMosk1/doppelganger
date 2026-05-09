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
    </CableNodeContainer>
  );
});

export default CableNode;
