import styled from 'styled-components';
import { colors } from '../../../theme';

export const RightPanelContainer = styled.aside`
  position: relative;
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
  padding: 14px 16px;
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: ${props => props.active ? colors.primary : colors.textLight};
  border-bottom: 2px solid ${props => props.active ? colors.primary : 'transparent'};
  transition: all 0.2s ease;

  &:hover {
    color: ${colors.primary};
    background: ${colors.background};
  }
`;

export const ResizeHandle = styled.div`
  position: absolute;
  left: -5px;
  top: 0;
  width: 10px;
  height: 100%;
  cursor: ew-resize;
  z-index: 1000;
  transition: background 0.15s ease;
  user-select: none;
  
  &:hover {
    background: ${colors.primary}30;
  }
  
  &:active {
    background: ${colors.primary}50;
  }
`;

export const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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

export const EditButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${colors.background};
  }
`;

export const PanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  
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
  margin-bottom: 24px;
`;

export const PropertyLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${colors.textLight};
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const PropertyValue = styled.div`
  font-size: 14px;
  color: ${colors.text};
  background: ${colors.background};
  padding: 10px 14px;
  border-radius: 10px;
  word-break: break-word;
  border: 1px solid ${colors.border};
`;

export const PropertyInput = styled.input`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid ${colors.border};
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: ${colors.white};
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px ${colors.primaryLight}40;
  }
  
  &:disabled {
    background: ${colors.background};
    color: ${colors.textLight};
    cursor: not-allowed;
  }
`;

export const Section = styled.div`
  margin-bottom: 28px;
`;

export const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.text};
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${colors.border};
`;

export const Divider = styled.hr`
  margin: 20px 0;
  border: none;
  border-top: 1px solid ${colors.border};
`;

export const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 6px 14px;
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
  padding: 200px 24px;
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

// Стили для вкладки факторов
export const FactorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
  padding: 8px 0;
`;

export const FactorLabel = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${colors.text};
  width: 110px;
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
    transition: transform 0.1s ease;
    
    &:hover {
      transform: scale(1.2);
    }
  }
`;

export const FactorValue = styled.div`
  font-size: 12px;
  color: ${colors.primary};
  font-weight: 600;
  width: 55px;
  text-align: right;
  font-family: monospace;
`;

// Стили для карточек подключений
export const ConnectionCard = styled.div`
  background: ${colors.background};
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid ${colors.border};
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${colors.primaryLight};
    box-shadow: 0 2px 8px ${colors.shadow};
  }
`;

export const ConnectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
`;

export const ConnectionDevice = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${colors.text};
`;

export const ConnectionPort = styled.span`
  font-size: 10px;
  font-weight: 500;
  color: ${colors.white};
  background: ${colors.primary};
  padding: 2px 8px;
  border-radius: 12px;
`;

export const ConnectionDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 8px;
  margin-left: 8px;
  border-top: 1px solid ${colors.border};
`;

export const DetailItem = styled.div`
  display: flex;
  gap: 6px;
  font-size: 11px;
`;

export const DetailLabel = styled.span`
  color: ${colors.textLight};
`;

export const DetailValue = styled.span`
  color: ${colors.text};
  font-weight: 500;
`;

// Стили для кнопки
export const Button = styled.button<{ fullWidth?: boolean; loading?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  background: ${colors.primary};
  color: ${colors.white};
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: ${props => props.loading ? 'wait' : 'pointer'};
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  transition: all 0.2s ease;
  opacity: ${props => props.loading ? 0.7 : 1};
  
  &:hover:not(:disabled) {
    background: ${colors.primaryHover};
    transform: translateY(-1px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const EditModeButton = styled.button`
  background: ${colors.primary};
  color: ${colors.white};
  border: none;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${colors.primaryHover};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const ViewModeButton = styled.button`
  background: ${colors.white};
  color: ${colors.primary};
  border: 1px solid ${colors.primary};
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${colors.background};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const DeleteButton = styled.button`
  background: #ef4444;
  color: ${colors.white};
  border: none;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #dc2626;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;
// src/shared/components/Canvas/RightPanel/RightPanel.styles.ts

// Добавьте эти компоненты в существующий файл

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
`;

export const StatCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 8px;
  text-align: center;
  transition: all 0.2s ease;

  &:hover {
    border-color: #cbd5e1;
    background: #f1f5f9;
  }
`;

export const StatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
`;

export const StatLabel = styled.div`
  font-size: 10px;
  color: #64748b;
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;
