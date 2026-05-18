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

interface DeviceMetric {
  latencyMs: number;
  packetLossPercent: number;
  throughputMbps: number;
  temperature: number;
  status: string;
}

interface TimelinePoint {
  timestamp: number;
  avgLatencyMs: number;
  packetLossPercent: number;
  devices?: Record<string, DeviceMetric>;
}

interface CriticalEvent {
  timestamp: number;
  type: string;
  deviceId: string;
  deviceName: string;
  message: string;
  severity: string;
  recommendation?: string;
}

interface Summary {
  maxLatencyMs: number;
  avgLatencyMs: number;
  minLatencyMs?: number;
  packetLossPercent: number;
  throughputMbps: number;
  devicesFailed: number;
  cablesFailed: number;
  bottlenecks?: string[];
  recommendation?: string;
}

interface SimulationResult {
  id: string;
  name: string;
  startNodeName: string;
  endNodeName: string;
  durationSeconds: number;
  grade: string;
  score: number;
  createdAt: string;
  summary?: Summary;
  timeline?: TimelinePoint[];
  events?: CriticalEvent[];
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return '#10b981';
      case 'B': return '#3b82f6';
      case 'C': return '#f59e0b';
      default: return '#ef4444';
    }
  };

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
      default: return '⚠️';
    }
  };

  if (loading) {
    return <Container style={{ textAlign: 'center', paddingTop: '100px' }}>Загрузка...</Container>;
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(`/editor/${id}`)}>← Назад к схеме</BackButton>
        <Title>📊 История симуляций</Title>
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
          📭 Нет сохранённых симуляций
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
                        ⏳ Загрузка деталей...
                      </div>
                    ) : selectedSim ? (
                      <>
                        {/* Статистика */}
                        <StatsGrid>
                          <StatCard>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#e54848' }}>
                              {selectedSim.summary?.maxLatencyMs?.toFixed(1) || 0}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>📈 Макс. задержка (мс)</div>
                          </StatCard>
                          <StatCard>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>
                              {selectedSim.summary?.avgLatencyMs?.toFixed(1) || 0}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>📊 Ср. задержка (мс)</div>
                          </StatCard>
                          <StatCard>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>
                              {Math.round(selectedSim.summary?.throughputMbps || 0)}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>⚡ Пропускная способность (Mbps)</div>
                          </StatCard>
                          <StatCard>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: (selectedSim.summary?.packetLossPercent || 0) > 20 ? '#ef4444' : '#10b981' }}>
                              {selectedSim.summary?.packetLossPercent?.toFixed(1) || 0}%
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>📉 Потери пакетов</div>
                          </StatCard>
                        </StatsGrid>

                        {/* Отказ оборудования */}
                        {(selectedSim.summary?.devicesFailed !== undefined && selectedSim.summary.devicesFailed > 0) ||
                         (selectedSim.summary?.cablesFailed !== undefined && selectedSim.summary.cablesFailed > 0) ? (
                          <StatCard style={{ marginBottom: '24px', background: '#fff5f5', borderColor: '#fed7d7' }}>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#c62828', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                              {selectedSim.summary.devicesFailed > 0 && <span>💀 Устройств: {selectedSim.summary.devicesFailed}</span>}
                              {selectedSim.summary.cablesFailed > 0 && <span>🔌 Кабелей: {selectedSim.summary.cablesFailed}</span>}
                            </div>
                          </StatCard>
                        ) : null}

                        {/* Узкие места */}
                        {selectedSim.summary?.bottlenecks && selectedSim.summary.bottlenecks.length > 0 && (
                          <DetailSection>
                            <DetailTitle>🚦 Узкие места сети</DetailTitle>
                            {selectedSim.summary.bottlenecks.map((bottleneck, idx) => (
                              <DetailRow key={idx}>
                                <DetailLabel>⚠️</DetailLabel>
                                <DetailValue style={{ color: '#e54848' }}>{bottleneck}</DetailValue>
                              </DetailRow>
                            ))}
                          </DetailSection>
                        )}

                        {/* Маршрут */}
                        <DetailSection>
                          <DetailTitle>🗺️ Маршрут передачи данных</DetailTitle>
                          <PathContainer>
                            <PathNode isStart>🚀 {selectedSim.startNodeName || 'Старт'}</PathNode>
                            <PathArrow>→</PathArrow>
                            <PathNode isEnd>🎯 {selectedSim.endNodeName || 'Финиш'}</PathNode>
                          </PathContainer>
                        </DetailSection>

                        {/* Критические события */}
                        {selectedSim.events && selectedSim.events.length > 0 && (
                          <DetailSection>
                            <DetailTitle>⚠️ Критические события</DetailTitle>
                            {selectedSim.events.map((event, idx) => (
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
                                  {event.message}
                                </DetailValue>
                              </DetailRow>
                            ))}
                          </DetailSection>
                        )}

                        {/* Рекомендации */}
                        {selectedSim.summary?.recommendation && (
                          <DetailSection>
                            <DetailTitle>💡 Рекомендации по улучшению</DetailTitle>
                            <div style={{ 
                              background: '#e8f5e9', 
                              padding: '16px', 
                              borderRadius: '12px',
                              fontSize: '13px',
                              color: '#2e7d32',
                              lineHeight: '1.5',
                              whiteSpace: 'pre-wrap'
                            }}>
                              {selectedSim.summary.recommendation}
                            </div>
                          </DetailSection>
                        )}

                        {/* Динамика по времени */}
                        {selectedSim.timeline && selectedSim.timeline.length > 0 && (
                          <DetailSection>
                            <DetailTitle>📈 Динамика по времени</DetailTitle>
                            <TimelineContainer>
                              {selectedSim.timeline.map((point, idx) => (
                                <TimelineItem key={idx}>
                                  <strong>t = {point.timestamp} с</strong> — 
                                  задержка: {point.avgLatencyMs.toFixed(1)} мс, 
                                  потери: {point.packetLossPercent.toFixed(1)}%
                                </TimelineItem>
                              ))}
                            </TimelineContainer>
                          </DetailSection>
                        )}

                        {/* Общая оценка */}
                        <DetailSection>
                          <DetailTitle>🏆 Итоговая оценка</DetailTitle>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            background: `${getGradeColor(selectedSim.grade)}15`,
                            padding: '16px 20px',
                            borderRadius: '16px'
                          }}>
                            <span style={{ fontSize: '32px', fontWeight: 'bold', color: getGradeColor(selectedSim.grade) }}>
                              {selectedSim.grade}
                            </span>
                            <span style={{ fontSize: '24px', fontWeight: 'bold', color: getGradeColor(selectedSim.grade) }}>
                              {selectedSim.score} / 100
                            </span>
                          </div>
                        </DetailSection>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '60px', color: '#ef4444' }}>
                        ❌ Ошибка загрузки деталей
                      </div>
                    )}
                  </CardDetails>
                </>
              )}
            </Card>
          ))}
        </CardsList>
      )}

      {expandedId && <Overlay onClick={() => { setExpandedId(null); setSelectedSim(null); }} />}
    </Container>
  );
});

export default SimulationHistoryPage;
