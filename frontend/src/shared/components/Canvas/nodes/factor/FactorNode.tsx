// src/shared/components/Canvas/nodes/FactorNode.tsx
import React from "react";
import { Handle, Position } from "reactflow";
import { observer } from "mobx-react-lite";
import styled from "styled-components";

const FactorNodeContainer = styled.div<{ selected: boolean; factorType: string }>`
  padding: 10px 14px;
  background: ${props => {
    switch (props.factorType) {
      case "TEMPERATURE": return "#fef3c7";
      case "EMI": return "#e0e7ff";
      case "VIBRATION": return "#fce7f3";
      case "DUST": return "#e6e6e6";
      default: return "#f3f4f6";
    }
  }};
  border: 2px solid ${props => props.selected ? '#e54848' : '#d1d5db'};
  border-radius: 16px;
  min-width: 100px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const FactorIcon = styled.div`
  font-size: 28px;
  margin-bottom: 4px;
`;

const FactorName = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #374151;
`;

const FactorValue = styled.div`
  font-size: 11px;
  color: #6b7280;
  margin-top: 2px;
`;

const FactorRadius = styled.div`
  font-size: 9px;
  color: #9ca3af;
  margin-top: 2px;
`;

// Единый Handle для подключения (сверху)
const ConnectionHandle = styled(Handle)`
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
  transition: all 0.2s ease;
  
  &:hover {
    background: #e54848;
    transform: translateX(-50%) scale(1.2);
  }
`;

const BottomConnectionHandle = styled(Handle)`
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
  transition: all 0.2s ease;
  
  &:hover {
    background: #e54848;
    transform: translateX(-50%) scale(1.2);
  }
`;

interface FactorNodeProps {
  data: {
    id: string;
    factorType: string;
    name: string;
    customName?: string;
    value: number;
    unit: string;
    radius?: number;
  };
  selected: boolean;
}

const getFactorIcon = (type: string): string => {
  switch (type) {
    case "TEMPERATURE": return "🌡️";
    case "EMI": return "⚡";
    case "VIBRATION": return "📳";
    case "DUST": return "🏭";
    default: return "📊";
  }
};

const FactorNode: React.FC<FactorNodeProps> = observer(({ data, selected }) => {
  const icon = getFactorIcon(data.factorType);
  const displayName = data.customName || data.name;

  return (
    <FactorNodeContainer selected={selected} factorType={data.factorType}>
      {/* Единый Handle сверху для подключения к устройствам/кабелям */}
      <ConnectionHandle
        type="source"
        position={Position.Top}
        id="connection-top"
      />

      {/* Единый Handle сверху для подключения к устройствам/кабелям */}
      <BottomConnectionHandle
        type="source"
        position={Position.Bottom}
        id="connection-bottom"
      />
      
      <FactorIcon>{icon}</FactorIcon>
      <FactorName>{displayName}</FactorName>
      <FactorValue>{data.value} {data.unit}</FactorValue>
      {data.radius && <FactorRadius>📐 {data.radius}м</FactorRadius>}
    </FactorNodeContainer>
  );
});

export default FactorNode;
