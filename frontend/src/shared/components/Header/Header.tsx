import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { useStores } from "../../../hooks/useStores";
import {
  HeaderContainer,
  HeaderContent,
  Logo,
  UserInfo,
  UserAvatar,
  UserName,
  UserRole,
  NavLinks,
  NavLink,
} from "./Header.styles";
import { Button } from "../Button";
import { UserRoles } from "../../types";

interface HeaderProps {
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = observer(({ onLogout }) => {
  const navigate = useNavigate();
  const { userStore, authStore } = useStores();

  const handleLogout = () => {
    authStore.logout();
    onLogout?.();
    navigate("/login");
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case UserRoles.ADMIN:
        return "Администратор";
      case UserRoles.ENGINEER:
        return "Инженер";
      case UserRoles.VIEWER:
        return "Наблюдатель";
      default:
        return role;
    }
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo onClick={() => navigate("/home")}>
          <span>🔄</span>
          <h1>Doppelganger</h1>
        </Logo>

        <NavLinks>
          <NavLink to="/home">Главная</NavLink>
          <NavLink to="/schemas">Схемы</NavLink>
          <NavLink to="/marketplace">Маркетплейс</NavLink>
        </NavLinks>

        <UserInfo>
          <UserAvatar>
            {userStore.userFullName.charAt(0).toUpperCase()}
          </UserAvatar>
          <div>
            <UserName>{userStore.userFullName}</UserName>
            <UserRole role={userStore.user?.role}>
              {getRoleLabel(userStore.user?.role || "VIEWER")}
            </UserRole>
          </div>
          <Button variant="text" size="small" onClick={handleLogout}>
            Выйти
          </Button>
        </UserInfo>
      </HeaderContent>
    </HeaderContainer>
  );
});

export default Header;
