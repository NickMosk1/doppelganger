import { StatsGrid, StatCard, DetailSection, DetailTitle } from "../SimulationHistoryPage.styles";
import { EconomicImpact as EconomicImpactType } from "../types";

interface EconomicImpactProps {
  economicImpact: EconomicImpactType | undefined;
}

const formatCurrency = (value: number | undefined): string => {
  if (!value) return "0 ₽";
  return new Intl.NumberFormat('ru-RU').format(value) + " ₽";
};

const EconomicImpact: React.FC<EconomicImpactProps> = ({ economicImpact }) => {
  if (!economicImpact) return null;

  return (
    <DetailSection>
      <DetailTitle>💰 Экономические показатели</DetailTitle>
      <StatsGrid>
        <StatCard>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444' }}>
            {formatCurrency(economicImpact.totalReplacementCost)}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Стоимость замены</div>
        </StatCard>
        <StatCard>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>
            {formatCurrency(economicImpact.totalRepairCost)}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Стоимость ремонта</div>
        </StatCard>
        <StatCard>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#e54848' }}>
            {formatCurrency(economicImpact.totalLoss)}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Общий ущерб</div>
        </StatCard>
      </StatsGrid>
    </DetailSection>
  );
};

export default EconomicImpact;
