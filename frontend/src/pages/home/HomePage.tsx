import { useState, useEffect } from 'react';
import { Button } from '../../shared/components/Button/Button';
import {
  HomeContainer,
  Header,
  HeaderContent,
  Logo,
  UserInfo,
  MainContent,
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
  CreateButtonWrapper,
} from './HomePage.styles';

interface Schema {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  nodesCount?: number;
}

export const HomePage: React.FC = () => {
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSchemas = async () => {
    try {
      // TODO: API call
      // const response = await api.get('/schemas');
      // setSchemas(response.data);
      
      // Mock data
      setSchemas([
        {
          id: '1',
          name: 'Цех №3',
          description: 'Основная производственная линия',
          createdAt: '2024-01-15T10:30:00',
        },
        {
          id: '2',
          name: 'Горячий цех',
          description: 'Высокотемпературный участок',
          createdAt: '2024-02-20T14:45:00',
        },
      ]);
    } catch (error) {
      console.error('Error fetching schemas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchema = () => {
    // TODO: Navigate to schema editor
    window.location.href = '/editor/new';
  };

  const handleEditSchema = (id: string) => {
    window.location.href = `/editor/${id}`;
  };

  const handleDeleteSchema = async (id: string) => {
    if (confirm('Удалить схему?')) {
      // TODO: API call
      setSchemas(schemas.filter(s => s.id !== id));
    }
  };

  useEffect(() => {
    fetchSchemas();
  }, []);

  return (
    <HomeContainer>
      <Header>
        <HeaderContent>
          <Logo>
            <span>🔄</span>
            <h1>Doppelganger</h1>
          </Logo>
          <UserInfo>
            <span>👤 Администратор</span>
            <Button variant="text" size="small">Выйти</Button>
          </UserInfo>
        </HeaderContent>
      </Header>

      <MainContent>
        <WelcomeSection>
          <WelcomeTitle>Добро пожаловать!</WelcomeTitle>
          <WelcomeDescription>
            Создавайте и управляйте цифровыми двойниками ваших промышленных сетей.
            Моделируйте влияние температуры, ЭМИ и вибрации на производительность.
          </WelcomeDescription>
        </WelcomeSection>

        <StatsGrid>
          <StatCard>
            <StatValue>{schemas.length}</StatValue>
            <StatLabel>Всего схем</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>24</StatValue>
            <StatLabel>Устройств</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>3</StatValue>
            <StatLabel>Активных симуляций</StatLabel>
          </StatCard>
        </StatsGrid>

        <SchemasSection>
          <SectionHeader>
            <h2>Мои схемы</h2>
            <CreateButtonWrapper>
              <Button onClick={handleCreateSchema}>
                + Новая схема
              </Button>
            </CreateButtonWrapper>
          </SectionHeader>

          {loading ? (
            <div>Загрузка...</div>
          ) : schemas.length === 0 ? (
            <EmptyState>
              <p>У вас пока нет схем</p>
              <Button onClick={handleCreateSchema}>Создать первую схему</Button>
            </EmptyState>
          ) : (
            <SchemasGrid>
              {schemas.map((schema) => (
                <SchemaCard key={schema.id}>
                  <SchemaCardHeader>
                    <SchemaCardTitle>{schema.name}</SchemaCardTitle>
                    <SchemaCardDate>
                      {new Date(schema.createdAt).toLocaleDateString('ru-RU')}
                    </SchemaCardDate>
                  </SchemaCardHeader>
                  <p>{schema.description}</p>
                  <SchemaCardActions>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleEditSchema(schema.id)}
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
      </MainContent>
    </HomeContainer>
  );
};