import styled from 'styled-components';
import { colors } from '../../../../../theme';

export const SectionContainer = styled.div<{ $nested?: boolean }>`
  margin-bottom: 5px;
  margin-top: 5px;
  margin-left: ${props => props.$nested ? '10px' : '0'};
`;

export const SectionHeader = styled.div<{ $nested?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: ${props => props.$nested ? '6px 8px' : '10px 12px'};
  background: ${props => props.$nested ? 'transparent' : colors.background};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.border};
  }
`;

export const SectionIcon = styled.span`
  font-size: 16px;
`;

export const SectionTitle = styled.span`
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: ${colors.text};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const SectionTitleNested = styled.span`
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  color: ${colors.textLight};
`;

interface ChevronProps {
  $expanded: boolean;
}

export const Chevron = styled.span<ChevronProps>`
  font-size: 10px;
  color: ${colors.textLighter};
  transition: transform 0.2s ease;
  transform: ${props => props.$expanded ? 'rotate(0deg)' : 'rotate(-90deg)'};
`;
