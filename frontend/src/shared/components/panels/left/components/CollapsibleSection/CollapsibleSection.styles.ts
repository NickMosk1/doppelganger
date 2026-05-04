import styled from 'styled-components';
import { colors } from '../../../../../theme';

export const SectionContainer = styled.div`
  margin-bottom: 8px;
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: ${colors.background};
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;

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

interface ChevronProps {
  $expanded: boolean;
}

export const Chevron = styled.span<ChevronProps>`
  font-size: 10px;
  color: ${colors.textLighter};
  transition: transform 0.2s ease;
  transform: ${props => props.$expanded ? 'rotate(0deg)' : 'rotate(-90deg)'};
`;
