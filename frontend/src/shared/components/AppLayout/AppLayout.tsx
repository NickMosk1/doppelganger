import { ReactNode } from "react";
import { observer } from "mobx-react-lite";
import { useLocation } from "react-router-dom";
import {
  LayoutContainer,
  MainContent,
  ContentWrapper,
  Sidebar,
  SidebarItem,
  SidebarIcon,
  SidebarLabel,
} from "./AppLayout.styles";
import { Header } from "../Header";

interface AppLayoutProps {
  children: ReactNode;
  onLogout?: () => void;
  hideHeader?: boolean;
  showSidebar?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = observer(({
  children,
  onLogout,
  hideHeader = false,
  showSidebar = false,
}) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  // На странице логина не показываем layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <LayoutContainer>
      {!hideHeader && <Header onLogout={onLogout} />}

      <ContentWrapper>
        {showSidebar && (
          <Sidebar>
            <SidebarItem to="/home">
              <SidebarIcon>🏠</SidebarIcon>
              <SidebarLabel>Главная</SidebarLabel>
            </SidebarItem>
            <SidebarItem to="/schemas">
              <SidebarIcon>📊</SidebarIcon>
              <SidebarLabel>Схемы</SidebarLabel>
            </SidebarItem>
            <SidebarItem to="/devices">
              <SidebarIcon>🖥️</SidebarIcon>
              <SidebarLabel>Устройства</SidebarLabel>
            </SidebarItem>
            <SidebarItem to="/simulations">
              <SidebarIcon>⚡</SidebarIcon>
              <SidebarLabel>Симуляции</SidebarLabel>
            </SidebarItem>
            <SidebarItem to="/marketplace">
              <SidebarIcon>🏪</SidebarIcon>
              <SidebarLabel>Маркетплейс</SidebarLabel>
            </SidebarItem>
          </Sidebar>
        )}

        <MainContent $hasSidebar={showSidebar}>
          {children}
        </MainContent>
      </ContentWrapper>
    </LayoutContainer>
  );
});

export default AppLayout;
