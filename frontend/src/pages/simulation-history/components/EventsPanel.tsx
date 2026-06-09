import { useState, useMemo } from 'react';
import { DetailRow, DetailLabel, DetailValue, DetailSection, DetailTitle } from "../SimulationHistoryPage.styles";
import { CriticalEvent } from "../types";
import styled from 'styled-components';

// Стилизованные компоненты
const EventsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
`;

const StatsBadge = styled.div`
  display: flex;
  gap: 12px;
`;

const StatBadge = styled.span<{ $severity: string }>`
  font-size: 14px;
  padding: 4px 10px;
  border-radius: 20px;
  background: ${props => 
    props.$severity === 'CRITICAL' ? '#fef2f2' :
    props.$severity === 'WARNING' ? '#fffbeb' : '#f1f5f9'
  };
  color: ${props => 
    props.$severity === 'CRITICAL' ? '#ef4444' :
    props.$severity === 'WARNING' ? '#f59e0b' : '#64748b'
  };
  font-weight: 500;
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active: boolean }>`
  padding: 4px 12px;
  font-size: 14px;
  border-radius: 16px;
  border: 1px solid ${props => props.$active ? '#e54848' : '#e2e8f0'};
  background: ${props => props.$active ? '#e54848' : 'white'};
  color: ${props => props.$active ? 'white' : '#64748b'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #e54848;
    color: ${props => props.$active ? 'white' : '#e54848'};
  }
`;

const TimelineGroup = styled.div`
  margin-bottom: 20px;
`;

const TimelineHeader = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  background: #f8fafc;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-left: 3px solid #e54848;
`;

const EventCard = styled.div<{ $severity: string }>`
  background: white;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #e2e8f0;
  border-left: 3px solid ${props => getSeverityColor(props.$severity)};
  transition: all 0.2s ease;
  cursor: default;

  &:hover {
    background: #fafbfc;
  }
`;

const EventHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
  flex-wrap: wrap;
`;

const EventTypeBadge = styled.span<{ $severity: string }>`
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  background: ${props => getSeverityColor(props.$severity) + '15'};
  color: ${props => getSeverityColor(props.$severity)};
`;

const EventTime = styled.span`
  font-size: 14px;
  color: #94a3b8;
  font-family: monospace;
`;

const EventMessage = styled.div<{ $severity: string }>`
  font-size: 16px;
  color: ${props => props.$severity === 'CRITICAL' ? '#b91c1c' : '#1e293b'};
  margin-bottom: 8px;
  line-height: 1.4;
`;

const EventRecommendation = styled.div`
  font-size: 14px;
  color: #10b981;
  background: #e8f5e9;
  padding: 6px 10px;
  border-radius: 6px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'CRITICAL': return '#ef4444';
    case 'WARNING': return '#f59e0b';
    default: return '#3b82f6';
  }
};

type FilterType = 'all' | 'CRITICAL' | 'WARNING';

interface EventsPanelProps {
  events: CriticalEvent[] | undefined;
}

const EventsPanel: React.FC<EventsPanelProps> = ({ events }) => {
  const [filter, setFilter] = useState<FilterType>('all');

  if (!events || events.length === 0) {
    return (
      <DetailSection>
        <DetailTitle>⚠️ Критические события</DetailTitle>
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '16px' }}>
          ✅ Критических событий не зафиксировано
        </div>
      </DetailSection>
    );
  }

  // Статистика
  const stats = useMemo(() => {
    const critical = events.filter(e => e.severity === 'CRITICAL').length;
    const warning = events.filter(e => e.severity === 'WARNING').length;
    const info = events.filter(e => e.severity !== 'CRITICAL' && e.severity !== 'WARNING').length;
    return { critical, warning, info, total: events.length };
  }, [events]);

  // Фильтрация
  const filteredEvents = useMemo(() => {
    if (filter === 'all') return events;
    return events.filter(e => e.severity === filter);
  }, [events, filter]);

  // Группировка по времени
  const groupedEvents = useMemo(() => {
    const groups: Record<number, CriticalEvent[]> = {};
    filteredEvents.forEach(event => {
      if (!groups[event.timestamp]) {
        groups[event.timestamp] = [];
      }
      groups[event.timestamp].push(event);
    });
    return Object.entries(groups).sort(([a], [b]) => Number(a) - Number(b));
  }, [filteredEvents]);

  return (
    <DetailSection>
      <DetailTitle>⚠️ Критические события</DetailTitle>
      
      <EventsHeader>
        <StatsBadge>
          <StatBadge $severity="CRITICAL">
            🔴 Критических: {stats.critical}
          </StatBadge>
          <StatBadge $severity="WARNING">
            🟡 Предупреждений: {stats.warning}
          </StatBadge>
          <StatBadge $severity="INFO">
            Всего: {stats.total}
          </StatBadge>
        </StatsBadge>
        
        <FilterGroup>
          <FilterButton 
            $active={filter === 'all'} 
            onClick={() => setFilter('all')}
          >
            Все
          </FilterButton>
          <FilterButton 
            $active={filter === 'CRITICAL'} 
            onClick={() => setFilter('CRITICAL')}
          >
            🔴 Критические
          </FilterButton>
          <FilterButton 
            $active={filter === 'WARNING'} 
            onClick={() => setFilter('WARNING')}
          >
            🟡 Предупреждения
          </FilterButton>
        </FilterGroup>
      </EventsHeader>

      {groupedEvents.map(([timestamp, groupEvents]) => (
        <TimelineGroup key={timestamp}>
          <TimelineHeader>
            <span>⏱️</span>
            <span>t = {timestamp} секунд</span>
            <span style={{ fontSize: '14px', color: '#64748b' }}>
              ({groupEvents.length} {groupEvents.length === 1 ? 'событие' : 'событий'})
            </span>
          </TimelineHeader>
          
          {groupEvents.map((event, idx) => (
            <EventCard key={idx} $severity={event.severity}>
              <EventHeader>
                <EventTypeBadge $severity={event.severity}>
                  {event.type}
                </EventTypeBadge>
                <EventTime>t = {event.timestamp} с</EventTime>
              </EventHeader>
              
              <EventMessage $severity={event.severity}>
                {event.message}
              </EventMessage>
              
              {event.recommendation && (
                <EventRecommendation>
                  <span>💡</span>
                  <span>{event.recommendation}</span>
                </EventRecommendation>
              )}
            </EventCard>
          ))}
        </TimelineGroup>
      ))}
    </DetailSection>
  );
};

export default EventsPanel;
