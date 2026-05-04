import styled from 'styled-components';
import { colors } from '../../../../../theme';
// AddItemButton.styles.ts
export const AddButtonContainer = styled.div<{ $size: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.$size === "small" ? '6px 4px' : '8px 4px'};
  background: ${colors.background};
  border: 2px dashed ${colors.border};
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: ${props => props.$size === "small" ? '60px' : '70px'};

  &:hover {
    border-color: ${colors.primary};
    background: ${colors.errorLight};
  }
`;

export const PlusIcon = styled.div<{ $size: string }>`
  font-size: ${props => props.$size === "small" ? '20px' : '24px'};
  color: ${colors.primary};
  margin-bottom: 2px;
`;

export const AddButtonLabel = styled.div<{ $size: string }>`
  font-size: ${props => props.$size === "small" ? '9px' : '10px'};
  color: ${colors.primary};
  font-weight: 500;
`;
