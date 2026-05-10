import { CategoryWrapper, ItemsGrid } from './CategorySection.styles';

interface CategorySectionProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
}

export const CategorySection: React.FC<CategorySectionProps> = ({ 
  children,
}) => {
  return (
    <CategoryWrapper>
      <ItemsGrid>{children}</ItemsGrid>
    </CategoryWrapper>
  );
};

export default CategorySection;
