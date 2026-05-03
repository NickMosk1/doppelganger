import styled from 'styled-components';
import { colors } from '../../shared/theme/colors';

export const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, ${colors.primary}20 0%, ${colors.background} 100%);
`;

export const LoginCard = styled.div`
  background: ${colors.white};
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 20px 40px ${colors.shadow};
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
  }
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 32px;
  
  span {
    font-size: 32px;
  }
  
  h1 {
    font-size: 24px;
    color: ${colors.primary};
    margin: 0;
  }
`;

export const LoginTitle = styled.h2`
  font-size: 28px;
  font-weight: 600;
  color: ${colors.text};
  margin-bottom: 8px;
  text-align: center;
`;

export const LoginSubtitle = styled.p`
  font-size: 14px;
  color: ${colors.textLight};
  text-align: center;
  margin-bottom: 32px;
`;

export const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  color: ${colors.textLighter};
  font-size: 12px;
  margin: 24px 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid ${colors.border};
  }
  
  &::before {
    margin-right: 16px;
  }
  
  &::after {
    margin-left: 16px;
  }
`;

export const DemoCredentials = styled.div`
  text-align: center;
  
  p {
    font-size: 12px;
    color: ${colors.textLighter};
    margin-top: 16px;
    line-height: 1.5;
  }
`;
