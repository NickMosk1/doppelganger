import { StatsGrid, StatCard, DetailSection, DetailTitle } from "../SimulationHistoryPage.styles";
import { EconomicImpact as EconomicImpactType } from "../types";
import styled from 'styled-components';

const LossesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  margin-top: 16px;
`;

const LossCard = styled.div<{ $type: 'replacement' | 'repair' }>`
  background: ${props => props.$type === 'replacement' ? '#fef2f2' : '#fefce8'};
  border-radius: 10px;
  padding: 10px 14px;
  border-left: 3px solid ${props => props.$type === 'replacement' ? '#ef4444' : '#eab308'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
`;

const LossName = styled.span`
  font-weight: 500;
  color: #1e293b;
`;

const LossAmount = styled.span<{ $type: 'replacement' | 'repair' }>`
  font-weight: 600;
  color: ${props => props.$type === 'replacement' ? '#dc2626' : '#ca8a04'};
`;

const Divider = styled.hr`
  margin: 16px 0;
  border: none;
  border-top: 1px solid #e2e8f0;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const SummaryLabel = styled.span`
  font-size: 12px;
  color: #64748b;
`;

const SummaryValue = styled.span<{ $highlight?: boolean }>`
  font-size: 14px;
  font-weight: ${props => props.$highlight ? '700' : '500'};
  color: ${props => props.$highlight ? '#ef4444' : '#1e293b'};
`;

const Badge = styled.span<{ $type: 'replacement' | 'repair' }>`
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 12px;
  background: ${props => props.$type === 'replacement' ? '#fef2f2' : '#fefce8'};
  color: ${props => props.$type === 'replacement' ? '#dc2626' : '#ca8a04'};
  margin-left: 8px;
`;

interface EconomicImpactProps {
  economicImpact: EconomicImpactType | undefined;
}

const formatCurrency = (value: number | undefined): string => {
  if (!value) return "0 ₽";
  return new Intl.NumberFormat('ru-RU').format(value) + " ₽";
};

const EconomicImpact: React.FC<EconomicImpactProps> = ({ economicImpact }) => {
  if (!economicImpact) return null;

  const deviceLosses = economicImpact.deviceLosses || {};
  const cableLosses = economicImpact.cableLosses || {};
  
  // Устройства всегда идут на замену
  const devicesForReplacement = Object.keys(deviceLosses);
  
  // Кабели идут в РЕМОНТ (поскольку repairCost > 0)
  const cablesForRepair = Object.keys(cableLosses);
  const cablesForReplacement: string[] = [];
  
  const totalReplacementCost = economicImpact.totalReplacementCost || 0;
  const totalRepairCost = economicImpact.totalRepairCost || 0;
  
  const devicesReplacementCount = devicesForReplacement.length;
  const cablesRepairCount = cablesForRepair.length;
  const totalReplacementCount = devicesReplacementCount + cablesForReplacement.length;
  const totalRepairCount = cablesRepairCount;

  // Сортируем по убыванию суммы
  const sortedDeviceLosses = Object.entries(deviceLosses)
    .sort(([, a], [, b]) => (b || 0) - (a || 0));
  
  const sortedCableLosses = Object.entries(cableLosses)
    .sort(([, a], [, b]) => (b || 0) - (a || 0));

  const totalAffected = devicesReplacementCount + cablesRepairCount;

  return (
    <DetailSection>
      <DetailTitle>💰 Экономические показатели</DetailTitle>
      
      {/* Основные показатели */}
      <StatsGrid>
        <StatCard>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444' }}>
            {formatCurrency(totalReplacementCost)}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            Замена оборудования
          </div>
          {devicesReplacementCount > 0 && (
            <div style={{ fontSize: '10px', color: '#ef4444', marginTop: '6px' }}>
              {devicesReplacementCount} {devicesReplacementCount === 1 ? 'устройство требует' : 'устройств требуют'} замены
            </div>
          )}
        </StatCard>
        
        <StatCard>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>
            {formatCurrency(totalRepairCost)}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            Ремонт оборудования
          </div>
          {cablesRepairCount > 0 && (
            <div style={{ fontSize: '10px', color: '#f59e0b', marginTop: '6px' }}>
              {cablesRepairCount} {cablesRepairCount === 1 ? 'кабель требует' : 'кабелей требуют'} ремонта
            </div>
          )}
        </StatCard>
        
        <StatCard>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#e54848' }}>
            {formatCurrency(economicImpact.totalLoss)}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            Общий ущерб
          </div>
          {totalAffected > 0 && (
            <div style={{ fontSize: '10px', color: '#e54848', marginTop: '6px' }}>
              Затронуто {totalAffected} {totalAffected === 1 ? 'элемент' : 'элементов'}
            </div>
          )}
        </StatCard>
      </StatsGrid>

      {/* ============ УСТРОЙСТВА, ТРЕБУЮЩИЕ ЗАМЕНЫ ============ */}
      {sortedDeviceLosses.length > 0 && (
        <>
          <Divider />
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#ef4444' }}>
              ⚠️ Устройства, требующие замены ({devicesReplacementCount})
            </span>
          </div>
          <LossesGrid>
            {sortedDeviceLosses.map(([name, cost]) => (
              <LossCard key={name} $type="replacement">
                <LossName>{name}</LossName>
                <div>
                  <LossAmount $type="replacement">{formatCurrency(cost)}</LossAmount>
                  <Badge $type="replacement">❌ Замена</Badge>
                </div>
              </LossCard>
            ))}
          </LossesGrid>
        </>
      )}

      {/* ============ КАБЕЛИ, ТРЕБУЮЩИЕ РЕМОНТА ============ */}
      {sortedCableLosses.length > 0 && (
        <>
          <Divider />
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#eab308' }}>
              🔌 Кабели, требующие ремонта ({cablesRepairCount})
            </span>
          </div>
          <LossesGrid>
            {sortedCableLosses.map(([name, cost]) => (
              <LossCard key={name} $type="repair">
                <LossName>{name}</LossName>
                <div>
                  <LossAmount $type="repair">{formatCurrency(cost)}</LossAmount>
                  <Badge $type="repair">⚠️ Ремонт</Badge>
                </div>
              </LossCard>
            ))}
          </LossesGrid>
        </>
      )}

      {/* Краткая сводка */}
      <Divider />
      <div style={{ 
        background: '#f8fafc', 
        borderRadius: '12px', 
        padding: '12px 16px',
        marginTop: '8px'
      }}>
        <SummaryRow>
          <SummaryLabel>Требуют замены</SummaryLabel>
          <SummaryValue $highlight={totalReplacementCount > 0}>
            {totalReplacementCount} {totalReplacementCount === 1 ? 'элемент' : 'элементов'}
            {totalReplacementCost > 0 && ` (${formatCurrency(totalReplacementCost)})`}
          </SummaryValue>
        </SummaryRow>
        <SummaryRow>
          <SummaryLabel>Требуют ремонта</SummaryLabel>
          <SummaryValue>
            {totalRepairCount} {totalRepairCount === 1 ? 'элемент' : 'элементов'}
            {totalRepairCost > 0 && ` (${formatCurrency(totalRepairCost)})`}
          </SummaryValue>
        </SummaryRow>
      </div>

      {/* Экономический совет */}
      <div style={{
        marginTop: '16px',
        padding: '12px 16px',
        background: totalReplacementCost > 0 ? '#fff5f5' : (totalRepairCost > 0 ? '#fff8e1' : '#e8f5e9'),
        borderRadius: '12px',
        borderLeft: `4px solid ${totalReplacementCost > 0 ? '#ef4444' : (totalRepairCost > 0 ? '#f59e0b' : '#10b981')}`,
        fontSize: '12px',
        color: totalReplacementCost > 0 ? '#b91c1c' : (totalRepairCost > 0 ? '#92400e' : '#2e7d32')
      }}>
        💡 {totalReplacementCost >= 500000 
          ? 'Критическое состояние сети! Требуется срочная замена оборудования и модернизация инфраструктуры.'
          : totalReplacementCost >= 100000
          ? 'Сеть требует внимания. Рекомендуется точечная замена повреждённых компонентов.'
          : totalRepairCost > 0
          ? 'Обнаружена деградация кабельной инфраструктуры. Рекомендуется провести ремонт или замену повреждённых кабелей.'
          : 'Сеть работает в штатном режиме. Ущерб отсутствует.'}
      </div>
    </DetailSection>
  );
};

export default EconomicImpact;
