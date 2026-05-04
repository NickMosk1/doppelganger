import styled from 'styled-components';
import { colors } from '../../../../../theme';

export const AddButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  background: ${colors.background};
  border: 2px dashed ${colors.border};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;

  &:hover {
    border-color: ${colors.primary};
    background: ${colors.errorLight};
  }
`;

export const PlusIcon = styled.div`
  font-size: 28px;
  color: ${colors.primary};
  margin-bottom: 4px;
`;

export const AddButtonLabel = styled.div`
  font-size: 11px;
  color: ${colors.primary};
  font-weight: 500;
`;
