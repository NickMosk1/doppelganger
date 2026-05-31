import { useParams, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import {
  Container, Header, BackButton, Title, CardsList, Overlay
} from "./SimulationHistoryPage.styles";
import SimulationCard from "./components/SimulationCard";
import { useSimulationHistory } from "./hooks/useSimulationHistory";

const SimulationHistoryPage: React.FC = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    history,
    loading,
    expandedId,
    selectedSim,
    expandedLoading,
    loadSimulationDetails,
    closeDetails,
  } = useSimulationHistory(id);

  const handleCardClick = (simId: string) => {
    if (expandedId === simId) {
      closeDetails();
    } else {
      loadSimulationDetails(simId);
    }
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', paddingTop: '100px' }}>Загрузка...</div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(`/editor/${id}`)}>← Назад к схеме</BackButton>
        <Title>История симуляций</Title>
      </Header>

      {history.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '80px', 
          color: '#64748b',
          background: 'white',
          borderRadius: '24px',
          fontSize: '16px'
        }}>
          📭 Нет сохранённых симуляций
        </div>
      ) : (
        <CardsList>
          {history.map((sim) => (
            <SimulationCard
              key={sim.id}
              simulation={sim}
              isExpanded={expandedId === sim.id}
              isLoading={expandedLoading && expandedId === sim.id}
              onExpand={handleCardClick}
            />
          ))}
        </CardsList>
      )}

      {expandedId && <Overlay onClick={closeDetails} />}
    </Container>
  );
});

export default SimulationHistoryPage;
