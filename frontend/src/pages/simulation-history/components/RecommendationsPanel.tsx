import { DetailSection, DetailTitle } from "../SimulationHistoryPage.styles";
import styled from 'styled-components';

const RecommendationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  margin-top: 8px;
`;

const RecommendationCard = styled.div<{ $severity: 'critical' | 'warning' | 'info' }>`
  background: ${props => 
    props.$severity === 'critical' ? '#fff5f5' :
    props.$severity === 'warning' ? '#fffaf0' : '#e8f5e9'
  };
  border-radius: 12px;
  padding: 14px 16px;
  border-left: 4px solid ${props => 
    props.$severity === 'critical' ? '#ef4444' :
    props.$severity === 'warning' ? '#f59e0b' : '#10b981'
  };
  transition: all 0.2s ease;
  cursor: default;
  display: flex;
  align-items: center;
  gap: 12px;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CardIcon = styled.span`
  font-size: 20px;
  flex-shrink: 0;
`;

const CardText = styled.span<{ $severity: 'critical' | 'warning' | 'info' }>`
  font-size: 13px;
  color: ${props => 
    props.$severity === 'critical' ? '#b91c1c' :
    props.$severity === 'warning' ? '#c2410c' : '#2e7d32'
  };
  line-height: 1.4;
  flex: 1;
`;

interface RecommendationsPanelProps {
  recommendation: string | undefined;
}

const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ recommendation }) => {
  if (!recommendation) return null;

  // Разбиваем рекомендации по строкам и фильтруем пустые
  const recommendationsList = recommendation
    .split('\n')
    .filter(line => line.trim().length > 0);

  // 🔧 ИСПРАВЛЕННАЯ ФУНКЦИЯ определения severity
  const getSeverity = (text: string): 'critical' | 'warning' | 'info' => {
    const lowerText = text.toLowerCase();
    
    // CRITICAL: отказ устройства или кабеля
    if (lowerText.includes('вышел из строя') || 
        lowerText.includes('вышло из строя') ||
        lowerText.includes('критическая') ||
        lowerText.includes('требуется замена') ||
        lowerText.includes('failed')) {
      return 'critical';
    }
    
    // WARNING: деградация, проблемы, рекомендации по улучшению
    if (lowerText.includes('деградирован') ||
        lowerText.includes('проверьте') ||
        lowerText.includes('установите') ||
        lowerText.includes('используйте') ||
        lowerText.includes('усильте') ||
        lowerText.includes('очистите') ||
        lowerText.includes('degraded')) {
      return 'warning';
    }
    
    // INFO: нормальная работа, рекомендации по поддержке
    return 'info';
  };

  // 🔧 УЛУЧШЕННАЯ ФУНКЦИЯ определения иконки
  const getIcon = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('устройство') || lowerText.includes('device')) {
      return lowerText.includes('вышел из строя') ? '💀' : '⚠️';
    }
    if (lowerText.includes('кабель') || lowerText.includes('cable') || lowerText.includes('🔌')) {
      return lowerText.includes('вышел из строя') ? '💀' : '⚠️';
    }
    if (lowerText.includes('температура') || lowerText.includes('охлаждение')) return '🌡️';
    if (lowerText.includes('экранирование') || lowerText.includes('emi') || lowerText.includes('помех')) return '🛡️';
    if (lowerText.includes('вибрация')) return '📳';
    if (lowerText.includes('запылённость') || lowerText.includes('пыль')) return '🏭';
    if (lowerText.includes('замена')) return '💰';
    return '💡';
  };

  const getCableFailureReason = (text: string): string => {
    if (text.includes('температура') || text.includes('перегрев')) {
      return 'Критический перегрев';
    }
    if (text.includes('EMI') || text.includes('помех')) {
      return 'Электромагнитные помехи';
    }
    if (text.includes('вибрация')) {
      return 'Критическая вибрация';
    }
    return 'Критическое воздействие факторов';
  };

  return (
    <DetailSection>
      <DetailTitle>💡 Рекомендации по улучшению</DetailTitle>
      <RecommendationsGrid>
        {recommendationsList.map((rec, index) => (
          <RecommendationCard key={index} $severity={getSeverity(rec)}>
            <CardIcon>{getIcon(rec)}</CardIcon>
            <CardText $severity={getSeverity(rec)}>{rec.includes('неизвестна') ? rec.replace('неизвестна', getCableFailureReason(rec)) : rec}</CardText>
          </RecommendationCard>
        ))}
      </RecommendationsGrid>
    </DetailSection>
  );
};

export default RecommendationsPanel;
