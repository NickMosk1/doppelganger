import styled from 'styled-components';
import { colors } from '../../../../../theme';

interface CardBadgeProps {
  $isCustom?: boolean;
}

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

export const CardContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  background: ${colors.white};
  border: 1px solid ${colors.border};
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 60px;
  text-align: center;

  &:hover {
    box-shadow: 0 4px 12px ${colors.shadow};
    border-color: ${colors.primaryLight};
    div[data-tooltip] {
      opacity: 1;
      visibility: visible;
    }
  }
`;

export const CardIcon = styled.div`
  font-size: 24px;
  margin-bottom: 4px;
`;

export const CardName = styled.div`
  font-size: 10px;
  font-weight: 500;
  color: ${colors.text};
  margin-bottom: 2px;
  word-break: break-word;
  max-width: 70px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  &:hover {
    white-space: normal;
    word-break: break-word;
    background: ${colors.white};
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    padding: 4px 8px;
    border-radius: 6px;
    box-shadow: 0 2px 8px ${colors.shadow};
    z-index: 10;
    font-size: 10px;
    white-space: nowrap;
  }
`;

interface CardBadgeProps {
  $isCustom?: boolean;
}

export const CardBadge = styled.div<CardBadgeProps>`
  font-size: 8px;
  padding: 2px 4px;
  border-radius: 8px;
  background: ${props => props.$isCustom ? colors.primaryLight : colors.backgroundDark};
  color: ${props => props.$isCustom ? colors.white : colors.textLight};
  margin-top: 2px;
`;

export const CardStats = styled.div`
  font-size: 8px;
  color: ${colors.textLighter};
  margin-top: 2px;
`;
