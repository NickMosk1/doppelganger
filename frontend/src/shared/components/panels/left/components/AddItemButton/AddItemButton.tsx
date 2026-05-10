import { AddButtonContainer, AddButtonLabel } from './AddItemButton.styles';

interface AddItemButtonProps {
  onClick: () => void;
  label?: string;
  size?: "normal" | "small";
  fullWidth?: boolean;
}

const AddItemButton: React.FC<AddItemButtonProps> = ({
  onClick,
  label = 'Добавить',
  size = "normal",
  fullWidth = false,
}) => {
  return (
    <AddButtonContainer onClick={onClick} $size={size} $fullWidth={fullWidth}>
      <AddButtonLabel $size={size}>{label}</AddButtonLabel>
    </AddButtonContainer>
  );
};

export default AddItemButton;
