import styled from 'styled-components';
import { colors } from '../../shared/theme/colors';

export const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 112px);
  background: ${colors.background};
  overflow: hidden;
`;

export const HeaderActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px 12px 11px;
  background: ${colors.white};
  border-bottom: 1px solid ${colors.border};
  flex-shrink: 0;
`;

export const SchemaName = styled.div`
  input {
    font-size: 18px;
    font-weight: 600;
    padding: 8px 12px;
    border: 1px solid ${colors.border};
    border-radius: 8px;
    width: 300px;
    transition: all 0.2s ease;
    text-align: center;

    &:focus {
      outline: none;
      border-color: ${colors.primary};
      box-shadow: 0 0 0 2px ${colors.primaryLight}40;
    }
  }
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

export const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: 1px;
  background: ${colors.border};

  > * {
    background: ${colors.white};
  }
`;

interface DraftIndicatorProps {
  $isValid?: boolean;
}

export const DraftIndicator = styled.span<DraftIndicatorProps>`
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 20px;
  background: ${props => props.$isValid ? '#10b98120' : '#f59e0b20'};
  color: ${props => props.$isValid ? '#10b981' : '#f59e0b'};
  border: 1px solid ${props => props.$isValid ? '#10b981' : '#f59e0b'};
`;
