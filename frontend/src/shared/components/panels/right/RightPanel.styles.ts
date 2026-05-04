import styled from 'styled-components';
import { colors } from '../../../theme';

export const RightPanelContainer = styled.aside`
  width: 320px;
  height: 100%;
  background: ${colors.white};
  border-left: 1px solid ${colors.border};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
`;

export const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${colors.border};
  background: ${colors.white};
  flex-shrink: 0;
`;

interface TabProps {
  active: boolean;
}

export const Tab = styled.button<TabProps>`
  flex: 1;
  padding: 12px 16px;
  background: none;
  border: none;
  font-size: 13px;
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

export const PanelHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${colors.border};
  flex-shrink: 0;
`;

export const PanelTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${colors.text};
  margin: 0;
`;

export const PanelContent = styled.div`
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
`;

export const PropertyGroup = styled.div`
  margin-bottom: 20px;
`;

export const PropertyLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${colors.textLight};
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

export const PropertyValue = styled.div`
  font-size: 14px;
  color: ${colors.text};
  background: ${colors.background};
  padding: 8px 12px;
  border-radius: 8px;
  word-break: break-word;
`;

export const PropertyInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px ${colors.primaryLight}40;
  }
`;

export const Section = styled.div`
  margin-bottom: 24px;
`;

export const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.text};
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Divider = styled.hr`
  margin: 16px 0;
  border: none;
  border-top: 1px solid ${colors.border};
`;

export const FactorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

export const FactorLabel = styled.div`
  font-size: 13px;
  color: ${colors.text};
  width: 100px;
  flex-shrink: 0;
`;

export const FactorSlider = styled.input`
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: ${colors.border};
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${colors.primary};
    cursor: pointer;
  }
`;

export const FactorValue = styled.div`
  font-size: 12px;
  color: ${colors.primary};
  font-weight: 500;
  width: 50px;
  text-align: right;
`;

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = styled.span<StatusBadgeProps>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => 
    props.status === 'success' ? '#10b98120' :
    props.status === 'warning' ? '#f59e0b20' :
    props.status === 'error' ? '#ef444420' : colors.background
  };
  color: ${props => 
    props.status === 'success' ? '#10b981' :
    props.status === 'warning' ? '#f59e0b' :
    props.status === 'error' ? '#ef4444' : colors.textLight
  };
`;

export const NoSelectionMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 24px;
  color: ${colors.textLighter};
  
  span {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  p {
    font-size: 14px;
    line-height: 1.5;
    margin: 0;
  }
`;
