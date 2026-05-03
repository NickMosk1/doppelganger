import styled, { css } from 'styled-components';
import { colors } from '../../../shared/theme/colors';

interface StyledButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'text';
  size: 'small' | 'medium' | 'large';
  fullWidth: boolean;
  disabled?: boolean;
}

const sizeStyles = {
  small: css`
    padding: 6px;
    font-size: 12px;
  `,
  medium: css`
    padding: 10px 24px;
    font-size: 14px;
  `,
  large: css`
    padding: 14px 32px;
    font-size: 16px;
  `,
};

const variantStyles = {
  primary: css`
    background-color: ${colors.primary};
    color: ${colors.white};
    border: none;

    &:hover:not(:disabled) {
      background-color: ${colors.primaryHover};
    }

    &:active:not(:disabled) {
      background-color: ${colors.primaryActive};
    }
  `,
  secondary: css`
    background-color: ${colors.white};
    color: ${colors.primary};
    border: 1px solid ${colors.primary};

    &:hover:not(:disabled) {
      background-color: ${colors.whiteHover};
      border-color: ${colors.primaryHover};
      color: ${colors.primaryHover};
    }
  `,
  outline: css`
    background-color: transparent;
    color: ${colors.primary};
    border: 1px solid ${colors.border};

    &:hover:not(:disabled) {
      border-color: ${colors.primary};
      background-color: ${colors.errorLight};
    }
  `,
  text: css`
    background-color: transparent;
    color: ${colors.primary};
    border: none;

    &:hover:not(:disabled) {
      background-color: ${colors.errorLight};
    }
  `,
};

export const StyledButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  width: ${props => props.fullWidth ? '100%' : 'auto'};

  ${props => sizeStyles[props.size]}
  ${props => variantStyles[props.variant]}
`;

export const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  span {
    display: inline-flex;
    align-items: center;
  }
`;
