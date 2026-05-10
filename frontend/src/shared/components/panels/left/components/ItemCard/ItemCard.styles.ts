import styled from 'styled-components';
import { colors } from '../../../../../theme';

export const CardContainer = styled.div<{ $isSelected?: boolean; $isCustom?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 6px;
  background: ${props => props.$isSelected ? colors.primaryLight + '20' : colors.white};
  border: 1px solid ${props => {
    if (props.$isSelected) return colors.primary;
    if (props.$isCustom) return colors.primaryLight + '60';
    return colors.border;
  }};
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 70px;
  text-align: center;
  position: relative;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px ${colors.shadow};
    border-color: ${colors.primaryLight};
  }
`;

// Маркер кастомности (звездочка в углу)
export const CustomMarker = styled.div`
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  background: ${colors.primary};
  color: ${colors.white};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  z-index: 1;
`;

export const CardIcon = styled.div`
  font-size: 24px;
  margin-bottom: 6px;
`;

export const CardName = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${colors.text};
  margin-bottom: 4px;
  word-break: break-word;
  max-width: 70px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const CardBadge = styled.div<{ $isCustom?: boolean }>`
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 8px;
  background: ${props => props.$isCustom ? colors.primaryLight : colors.backgroundDark};
  color: ${props => props.$isCustom ? colors.white : colors.textLight};
  margin-top: 2px;
`;

export const CardStats = styled.div`
  font-size: 9px;
  color: ${colors.textLighter};
  margin-top: 2px;
`;

// Тултип
export const CardTooltip = styled.div<{ $left?: number; $top?: number }>`
  position: fixed;
  left: ${props => props.$left || 0}px;
  top: ${props => props.$top || 0}px;
  background: ${colors.white};
  color: ${colors.text};
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid ${colors.border};
  z-index: 10000;
  min-width: 220px;
  max-width: 280px;
  pointer-events: none;
  animation: fadeIn 0.15s ease;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateX(-5px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

export const TooltipTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.primary};
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid ${colors.border};
`;

export const TooltipRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const TooltipLabel = styled.span`
  color: ${colors.textLight};
  margin-right: 12px;
`;

export const TooltipValue = styled.span`
  color: ${colors.text};
  font-weight: 500;
`;
