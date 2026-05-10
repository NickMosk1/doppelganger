// src/pages/schema-editor/SchemaEditorPage.styles.ts
import styled from 'styled-components';
import { colors } from '../../shared/theme/colors';

export const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: ${colors.background};
  overflow: hidden;
`;

export const HeaderActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: ${colors.white};
  border-bottom: 1px solid ${colors.border};
  flex-shrink: 0;
`;

export const SchemaName = styled.div`
  display: flex;
  align-items: center;
`;

export const SchemaNameText = styled.span`
  font-size: 18px;
  font-weight: 600;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  color: ${colors.text};
  
  &:hover {
    background: ${colors.background};
    color: ${colors.primary};
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
  
  > *:first-child {
    border-radius: 0 8px 8px 0;
  }
  
  > *:last-child {
    border-radius: 8px 0 0 8px;
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
