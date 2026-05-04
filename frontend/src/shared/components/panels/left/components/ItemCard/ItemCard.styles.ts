import styled from 'styled-components';
import { colors } from '../../../../../theme';

export const CardContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  background: ${colors.white};
  border: 1px solid ${colors.border};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
  text-align: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${colors.shadow};
    border-color: ${colors.primaryLight};

    div[data-tooltip] {
      opacity: 1;
      visibility: visible;
    }
  }

  &:active {
    transform: translateY(0);
  }
`;

export const CardIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
`;

export const CardName = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${colors.text};
  margin-bottom: 4px;
  word-break: break-word;
`;

interface CardBadgeProps {
  $isCustom?: boolean;
}

export const CardBadge = styled.div<CardBadgeProps>`
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 10px;
  background: ${props => props.$isCustom ? colors.primaryLight : colors.backgroundDark};
  color: ${props => props.$isCustom ? colors.white : colors.textLight};
  margin-top: 4px;
`;

export const CardStats = styled.div`
  font-size: 9px;
  color: ${colors.textLighter};
  margin-top: 4px;
`;

export const CardTooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  padding: 6px 10px;
  background: ${colors.text};
  color: ${colors.white};
  font-size: 11px;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease;
  pointer-events: none;
  z-index: 100;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: ${colors.text};
  }
`;
