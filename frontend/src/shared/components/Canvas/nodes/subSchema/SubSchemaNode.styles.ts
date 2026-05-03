import styled from "styled-components";

export const SubSchemaNodeContainer = styled.div<{ selected: boolean }>`
  padding: 12px 16px;
  background: #f0f9ff;
  border: 2px solid ${props => props.selected ? '#e54848' : '#3b82f6'};
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

export const SchemaIcon = styled.div`
  font-size: 28px;
  margin-bottom: 8px;
`;

export const SchemaName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #1e293b;
  margin-bottom: 4px;
`;

export const SchemaType = styled.div`
  font-size: 10px;
  color: #64748b;
  text-transform: uppercase;
`;
