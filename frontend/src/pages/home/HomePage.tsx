import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { useStores } from "../../hooks/useStores";
import { SchemaService } from "../../services/schema.service";
import {
  HomeContainer,
  WelcomeSection,
  WelcomeTitle,
  WelcomeDescription,
  StatsGrid,
  StatCard,
  StatValue,
  StatLabel,
  SchemasSection,
  SectionHeader,
  SchemasGrid,
  SchemaCard,
  SchemaCardHeader,
  SchemaCardTitle,
  SchemaCardDate,
  SchemaCardActions,
  EmptyState,
  LoadingState,
} from "./HomePage.styles";
import { Button } from "../../shared";

const schemaService = new SchemaService();

const HomePage: React.FC = observer(() => {
  const navigate = useNavigate();
  const { userStore, schemaStore } = useStores();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchemas = async () => {
      try {
        const schemas = await schemaService.getAllSchemas();
        schemaStore.setSchemas(schemas);
      } catch (error) {
        console.error("Failed to fetch schemas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemas();
  }, []);

  const handleCreateSchema = async () => {
    try {
      const newSchema = await schemaService.createSchema("Новая схема", "");
      schemaStore.addSchema(newSchema);
      navigate(`/editor/${newSchema.id}`);
    } catch (error) {
      console.error("Failed to create schema:", error);
    }
  };

  const handleDeleteSchema = async (id: string) => {
    if (window.confirm("Удалить схему? Это действие нельзя отменить.")) {
      try {
        await schemaService.deleteSchema(id);
        schemaStore.removeSchema(id);
      } catch (error) {
        console.error("Failed to delete schema:", error);
      }
    }
  };

  if (loading) {
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
          <StatValue>{schemaStore.schemas.length}</StatValue>
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

      <SchemasSection>
        <SectionHeader>
          <h2>Мои схемы</h2>
          <Button onClick={handleCreateSchema}>+ Новая схема</Button>
        </SectionHeader>

        {schemaStore.schemas.length === 0 ? (
          <EmptyState>
            <p>У вас пока нет схем</p>
            <Button onClick={handleCreateSchema}>Создать первую схему</Button>
          </EmptyState>
        ) : (
          <SchemasGrid>
            {schemaStore.schemas.map((schema) => (
              <SchemaCard key={schema.id}>
                <SchemaCardHeader>
                  <SchemaCardTitle>{schema.name}</SchemaCardTitle>
                  <SchemaCardDate>
                    {new Date(schema.createdAt).toLocaleDateString("ru-RU")}
                  </SchemaCardDate>
                </SchemaCardHeader>
                <p>{schema.description || "Нет описания"}</p>
                {schema.isPublic && <span>🌍 Публичная</span>}
                <SchemaCardActions>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => navigate(`/editor/${schema.id}`)}
                  >
                    Редактировать
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => handleDeleteSchema(schema.id)}
                  >
                    Удалить
                  </Button>
                </SchemaCardActions>
              </SchemaCard>
            ))}
          </SchemasGrid>
        )}
      </SchemasSection>
    </HomeContainer>
  );
});

export default HomePage;
