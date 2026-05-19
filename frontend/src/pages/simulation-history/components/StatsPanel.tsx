import { StatsGrid, StatCard } from "../SimulationHistoryPage.styles";
import { Summary } from "../types";

interface StatsPanelProps {
  summary: Summary | undefined;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ summary }) => {
  return (
    <StatsGrid>
      <StatCard>
        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#e54848' }}>
          {summary?.maxLatencyMs?.toFixed(1) || 0}
        </div>
        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>📈 Макс. задержка (мс)</div>
      </StatCard>
      <StatCard>
        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>
          {summary?.avgLatencyMs?.toFixed(1) || 0}
        </div>
        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>📊 Ср. задержка (мс)</div>
      </StatCard>
      <StatCard>
        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>
          {Math.round(summary?.throughputMbps || 0)}
        </div>
        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>⚡ Пропускная способность (Mbps)</div>
      </StatCard>
      <StatCard>
        <div style={{ fontSize: '28px', fontWeight: 'bold', color: (summary?.packetLossPercent || 0) > 20 ? '#ef4444' : '#10b981' }}>
          {summary?.packetLossPercent?.toFixed(1) || 0}%
        </div>
        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>📉 Потери пакетов</div>
      </StatCard>
    </StatsGrid>
  );
};

export default StatsPanel;
