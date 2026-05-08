import { observer } from 'mobx-react-lite';
import { useStores } from '../../../../../../hooks';
import { FactorLabel, FactorRow, FactorSlider, FactorValue, Section, SectionTitle } from '../../RightPanel.styles';

const FactorsTab: React.FC = observer(() => {
  const { simulationStore } = useStores();
  const factors = simulationStore.globalFactors;

  const handleTemperatureChange = (value: number) => {
    simulationStore.setTemperature(value);
  };

  const handleEmiChange = (value: number) => {
    simulationStore.setEmi(value);
  };

  const handleVibrationChange = (value: number) => {
    simulationStore.setVibration(value);
  };

  const handleDustChange = (value: number) => {
    simulationStore.setDust(value);
  };

  return (
    <Section>
      <SectionTitle>Глобальные факторы</SectionTitle>
      
      <FactorRow>
        <FactorLabel>Температура цеха</FactorLabel>
        <FactorSlider
          type="range"
          min={-20}
          max={60}
          step={1}
          value={factors.temperature}
          onChange={(e) => handleTemperatureChange(Number(e.target.value))}
        />
        <FactorValue>{factors.temperature}°C</FactorValue>
      </FactorRow>

      <FactorRow>
        <FactorLabel>Электромагнитные помехи</FactorLabel>
        <FactorSlider
          type="range"
          min={0}
          max={100}
          step={1}
          value={factors.emi}
          onChange={(e) => handleEmiChange(Number(e.target.value))}
        />
        <FactorValue>{factors.emi} dBm</FactorValue>
      </FactorRow>

      <FactorRow>
        <FactorLabel>Вибрация</FactorLabel>
        <FactorSlider
          type="range"
          min={0}
          max={120}
          step={1}
          value={factors.vibration}
          onChange={(e) => handleVibrationChange(Number(e.target.value))}
        />
        <FactorValue>{factors.vibration} Hz</FactorValue>
      </FactorRow>

      <FactorRow>
        <FactorLabel>Запыленность</FactorLabel>
        <FactorSlider
          type="range"
          min={0}
          max={100}
          step={1}
          value={factors.dust}
          onChange={(e) => handleDustChange(Number(e.target.value))}
        />
        <FactorValue>{factors.dust} mg/m³</FactorValue>
      </FactorRow>
    </Section>
  );
});

export default FactorsTab;
