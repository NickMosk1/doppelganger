import styled from "styled-components";
import { Link } from "react-router-dom";
import { colors } from "../../theme/colors";

export const HeaderContainer = styled.header`
  background: ${colors.white};
  border-bottom: 1px solid ${colors.border};
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px ${colors.shadow};
`;

export const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 20px;
  max-width: 1800px;
  margin: 0 auto;
  gap: 32px;
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }

  span {
    font-size: 28px;
  }

  h1 {
    font-size: 20px;
    color: ${colors.primary};
    margin: 0;
    font-weight: 600;
  }
`;

export const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
`;

export const NavLink = styled(Link)`
  color: ${colors.textLight};
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s ease;
  padding: 8px 0;

  &:hover {
    color: ${colors.primary};
  }

  &.active {
    color: ${colors.primary};
    border-bottom: 2px solid ${colors.primary};
  }
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background: ${colors.background};
  padding: 8px 16px;
  border-radius: 40px;
`;

export const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${colors.primary};
  color: ${colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
`;

export const UserName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${colors.text};
`;

interface UserRoleProps {
  role?: string;
}

export const UserRole = styled.div<UserRoleProps>`
  font-size: 11px;
  color: ${props => props.role === "ADMIN" ? colors.primary : colors.textLight};
`;

export const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;
