import { Handle, Position } from "reactflow";
import { observer } from "mobx-react-lite";
import styled from "styled-components";

const FactorNodeContainer = styled.div<{ selected: boolean; factorType: string }>`
  padding: 8px 12px;
  background: ${props => {
    switch (props.factorType) {
      case "TEMPERATURE": return "#fef3c7";
      case "EMI": return "#e0e7ff";
      case "VIBRATION": return "#fce7f3";
      default: return "#f3f4f6";
    }
  }};
  border: 2px solid ${props => props.selected ? '#e54848' : '#d1d5db'};
  border-radius: 12px;
  min-width: 100px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
`;

const FactorIcon = styled.div`
  font-size: 24px;
  margin-bottom: 4px;
`;

const FactorName = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #374151;
`;

const FactorValue = styled.div`
  font-size: 10px;
  color: #6b7280;
`;

interface FactorNodeProps {
  data: {
    id: string;
    factorType: string;
    name: string;
    value: number;
    unit: string;
  };
  selected: boolean;
}

const FactorNode: React.FC<FactorNodeProps> = observer(({ data, selected }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case "TEMPERATURE": return "🌡️";
      case "EMI": return "⚡";
      case "VIBRATION": return "📳";
      default: return "🏭";
    }
  };

  return (
    <FactorNodeContainer selected={selected} factorType={data.factorType}>
      <Handle type="source" position={Position.Right} />
      <FactorIcon>{getIcon(data.factorType)}</FactorIcon>
      <FactorName>{data.name}</FactorName>
      <FactorValue>{data.value} {data.unit}</FactorValue>
      <Handle type="target" position={Position.Left} />
    </FactorNodeContainer>
  );
});

export default FactorNode;
