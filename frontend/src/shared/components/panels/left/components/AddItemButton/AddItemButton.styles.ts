import styled from 'styled-components';
import { colors } from '../../../../../theme';

export const AddButtonContainer = styled.div<{ $size: string; $fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.$size === "small" ? '8px 4px' : '10px 8px'};
  background: ${colors.background};
  border: 1px solid ${colors.border};
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  min-width: ${props => props.$size === "small" ? '60px' : '80px'};

  &:hover {
    border-color: ${colors.primary};
    background: ${colors.errorLight};
  }
`;

export const AddButtonLabel = styled.div<{ $size: string }>`
  font-size: ${props => props.$size === "small" ? '11px' : '13px'};
  color: ${colors.primary};
  font-weight: 600;
`;
