import { DetailRow, DetailLabel, DetailValue, DetailSection, DetailTitle } from "../SimulationHistoryPage.styles";
import { CriticalEvent } from "../types";

interface EventsPanelProps {
  events: CriticalEvent[] | undefined;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'CRITICAL': return '#ef4444';
    case 'WARNING': return '#f59e0b';
    default: return '#3b82f6';
  }
};

const getEventIcon = (type: string) => {
  switch (type) {
    case 'DEVICE_FAILURE': return '💀';
    case 'CABLE_FAILURE': return '🔌💀';
    case 'CABLE_DEGRADATION': return '⚠️🔌';
    case 'HIGH_LATENCY': return '🐌';
    case 'THRESHOLD_EXCEEDED': return '⚠️';
    case 'FACTOR_WARNING': return '🌡️';
    case 'FACTOR_CRITICAL': return '🔥';
    case 'FACTOR_FAILURE': return '💥';
    default: return '⚠️';
  }
};

const EventsPanel: React.FC<EventsPanelProps> = ({ events }) => {
  if (!events || events.length === 0) return null;

  return (
    <DetailSection>
      <DetailTitle>⚠️ Критические события</DetailTitle>
      {events.map((event, idx) => (
        <DetailRow key={idx}>
          <DetailLabel style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{getEventIcon(event.type)}</span>
            <span style={{ 
              padding: '2px 8px', 
              borderRadius: '20px', 
              fontSize: '11px',
              background: getSeverityColor(event.severity) + '20',
              color: getSeverityColor(event.severity)
            }}>
              {event.type}
            </span>
          </DetailLabel>
          <DetailValue style={{ 
            color: event.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b',
            fontSize: '12px',
            textAlign: 'right',
            maxWidth: '60%'
          }}>
            <div>{event.message}</div>
            {event.recommendation && (
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                💡 {event.recommendation}
              </div>
            )}
          </DetailValue>
        </DetailRow>
      ))}
    </DetailSection>
  );
};

export default EventsPanel;
