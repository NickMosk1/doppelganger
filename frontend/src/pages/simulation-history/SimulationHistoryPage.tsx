import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import {
  BackButton, Card, CardDetails, CardGrade, CardHeader,
  CardInfo, CardMeta, CardName, CardsList,
  Container, DetailLabel, DetailRow, DetailSection, DetailTitle,
  DetailValue, Header, Overlay, PathArrow, PathContainer,
  PathNode, StatCard, StatsGrid, TimelineContainer, TimelineItem, Title
} from "./SimulationHistoryPage.styles";
import SimulationService from "../../services/simulation.service";

interface SimulationResult {
  id: string;
  name: string;
  startNodeName: string;
  endNodeName: string;
  durationSeconds: number;
  grade: string;
  score: number;
  createdAt: string;
  summary?: {
    maxLatencyMs: number;
    avgLatencyMs: number;
    packetLossPercent: number;
    throughputMbps: number;
    devicesFailed: number;
    bottlenecks?: string[];
    recommendation?: string;
  };
  timeline?: Array<{
    timestamp: number;
    avgLatencyMs: number;
    packetLossPercent: number;
  }>;
  events?: Array<{
    type: string;
    message: string;
    severity: string;
  }>;
}

const simulationService = new SimulationService();

const SimulationHistoryPage: React.FC = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [history, setHistory] = useState<SimulationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedSim, setSelectedSim] = useState<SimulationResult | null>(null);
  const [expandedLoading, setExpandedLoading] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      if (!id) return;
      try {
        const data = await simulationService.getSimulationHistory(id);
        setHistory(data);
      } catch (error) {
        console.error("Failed to load history:", error);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [id]);

  const handleCardClick = async (simId: string) => {
    if (expandedId === simId) {
      setExpandedId(null);
      setSelectedSim(null);
      return;
    }
    
    setExpandedLoading(true);
    try {
      const fullResult = await simulationService.getSimulationResult(simId);
      setSelectedSim(fullResult);
      setExpandedId(simId);
    } catch (error) {
      console.error("Failed to load simulation details:", error);
    } finally {
      setExpandedLoading(false);
    }
  };

  const handleClose = () => {
    setExpandedId(null);
    setSelectedSim(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <Container style={{ textAlign: 'center', paddingTop: '100px' }}>Загрузка...</Container>;
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(`/editor/${id}`)}>Назад к схеме</BackButton>
        <Title>История симуляций</Title>
      </Header>

      {history.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '80px', 
          color: '#64748b',
          background: 'white',
          borderRadius: '24px',
          fontSize: '16px'
        }}>
          Нет сохранённых симуляций
        </div>
      ) : (
        <CardsList>
          {history.map((sim) => (
            <Card key={sim.id} $expanded={expandedId === sim.id}>
              <CardHeader onClick={() => handleCardClick(sim.id)}>
                <CardInfo>
                  <CardName>
                    {sim.name}
                  </CardName>
                  <CardMeta>
                    <span>🚀 {sim.startNodeName || '—'}</span>
                    <span>→</span>
                    <span>🎯 {sim.endNodeName || '—'}</span>
                    <span>⏱️ {sim.durationSeconds || 0}с</span>
                    <span>📅 {formatDate(sim.createdAt)}</span>
                  </CardMeta>
                </CardInfo>
                <CardGrade grade={sim.grade}>
                  {sim.grade} • {sim.score}%
                </CardGrade>
              </CardHeader>

              {expandedId === sim.id && (
                <>
                  <CardDetails>
                    {expandedLoading ? (
                      <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                        Загрузка деталей...
                      </div>
                    ) : selectedSim ? (
                      <>
                        <StatsGrid>
                          <StatCard>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#e54848' }}>
                              {selectedSim.summary?.maxLatencyMs || 0}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Макс. задержка (мс)</div>
                          </StatCard>
                          <StatCard>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>
                              {selectedSim.summary?.avgLatencyMs || 0}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Ср. задержка (мс)</div>
                          </StatCard>
                          <StatCard>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>
                              {selectedSim.summary?.throughputMbps || 0}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Пропускная способность</div>
                          </StatCard>
                          <StatCard>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: selectedSim.summary?.packetLossPercent === 0 ? '#10b981' : '#ef4444' }}>
                              {selectedSim.summary?.packetLossPercent || 0}%
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Потери пакетов</div>
                          </StatCard>
                        </StatsGrid>

                        <DetailSection>
                          <DetailTitle>🗺️ Маршрут передачи данных</DetailTitle>
                          <PathContainer>
                            <PathNode isStart>🚀 {selectedSim.startNodeName || 'Старт'}</PathNode>
                            <PathArrow>→</PathArrow>
                            <PathNode isEnd>🎯 {selectedSim.endNodeName || 'Финиш'}</PathNode>
                          </PathContainer>
                        </DetailSection>

                        {selectedSim.events && selectedSim.events.length > 0 && (
                          <DetailSection>
                            <DetailTitle>Критические события</DetailTitle>
                            {selectedSim.events.map((event, idx) => (
                              <DetailRow key={idx}>
                                <DetailLabel>{event.type}</DetailLabel>
                                <DetailValue style={{ color: '#ef4444' }}>{event.message}</DetailValue>
                              </DetailRow>
                            ))}
                          </DetailSection>
                        )}

                        {selectedSim.summary?.recommendation && (
                          <DetailSection>
                            <DetailTitle>💡 Рекомендации</DetailTitle>
                            <div style={{ 
                              background: '#e8f5e9', 
                              padding: '16px', 
                              borderRadius: '12px',
                              fontSize: '13px',
                              color: '#2e7d32',
                              lineHeight: '1.5'
                            }}>
                              {selectedSim.summary.recommendation}
                            </div>
                          </DetailSection>
                        )}

                        {selectedSim.timeline && selectedSim.timeline.length > 0 && (
                          <DetailSection>
                            <DetailTitle>📈 Динамика по времени</DetailTitle>
                            <TimelineContainer>
                              {selectedSim.timeline.map((point, idx) => (
                                <TimelineItem key={idx}>
                                  <strong>t={point.timestamp}с</strong> — задержка: {point.avgLatencyMs}мс,
                                  потери: {point.packetLossPercent}%
                                </TimelineItem>
                              ))}
                            </TimelineContainer>
                          </DetailSection>
                        )}
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '60px', color: '#ef4444' }}>
                        Ошибка загрузки деталей
                      </div>
                    )}
                  </CardDetails>
                </>
              )}
            </Card>
          ))}
        </CardsList>
      )}

      {expandedId && <Overlay onClick={handleClose} />}
    </Container>
  );
});

export default SimulationHistoryPage;
