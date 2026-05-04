import { AddButtonContainer, PlusIcon, AddButtonLabel } from './AddItemButton.styles';

interface AddItemButtonProps {
  onClick: () => void;
  label?: string;
}

const AddItemButton: React.FC<AddItemButtonProps> = ({ onClick, label = 'Добавить' }) => {
  return (
    <AddButtonContainer onClick={onClick}>
      <PlusIcon>+</PlusIcon>
      <AddButtonLabel>{label}</AddButtonLabel>
    </AddButtonContainer>
  );
};

export default AddItemButton;
