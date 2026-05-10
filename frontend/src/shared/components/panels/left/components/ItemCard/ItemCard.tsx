// src/shared/components/LeftPanel/components/ItemCard/ItemCard.tsx
import React, { useState, useRef } from 'react';
import { 
  CardContainer, 
  CardIcon, 
  CardName, 
  CardBadge, 
  CardStats,
  CustomMarker,
  CardTooltip,
  TooltipTitle,
  TooltipRow,
  TooltipLabel,
  TooltipValue,
} from './ItemCard.styles';

interface ItemCardProps {
  id: string;
  name: string;
  icon: string;
  description?: string;
  badge?: string;
  stats?: string;
  isCustom?: boolean;
  isSelected?: boolean;
  tooltipInfo?: {
    title?: string;
    rows: Array<{ label: string; value: string | number }>;
  };
  onClick: () => void;
}

const ItemCard: React.FC<ItemCardProps> = ({
  name,
  icon,
  badge,
  stats,
  isCustom,
  isSelected,
  tooltipInfo,
  onClick,
}) => {
  const [tooltipPosition, setTooltipPosition] = useState({ left: 0, top: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (cardRef.current && tooltipInfo) {
      const rect = cardRef.current.getBoundingClientRect();
      setTooltipPosition({
        left: rect.right + 10,
        top: rect.top - 20,
      });
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <>
      <CardContainer
        ref={cardRef}
        onClick={onClick}
        $isSelected={isSelected}
        $isCustom={isCustom}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {isCustom && <CustomMarker>★</CustomMarker>}
        <CardIcon>{icon}</CardIcon>
        <CardName>{name}</CardName>
        {badge && <CardBadge $isCustom={isCustom}>{badge}</CardBadge>}
        {stats && <CardStats>{stats}</CardStats>}
      </CardContainer>

      {showTooltip && tooltipInfo && (
        <CardTooltip $left={tooltipPosition.left} $top={tooltipPosition.top}>
          {tooltipInfo.title && <TooltipTitle>{tooltipInfo.title}</TooltipTitle>}
          {tooltipInfo.rows.map((row, idx) => (
            <TooltipRow key={idx}>
              <TooltipLabel>{row.label}:</TooltipLabel>
              <TooltipValue>{row.value}</TooltipValue>
            </TooltipRow>
          ))}
        </CardTooltip>
      )}
    </>
  );
};

export default ItemCard;
