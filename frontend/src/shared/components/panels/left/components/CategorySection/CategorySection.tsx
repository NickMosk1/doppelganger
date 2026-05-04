import { ItemsGrid } from './CategorySection.styles';

interface CategorySectionProps {
  children: React.ReactNode;
}

const CategorySection: React.FC<CategorySectionProps> = ({ children }) => {
  return <ItemsGrid>{children}</ItemsGrid>;
};

export default CategorySection;
