import { DetailSection, DetailTitle } from "../SimulationHistoryPage.styles";

interface RecommendationsPanelProps {
  recommendation: string | undefined;
}

const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ recommendation }) => {
  if (!recommendation) return null;

  return (
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
        {recommendation}
      </div>
    </DetailSection>
  );
};

export default RecommendationsPanel;
