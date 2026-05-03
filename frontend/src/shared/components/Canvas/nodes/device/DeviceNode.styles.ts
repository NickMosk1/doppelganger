import styled from "styled-components";

export const DeviceNodeContainer = styled.div<{ selected: boolean }>`
  padding: 12px 16px;
  background: white;
  border: 2px solid ${props => props.selected ? '#e54848' : '#e2e8f0'};
  border-radius: 12px;
  min-width: 140px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

export const DeviceIcon = styled.div`
  font-size: 28px;
  margin-bottom: 8px;
`;

export const DeviceName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #1e293b;
  margin-bottom: 4px;
`;

export const DeviceType = styled.div`
  font-size: 10px;
  color: #64748b;
  text-transform: uppercase;
`;

export const DeviceStatus = styled.div<{ status?: string }>`
  font-size: 10px;
  margin-top: 6px;
  color: ${props => props.status === 'OPERATIONAL' ? '#10b981' : props.status === 'DEGRADED' ? '#f59e0b' : '#ef4444'};
`;
