import styled from "styled-components";
import StatsPanel from "./StatsPanel";
import EventsPanel from "./EventsPanel";
import RecommendationsPanel from "./RecommendationsPanel";
import TimelineChart from "./TimelineChart";
import EconomicImpact from "./EconomicImpact";
import { SimulationResult } from "../types";
import { DetailSection, DetailTitle, PathContainer, PathNode, PathArrow } from "../SimulationHistoryPage.styles";
import { useState } from "react";

const TabsContainer = styled.div`
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 20px;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.active ? '#e54848' : '#64748b'};
  border-bottom: 2px solid ${props => props.active ? '#e54848' : 'transparent'};
  transition: all 0.2s ease;

  &:hover {
    color: #e54848;
  }
`;

type TabType = 'stats' | 'events' | 'charts' | 'economics' | 'recommendations';

interface SimulationDetailsProps {
  simulation: SimulationResult | null;
  isLoading: boolean;
}

const SimulationDetails: React.FC<SimulationDetailsProps> = ({ simulation, isLoading }) => {
  const [activeTab, setActiveTab] = useState<TabType>('stats');

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>⏳ Загрузка деталей...</div>;
  }

  if (!simulation) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#ef4444' }}>❌ Ошибка загрузки деталей</div>;
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return '#10b981';
      case 'B': return '#3b82f6';
      case 'C': return '#f59e0b';
      default: return '#ef4444';
    }
  };

  return (
    <>
      {/* Вкладки */}
      <TabsContainer>
        <Tab active={activeTab === 'stats'} onClick={() => setActiveTab('stats')}>
          📊 Статистика
        </Tab>
        <Tab active={activeTab === 'events'} onClick={() => setActiveTab('events')}>
          ⚠️ События ({simulation.events?.length || 0})
        </Tab>
        <Tab active={activeTab === 'charts'} onClick={() => setActiveTab('charts')}>
          📈 Графики
        </Tab>
        <Tab active={activeTab === 'economics'} onClick={() => setActiveTab('economics')}>
          💰 Экономика
        </Tab>
        <Tab active={activeTab === 'recommendations'} onClick={() => setActiveTab('recommendations')}>
          💡 Рекомендации
        </Tab>
      </TabsContainer>

      {/* Содержимое вкладок */}
      {activeTab === 'stats' && (
        <>
          <StatsPanel summary={simulation.summary} />

          {/* Отказ оборудования */}
          {(simulation.summary?.devicesFailed !== undefined && simulation.summary.devicesFailed > 0) ||
           (simulation.summary?.cablesFailed !== undefined && simulation.summary.cablesFailed > 0) && (
            <div style={{ marginBottom: '24px', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#c62828', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                {simulation.summary.devicesFailed > 0 && <span>💀 Устройств: {simulation.summary.devicesFailed}</span>}
                {simulation.summary.cablesFailed > 0 && <span>🔌 Кабелей: {simulation.summary.cablesFailed}</span>}
              </div>
            </div>
          )}

          {/* Узкие места */}
          {simulation.summary?.bottlenecks && simulation.summary.bottlenecks.length > 0 && (
            <DetailSection>
              <DetailTitle>Узкие места сети</DetailTitle>
              {simulation.summary.bottlenecks.map((bottleneck, idx) => (
                <div key={idx} style={{ padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#e54848' }}>⚠️</span> {bottleneck}
                </div>
              ))}
            </DetailSection>
          )}

          {/* Маршрут */}
          <DetailSection>
            <DetailTitle>Маршрут передачи данных</DetailTitle>
            <PathContainer>
              <PathNode isStart>🚀 {simulation.startNodeName || 'Старт'}</PathNode>
              <PathArrow>→</PathArrow>
              <PathNode isEnd>🎯 {simulation.endNodeName || 'Финиш'}</PathNode>
            </PathContainer>
          </DetailSection>

          {/* Общая оценка */}
          <DetailSection>
            <DetailTitle>Итоговая оценка</DetailTitle>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              background: `${getGradeColor(simulation.grade)}15`,
              padding: '16px 20px',
              borderRadius: '16px'
            }}>
              <span style={{ fontSize: '32px', fontWeight: 'bold', color: getGradeColor(simulation.grade) }}>
                {simulation.grade}
              </span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: getGradeColor(simulation.grade) }}>
                {simulation.score} / 100
              </span>
            </div>
          </DetailSection>
        </>
      )}

      {activeTab === 'events' && <EventsPanel events={simulation.events} />}
      {activeTab === 'charts' && <TimelineChart timeline={simulation.timeline} />}
      {activeTab === 'economics' && <EconomicImpact economicImpact={simulation.economicImpact} />}
      {activeTab === 'recommendations' && <RecommendationsPanel recommendation={simulation.summary?.recommendation} />}
    </>
  );
};

export default SimulationDetails;
