import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart, Bar
} from 'recharts';
import { DetailSection, DetailTitle, TimelineContainer, TimelineItem } from "../SimulationHistoryPage.styles";
import { TimelinePoint } from "../types";

interface TimelineChartProps {
  timeline: TimelinePoint[] | undefined;
}

const TimelineChart: React.FC<TimelineChartProps> = ({ timeline }) => {
  if (!timeline || timeline.length === 0) return null;

  const chartData = timeline.map(point => ({
    time: point.timestamp,
    latency: point.avgLatencyMs,
    packetLoss: point.packetLossPercent,
    throughput: point.totalThroughputMbps,
    alerts: point.activeAlertsCount,
    critical: point.activeCriticalCount,
  }));

  return (
    <DetailSection>
      <DetailTitle>📈 Динамика по времени</DetailTitle>
      
      {/* График задержки и потерь */}
      <div style={{ height: '300px', marginBottom: '24px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" label={{ value: 'Время (сек)', position: 'bottom' }} />
            <YAxis yAxisId="left" label={{ value: 'Задержка (мс)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Потери (%)', angle: 90, position: 'insideRight' }} />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="latency" stroke="#e54848" name="Задержка (мс)" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="packetLoss" stroke="#f59e0b" name="Потери пакетов (%)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* График пропускной способности */}
      <div style={{ height: '250px', marginBottom: '24px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis label={{ value: 'Пропускная способность (Mbps)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="throughput" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Пропускная способность" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Список точек для мобильной версии */}
      <TimelineContainer>
        {timeline.map((point, idx) => (
          <TimelineItem key={idx}>
            <strong>t = {point.timestamp} с</strong> — 
            задержка: {point.avgLatencyMs.toFixed(1)} мс, 
            потери: {point.packetLossPercent.toFixed(1)}%
            {point.activeAlertsCount !== undefined && point.activeAlertsCount > 0 && (
              <span style={{ color: '#f59e0b', marginLeft: '8px' }}>⚠️ {point.activeAlertsCount}</span>
            )}
            {point.activeCriticalCount !== undefined && point.activeCriticalCount > 0 && (
              <span style={{ color: '#ef4444', marginLeft: '8px' }}>🔥 {point.activeCriticalCount}</span>
            )}
          </TimelineItem>
        ))}
      </TimelineContainer>
    </DetailSection>
  );
};

export default TimelineChart;
