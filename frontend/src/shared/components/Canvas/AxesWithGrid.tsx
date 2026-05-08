// src/shared/components/Canvas/AxesWithGrid.tsx
import React, { useEffect, useState } from 'react';
import { useViewport } from 'reactflow';
import styled from 'styled-components';

const AxesContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
  overflow: hidden;
`;

interface AxesWithGridProps {
  baseGridSize?: number;
  axisOpacity?: number;
  gridOpacity?: number;
  minStepPx?: number;
  maxStepPx?: number;
}

const AxesWithGrid: React.FC<AxesWithGridProps> = ({ 
  baseGridSize = 50,
  axisOpacity = 0.4,
  gridOpacity = 0.4,
  minStepPx = 10,
  maxStepPx = 200,
}) => {
  const { x, y, zoom } = useViewport();

  const [gridLines, setGridLines] = useState<React.ReactNode[]>([]);
  const [axes, setAxes] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const container = document.querySelector('.react-flow__pane');
    const containerRect = container?.getBoundingClientRect();
    
    if (!containerRect) return;

    const width = containerRect.width;
    const height = containerRect.height;
    
    // Рассчитываем шаг сетки
    let worldStep = baseGridSize;
    const pixelStep = worldStep * zoom;
    
    if (pixelStep < minStepPx) {
      worldStep = worldStep * (minStepPx / pixelStep);
    } else if (pixelStep > maxStepPx) {
      worldStep = worldStep * (maxStepPx / pixelStep);
    }
    
    const step = worldStep;
    
    // Мировые координаты углов экрана
    const topLeftX = -x / zoom;
    const topLeftY = -y / zoom;
    const bottomRightX = (width - x) / zoom;
    const bottomRightY = (height - y) / zoom;
    
    const startX = Math.floor(topLeftX / step) * step;
    const startY = Math.floor(topLeftY / step) * step;
    
    const newGridLines: React.ReactNode[] = [];
    const newAxes: React.ReactNode[] = [];
    
    // Форматирование координат
    const formatCoordinate = (value: number): string => {
      if (Math.abs(value) < 0.1) return '0';
      if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(0)}k`;
      return value.toFixed(0);
    };
    
    // Для X: показываем обычное значение (положительные справа, отрицательные слева)
    const formatX = (value: number): string => formatCoordinate(value);
    
    // Для Y: переворачиваем знак, чтобы положительные были сверху
    const formatY = (value: number): string => formatCoordinate(-value);
    
    // Кэш для позиций подписей
    let lastXLabelPos = -1000;
    let lastYLabelPos = -1000;
    const labelSpacing = 50;
    
    // === ВЕРТИКАЛЬНЫЕ ЛИНИИ (X координата) ===
    for (let px = startX; px <= bottomRightX; px += step) {
      const screenX = px * zoom + x;
      const isAxis = Math.abs(px) < 0.1;
      
      // Линия сетки
      newGridLines.push(
        <line
          key={`grid-v-${px}`}
          x1={screenX}
          y1={0}
          x2={screenX}
          y2={height}
          stroke={isAxis ? "#e54848" : "#94a3b8"}
          strokeWidth={isAxis ? 2 : 0.8}
          opacity={isAxis ? axisOpacity : gridOpacity}
        />
      );
      
      // Подпись для X — СВЕРХУ (положительные справа, отрицательные слева)
      const labelX = screenX;
      const labelY = 18; // сверху
      
      if (!isAxis && Math.abs(px) >= step && labelX > 30 && labelX < width - 30) {
        if (Math.abs(labelX - lastXLabelPos) >= labelSpacing) {
          newGridLines.push(
            <text
              key={`label-x-${px}`}
              x={labelX}
              y={labelY}
              fill="#475569"
              fontSize={11}
              fontFamily="monospace"
              textAnchor="middle"
              opacity={0.7}
            >
              {formatX(px)}
            </text>
          );
          lastXLabelPos = labelX;
        }
      }
    }
    
    // === ГОРИЗОНТАЛЬНЫЕ ЛИНИИ (Y координата) ===
    for (let py = startY; py <= bottomRightY; py += step) {
      const screenY = py * zoom + y;
      const isAxis = Math.abs(py) < 0.1;
      
      // Линия сетки
      newGridLines.push(
        <line
          key={`grid-h-${py}`}
          x1={0}
          y1={screenY}
          x2={width}
          y2={screenY}
          stroke={isAxis ? "#e54848" : "#94a3b8"}
          strokeWidth={isAxis ? 2 : 0.8}
          opacity={isAxis ? axisOpacity : gridOpacity}
        />
      );
      
      // Подпись для Y — СПРАВА (положительные сверху, отрицательные снизу)
      const labelX = width - 12; // справа
      const labelY = screenY + 4;
      
      if (!isAxis && Math.abs(py) >= step && labelY > 25 && labelY < height - 15) {
        if (Math.abs(labelY - lastYLabelPos) >= labelSpacing) {
          newGridLines.push(
            <text
              key={`label-y-${py}`}
              x={labelX}
              y={labelY}
              fill="#475569"
              fontSize={11}
              fontFamily="monospace"
              textAnchor="end"
              opacity={0.7}
            >
              {formatY(py)}
            </text>
          );
          lastYLabelPos = labelY;
        }
      }
    }
    
    // === ОСИ И МЕТКИ ===
    const originScreenX = 0 * zoom + x;
    const originScreenY = 0 * zoom + y;

    // Метка начала координат (0,0)
    if (originScreenX > 20 && originScreenX < width - 20 && 
        originScreenY > 20 && originScreenY < height - 20) {
      newAxes.push(
        <circle
          key="origin"
          cx={originScreenX}
          cy={originScreenY}
          r={4}
          fill="#e54848"
          opacity={axisOpacity}
        />
      );
      newAxes.push(
        <text
          key="origin-label"
          x={originScreenX + 8}
          y={originScreenY - 5}
          fill="#e54848"
          fontSize={10}
          fontFamily="monospace"
          fontWeight="bold"
          opacity={axisOpacity}
        >
          (0,0)
        </text>
      );
    }
    
    setGridLines(newGridLines);
    setAxes(newAxes);
  }, [zoom, x, y, baseGridSize, axisOpacity, gridOpacity, minStepPx, maxStepPx]);
  
  return (
    <AxesContainer>
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
        {gridLines}
        {axes}
      </svg>
    </AxesContainer>
  );
};

export default AxesWithGrid;
