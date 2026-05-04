import { useState } from 'react';
import { SectionContainer, SectionHeader, SectionTitle, SectionIcon, Chevron } from './CollapsibleSection.styles';

interface CollapsibleSectionProps {
  title: string;
  icon: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  defaultExpanded = true,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <SectionContainer>
      <SectionHeader onClick={() => setIsExpanded(!isExpanded)}>
        <SectionIcon>{icon}</SectionIcon>
        <SectionTitle>{title}</SectionTitle>
        <Chevron $expanded={isExpanded}>▼</Chevron>
      </SectionHeader>
      {isExpanded && children}
    </SectionContainer>
  );
};

export default CollapsibleSection;
