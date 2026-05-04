import styled from 'styled-components';
import { colors } from '../../../theme';

export const LeftPanelContainer = styled.aside`
  width: 320px;
  height: 100%;
  background: ${colors.white};
  border-right: 1px solid ${colors.border};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
`;

export const TabHeader = styled.div`
  display: flex;
  border-bottom: 1px solid ${colors.border};
  background: ${colors.white};
  flex-shrink: 0;
`;

interface PanelTabProps {
  active: boolean;
}

export const PanelTab = styled.button<PanelTabProps>`
  flex: 1;
  padding: 12px 16px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  color: ${props => props.active ? colors.primary : colors.textLight};
  border-bottom: 2px solid ${props => props.active ? colors.primary : 'transparent'};
  transition: all 0.2s ease;

  &:hover {
    color: ${colors.primary};
    background: ${colors.background};
  }
`;

export const SearchContainer = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid ${colors.border};
  flex-shrink: 0;
`;

export const TabContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${colors.background};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${colors.border};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${colors.textLighter};
  }
`;

export const CategorySection = styled.div`
  display: flex;
  margin: 5px 10px;
  gap: 5px;
`;

export const CategoryTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${colors.textLighter};
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid ${colors.border};
`;

export const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const DragItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: ${colors.white};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${colors.background};
    border-color: ${colors.primaryLight};
    transform: translateX(2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  &:active {
    cursor: grabbing;
  }
`;

export const ItemIcon = styled.div`
  font-size: 20px;
  width: 28px;
  text-align: center;
`;

export const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ItemName = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ItemType = styled.div`
  font-size: 10px;
  color: ${colors.textLighter};
`;

export const ItemDescription = styled.div`
  font-size: 10px;
  color: ${colors.textLighter};
  margin-top: 2px;
`;
