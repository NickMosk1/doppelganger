import { useState } from 'react';
import { StyledInput, InputWrapper, Label, ErrorMessage } from './Input.styles';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = false,
  required,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [hasValue, setHasValue] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0);
    props.onChange?.(e);
  };

  return (
    <InputWrapper fullWidth={fullWidth}>
      {label && (
        <Label isFocused={isFocused || hasValue} error={!!error} required={required}>
          {label}
        </Label>
      )}
      <StyledInput
        {...props}
        onChange={handleChange}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        error={!!error}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputWrapper>
  );
};

export default Input;
