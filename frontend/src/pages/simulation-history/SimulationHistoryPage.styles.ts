import styled from 'styled-components';

export const Container = styled.div`
  min-height: 100vh;
  background: #f5f7fa;
  padding: 32px;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
`;

export const BackButton = styled.button`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #475569;

  &:hover {
    background: #f8fafc;
    border-color: #e54848;
    color: #e54848;
  }
`;

export const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

export const CardsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
`;

export const Card = styled.div<{ $expanded: boolean }>`
  background: white;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  
  ${props => props.$expanded && `
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
    border-color: #e54848;
    position: relative;
    z-index: 10;
  `}
  
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #fafbfc;
  }
`;

export const CardInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const CardName = styled.div`
  font-weight: 600;
  font-size: 18px;
  color: #1e293b;
`;

export const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #64748b;
  
  span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
`;

export const CardGrade = styled.div<{ grade: string }>`
  padding: 6px 16px;
  border-radius: 40px;
  font-size: 16px;
  font-weight: 700;
  background: ${props => 
    props.grade === 'A' ? '#10b981' :
    props.grade === 'B' ? '#3b82f6' :
    props.grade === 'C' ? '#f59e0b' : '#ef4444'
  };
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 80px;
  text-align: center;
`;

export const CardDetails = styled.div`
  padding: 0 28px 32px 28px;
  border-top: 1px solid #e2e8f0;
  background: #fafbfc;
  animation: slideDown 0.3s ease;
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const DetailSection = styled.div`
  margin-bottom: 32px;
`;

export const DetailTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
`;

export const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 16px;
  text-align: center;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

export const PathContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: white;
  padding: 16px 24px;
  border-radius: 60px;
  margin-bottom: 8px;
  flex-wrap: wrap;
  border: 1px solid #e2e8f0;
`;

export const PathNode = styled.span<{ isStart?: boolean; isEnd?: boolean }>`
  padding: 8px 20px;
  background: ${props => props.isStart ? '#e8f5e9' : props.isEnd ? '#ffebee' : '#f1f5f9'};
  border-radius: 40px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.isStart ? '#2e7d32' : props.isEnd ? '#c62828' : '#475569'};
  border: 1px solid ${props => props.isStart ? '#a5d6a7' : props.isEnd ? '#ef9a9a' : '#e2e8f0'};
`;

export const PathArrow = styled.span`
  font-size: 20px;
  color: #94a3b8;
`;

export const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

export const DetailLabel = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
`;

export const DetailValue = styled.span`
  font-size: 13px;
  color: #1e293b;
  font-weight: 500;
`;

export const TimelineContainer = styled.div`
  max-height: 300px;
  overflow-y: auto;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
`;

export const TimelineItem = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 13px;
  color: #475569;
  
  strong {
    color: #e54848;
    font-weight: 600;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #fafbfc;
  }
`;

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 5;
  animation: fadeIn 0.2s ease;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;
