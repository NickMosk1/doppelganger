import styled from 'styled-components';
import { colors } from '../../shared/theme/colors';

export const PageContainer = styled.div`
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 112px);
  background: ${colors.background};
`;

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
`;

export const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: ${colors.text};
  margin: 0;
`;

export const SchemasGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 28px;
`;

export const SchemaCard = styled.div`
  background: ${colors.white};
  border-radius: 20px;
  border: 1px solid ${colors.border};
  padding: 24px;
  transition: all 0.2s ease;

  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${colors.shadow};
  }
`;

export const SchemaCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  width: 100%;
`;

export const SchemaNameText = styled.span`
  font-size: 18px;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  color: ${colors.text};
  
  &:hover {
    background: ${colors.background};
    color: ${colors.primary};
  }
`;

export const SchemaCardDescription = styled.div`
  font-size: 14px;
  color: ${colors.textLight};
  line-height: 1.4;
  margin-top: 4px;
`;

export const SchemaCardDate = styled.div`
  font-size: 14px;
  color: ${colors.textLighter};
`;

export const SchemaCardStats = styled.div`
  display: flex;
  gap: 24px;
  padding: 20px 0;
  border-top: 1px solid ${colors.border};
  border-bottom: 1px solid ${colors.border};
  margin-bottom: 10px;
  width: 100%;
`;

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
`;

export const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${colors.primary};
`;

export const StatLabel = styled.div`
  font-size: 12px;
  color: ${colors.textLight};
  text-transform: uppercase;
  margin-top: 6px;
  letter-spacing: 0.5px;
`;

export const SchemaCardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
`;

export const SchemaCardActions = styled.div`
  display: flex;
  gap: 12px;
`;

interface BadgeProps {
  $hasChanges?: boolean;
  $isValid?: boolean;
}

export const DraftBadge = styled.span<BadgeProps>`
  font-size: 11px;
  padding: 4px 12px;
  border-radius: 16px;
  background: ${props => props.$hasChanges ? '#f59e0b20' : '#10b98120'};
  color: ${props => props.$hasChanges ? '#f59e0b' : '#10b981'};
  font-weight: 500;
`;

export const ValidationBadge = styled.span<BadgeProps>`
  font-size: 11px;
  padding: 4px 12px;
  border-radius: 16px;
  background: '#10b98120';
  color: '#10b981';
  font-weight: 500;
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80px 20px;
  color: ${colors.textLighter};
  
  span {
    font-size: 80px;
    margin-bottom: 20px;
  }
  
  p {
    font-size: 18px;
    margin-bottom: 28px;
  }
`;

export const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
  font-size: 18px;
  color: ${colors.textLight};
`;

export const VisibilityBadge = styled.div<{ $isPublic: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
  margin: 0 0 8px 0;
  background: ${props => props.$isPublic ? '#e8f5e9' : '#f3f4f6'};
  color: ${props => props.$isPublic ? '#2e7d32' : '#6b7280'};
  border: 1px solid ${props => props.$isPublic ? '#a5d6a7' : '#e5e7eb'};
`;
