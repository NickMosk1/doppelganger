import styled from 'styled-components';
import { colors } from '../../shared/theme/colors';

export const HomeContainer = styled.div`
  min-height: calc(100vh - 132px);
  background: ${colors.background};
`;

export const Header = styled.header`
  background: ${colors.white};
  border-bottom: 1px solid ${colors.border};
  position: sticky;
  top: 0;
  z-index: 100;
`;

export const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  max-width: 1400px;
  margin: 0 auto;
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  span {
    font-size: 24px;
  }

  h1 {
    font-size: 20px;
    color: ${colors.primary};
    margin: 0;
  }
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  span {
    color: ${colors.textLight};
    font-size: 14px;
  }
`;

export const MainContent = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
`;

export const WelcomeSection = styled.div`
  text-align: center;
  margin-bottom: 48px;
`;

export const WelcomeTitle = styled.h1`
  font-size: 36px;
  font-weight: 700;
  color: ${colors.text};
  margin: 20px 0px;
`;

export const WelcomeDescription = styled.p`
  font-size: 16px;
  color: ${colors.textLight};
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 48px;
`;

export const StatCard = styled.div`
  background: ${colors.white};
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 2px 8px ${colors.shadow};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px ${colors.shadow};
  }
`;

export const StatValue = styled.div`
  font-size: 36px;
  font-weight: 700;
  color: ${colors.primary};
  margin-bottom: 8px;
`;

export const StatLabel = styled.div`
  font-size: 14px;
  color: ${colors.textLight};
`;

export const SchemasSection = styled.section``;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h2 {
    font-size: 24px;
    color: ${colors.text};
  }
`;

export const CreateButtonWrapper = styled.div``;

export const SchemasGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
`;

export const SchemaCard = styled.div`
  background: ${colors.white};
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px ${colors.shadow};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px ${colors.shadow};
  }

  p {
    color: ${colors.textLight};
    font-size: 14px;
    line-height: 1.5;
    margin: 12px 0;
  }
`;

export const SchemaCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

export const SchemaCardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${colors.text};
`;

export const SchemaCardDate = styled.span`
  font-size: 12px;
  color: ${colors.textLighter};
`;

export const SchemaCardActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 60px;
  background: ${colors.white};
  border-radius: 16px;

  p {
    color: ${colors.textLight};
    margin-bottom: 20px;
  }
`;

export const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: ${colors.textLight};
`;
