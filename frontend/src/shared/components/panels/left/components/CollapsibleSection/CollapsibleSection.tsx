import { useState } from 'react';
import {
  SectionContainer,
  SectionHeader,
  SectionTitle,
  SectionTitleNested,
  SectionIcon,
  Chevron,
} from './CollapsibleSection.styles';

interface CollapsibleSectionProps {
  title: string;
  icon: string;
  defaultExpanded?: boolean;
  nested?: boolean;
  children: React.ReactNode;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  defaultExpanded = true,
  nested = false,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <SectionContainer $nested={nested}>
      <SectionHeader onClick={() => setIsExpanded(!isExpanded)} $nested={nested}>
        <SectionIcon>{icon}</SectionIcon>
        {nested ? (
          <SectionTitleNested>{title}</SectionTitleNested>
        ) : (
          <SectionTitle>{title}</SectionTitle>
        )}
        <Chevron $expanded={isExpanded}>▼</Chevron>
      </SectionHeader>
      {isExpanded && children}
    </SectionContainer>
  );
};

export default CollapsibleSection;
