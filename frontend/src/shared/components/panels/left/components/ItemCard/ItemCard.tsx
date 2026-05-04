import { CardContainer, CardIcon, CardName, CardBadge, CardStats, CardTooltip } from './ItemCard.styles';

interface ItemCardProps {
  id: string;
  name: string;
  icon: string;
  description?: string;
  badge?: string;
  stats?: string;
  isCustom?: boolean;
  onClick: () => void;
}

const ItemCard: React.FC<ItemCardProps> = ({
  name,
  icon,
  description,
  badge,
  stats,
  isCustom,
  onClick,
}) => {
  return (
    <CardContainer onClick={onClick} data-tooltip={description}>
      <CardIcon>{icon}</CardIcon>
      <CardName>{name}</CardName>
      {badge && <CardBadge $isCustom={isCustom}>{badge}</CardBadge>}
      {stats && <CardStats>{stats}</CardStats>}
      {description && <CardTooltip>{description}</CardTooltip>}
    </CardContainer>
  );
};

export default ItemCard;
