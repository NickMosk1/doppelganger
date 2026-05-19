import React from "react";
import { Card, CardHeader, CardInfo, CardName, CardMeta, CardGrade, CardDetails } from "../SimulationHistoryPage.styles";
import { SimulationResult } from "../types";
import SimulationDetails from "./SimulationDetails";

interface SimulationCardProps {
  simulation: SimulationResult;
  isExpanded: boolean;
  isLoading: boolean;
  onExpand: (id: string) => void;
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const SimulationCard: React.FC<SimulationCardProps> = ({ 
  simulation, 
  isExpanded, 
  isLoading, 
  onExpand 
}) => {
  return (
    <Card $expanded={isExpanded}>
      <CardHeader onClick={() => onExpand(simulation.id)}>
        <CardInfo>
          <CardName>{simulation.name}</CardName>
          <CardMeta>
            <span>🚀 {simulation.startNodeName || '—'}</span>
            <span>→</span>
            <span>🎯 {simulation.endNodeName || '—'}</span>
            <span>⏱️ {simulation.durationSeconds || 0}с</span>
            <span>📅 {formatDate(simulation.createdAt)}</span>
          </CardMeta>
        </CardInfo>
        <CardGrade grade={simulation.grade}>
          {simulation.grade} • {simulation.score}%
        </CardGrade>
      </CardHeader>

      {isExpanded && (
        <CardDetails>
          <SimulationDetails simulation={simulation} isLoading={isLoading} />
        </CardDetails>
      )}
    </Card>
  );
};

export default SimulationCard;
