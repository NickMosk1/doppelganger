import styled from "styled-components";
import { NavLink } from "react-router-dom";
import { colors } from "../../theme/colors";

export const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${colors.background};
`;

export const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
`;

interface MainContentProps {
  $hasSidebar: boolean;
}

export const MainContent = styled.main<MainContentProps>`
  flex: 1;
  padding: 20px;
  margin-left: ${props => props.$hasSidebar ? "260px" : "0"};
  transition: margin-left 0.3s ease;

  @media (max-width: 768px) {
    padding: 16px;
    margin-left: ${props => props.$hasSidebar ? "0" : "0"};
  }
`;

export const Sidebar = styled.aside`
  width: 260px;
  background: ${colors.white};
  border-right: 1px solid ${colors.border};
  position: fixed;
  top: 64px;
  bottom: 0;
  left: 0;
  padding: 24px 0;
  overflow-y: auto;

  @media (max-width: 768px) {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 90;

    &.open {
      transform: translateX(0);
    }
  }
`;

export const SidebarItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  color: ${colors.textLight};
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.background};
    color: ${colors.primary};
  }

  &.active {
    background: ${colors.errorLight};
    color: ${colors.primary};
    border-right: 3px solid ${colors.primary};
  }
`;

export const SidebarIcon = styled.span`
  font-size: 20px;
  width: 24px;
`;

export const SidebarLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
`;
