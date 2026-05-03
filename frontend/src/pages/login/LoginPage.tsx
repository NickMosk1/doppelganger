import { useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { useStores } from "../../hooks/useStores";
import {
  LoginContainer,
  LoginCard,
  LoginTitle,
  LoginSubtitle,
  LoginForm,
  FormGroup,
  Divider,
  Logo,
} from "./LoginPage.styles";
import AuthService from "../../services/auth.service";
import { Button, Input } from "../../shared";

const authService = new AuthService();

const LoginPage: React.FC = observer(() => {
  const navigate = useNavigate();
  const { authStore } = useStores();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let response;
      if (isRegister) {
        response = await authService.register(email, password, fullName);
      } else {
        response = await authService.login(email, password);
      }

      // Сохраняем данные в store
      authStore.setAuthenticated(response.token, {
        id: response.userId,
        email: response.email,
        fullName: response.fullName,
        role: response.role,
      });

      navigate("/home");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError("");
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <span>🔄</span>
          <h1>Doppelganger</h1>
        </Logo>
        <LoginTitle>{isRegister ? "Регистрация" : "Добро пожаловать!"}</LoginTitle>
        <LoginSubtitle>
          {isRegister
            ? "Создайте аккаунт для работы с цифровыми двойниками"
            : "Войдите в систему управления цифровыми двойниками"}
        </LoginSubtitle>

        {error && <span>{error}</span>}

        <LoginForm onSubmit={handleSubmit}>
          {isRegister && (
            <FormGroup>
              <Input
                type="text"
                label="Полное имя"
                placeholder="Иван Иванов"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                fullWidth
              />
            </FormGroup>
          )}

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
            {isRegister ? "Зарегистрироваться" : "Войти"}
          </Button>
        </LoginForm>

        <Divider>{isRegister ? "уже есть аккаунт?" : "или"}</Divider>

        <Button variant="outline" fullWidth onClick={toggleMode}>
          {isRegister ? "Войти в существующий аккаунт" : "Создать новый аккаунт"}
        </Button>
      </LoginCard>
    </LoginContainer>
  );
});

export default LoginPage;
