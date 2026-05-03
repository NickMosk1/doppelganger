import styled, { css } from 'styled-components';
import { colors } from '../../../shared/theme/colors';

interface InputWrapperProps {
  fullWidth: boolean;
}

export const InputWrapper = styled.div<InputWrapperProps>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
`;

interface LabelProps {
  isFocused: boolean;
  error: boolean;
  required?: boolean;
}

export const Label = styled.label<LabelProps>`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.error ? colors.error : (props.isFocused ? colors.primary : colors.textLight)};
  transition: color 0.2s ease;

  ${props => props.required && css`
    &::after {
      content: '*';
      color: ${colors.error};
      margin-left: 4px;
    }
  `}
`;

interface StyledInputProps {
  error: boolean;
}

export const StyledInput = styled.input<StyledInputProps>`
  padding: 12px 16px;
  border: 2px solid ${props => props.error ? colors.error : colors.border};
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  outline: none;

  &:focus {
    border-color: ${props => props.error ? colors.errorDark : colors.primary};
    box-shadow: 0 0 0 3px ${props => props.error ? colors.errorLight : `${colors.primary}20`};
  }

  &:hover:not(:focus) {
    border-color: ${props => props.error ? colors.error : colors.primaryLight};
  }

  &::placeholder {
    color: ${colors.textLighter};
  }
`;

export const ErrorMessage = styled.span`
  font-size: 12px;
  color: ${colors.error};
`;
