import { useState } from 'react';
import { Button } from '../../shared/components/Button/Button';
import { Input } from '../../shared/components/Input/Input';
import {
  LoginContainer,
  LoginCard,
  LoginTitle,
  LoginSubtitle,
  LoginForm,
  FormGroup,
  Divider,
  DemoCredentials,
  Logo,
} from './LoginPage.styles';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: API call to backend
    console.log('Login:', { email, password });
    
    setTimeout(() => {
      setLoading(false);
      // Redirect to home
      window.location.href = '/home';
    }, 1000);
  };

  const handleDemoLogin = () => {
    setEmail('demo@doppelganger.com');
    setPassword('demo123');
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <span>🔄</span>
          <h1>Doppelganger</h1>
        </Logo>
        <LoginTitle>Добро пожаловать!</LoginTitle>
        <LoginSubtitle>
          Войдите в систему управления цифровыми двойниками
        </LoginSubtitle>

        <LoginForm onSubmit={handleSubmit}>
          <FormGroup>
            <Input
              type="email"
              label="Email"
              placeholder="example@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />
          </FormGroup>

          <FormGroup>
            <Input
              type="password"
              label="Пароль"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />
          </FormGroup>

          <Button type="submit" fullWidth loading={loading}>
            Войти
          </Button>
        </LoginForm>

        <Divider>или</Divider>

        <DemoCredentials>
          <Button variant="outline" fullWidth onClick={handleDemoLogin}>
            🎮 Демо-доступ
          </Button>
          <p>Email: demo@doppelganger.com<br />Пароль: demo123</p>
        </DemoCredentials>
      </LoginCard>
    </LoginContainer>
  );
};
