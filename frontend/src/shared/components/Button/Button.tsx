import { StyledButton, ButtonWrapper } from './Button.styles';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  icon,
  disabled,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ButtonWrapper>
          <span>⏳</span> Загрузка...
        </ButtonWrapper>
      ) : (
        <ButtonWrapper>
          {icon && <span>{icon}</span>}
          {children}
        </ButtonWrapper>
      )}
    </StyledButton>
  );
};

export default Button;
