import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  HomeContainer,
  WelcomeSection,
  WelcomeTitle,
  WelcomeDescription,
  StatsGrid,
  StatCard,
  StatValue,
  StatLabel,
  LoadingState,
} from "./HomePage.styles";
import SchemaService from "../../services/schema.service";
import { useStores } from "../../hooks";

const schemaService = new SchemaService();

const HomePage: React.FC = observer(() => {
  const { userStore, schemaStore } = useStores();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchemas = async () => {
      try {
        schemaStore.setLoading(true);
        const schemas = await schemaService.getAllSchemas();
        schemaStore.setSchemas(schemas);
      } catch (error) {
        console.error("Failed to fetch schemas:", error);
      } finally {
        schemaStore.setLoading(false);
        setLoading(false);
      }
    };

    fetchSchemas();
  }, []);

  if (loading || schemaStore.isLoading) {
    return <LoadingState>Загрузка ваших схем...</LoadingState>;
  }

  return (
    <HomeContainer>
      <WelcomeSection>
        <WelcomeTitle>Добро пожаловать, {userStore.userFullName}!</WelcomeTitle>
        <WelcomeDescription>
          Создавайте и управляйте цифровыми двойниками ваших промышленных сетей.
          Моделируйте влияние температуры, ЭМИ и вибрации на производительность.
        </WelcomeDescription>
      </WelcomeSection>

      <StatsGrid>
        <StatCard>
          <StatValue>{schemaStore.totalSchemas}</StatValue>
          <StatLabel>Всего схем</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{schemaStore.publicSchemasCount}</StatValue>
          <StatLabel>Публичных схем</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{userStore.user?.role === "ADMIN" ? "👑" : "🔧"}</StatValue>
          <StatLabel>{userStore.user?.role === "ADMIN" ? "Администратор" : "Инженер"}</StatLabel>
        </StatCard>
      </StatsGrid>
    </HomeContainer>
  );
});

export default HomePage;
