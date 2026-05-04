import { AddButtonContainer, PlusIcon, AddButtonLabel } from './AddItemButton.styles';

interface AddItemButtonProps {
  onClick: () => void;
  label?: string;
  size?: "normal" | "small";
}

const AddItemButton: React.FC<AddItemButtonProps> = ({ 
  onClick, 
  label = 'Добавить',
  size = "normal" 
}) => {
  return (
    <AddButtonContainer onClick={onClick} $size={size}>
      <PlusIcon $size={size}>+</PlusIcon>
      <AddButtonLabel $size={size}>{label}</AddButtonLabel>
    </AddButtonContainer>
  );
};

export default AddItemButton;
