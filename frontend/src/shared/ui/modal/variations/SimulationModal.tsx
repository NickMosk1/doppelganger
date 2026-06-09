import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SimulationService from '../../../../services/simulation.service';
import { useStores } from '../../../../hooks';
import { Button } from '../../../components';
import Modal from '../Modal';

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #666;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
`;

const PathContainer = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`;

const PathTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PathList = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

const PathNode = styled.span<{ isStart?: boolean; isEnd?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  background: ${props => props.isStart ? '#10b98120' : props.isEnd ? '#ef444420' : 'white'};
  border: 1px solid ${props => props.isStart ? '#10b981' : props.isEnd ? '#ef4444' : '#e2e8f0'};
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.isStart ? '#10b981' : props.isEnd ? '#ef4444' : '#1e293b'};
`;

const PathArrow = styled.span`
  color: #94a3b8;
  font-size: 14px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  background: #f8fafc;
  border-radius: 10px;
  padding: 12px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #e54848;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: #64748b;
  margin-top: 4px;
`;

const FactorList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
`;

const FactorTag = styled.span`
  padding: 4px 10px;
  background: #f1f5f9;
  border-radius: 16px;
  font-size: 11px;
  color: #475569;
`;

const SectionTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e2e8f0;
`;

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const simulationService = new SimulationService();

const SimulationModal: React.FC<SimulationModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { editorStore, simulationStore } = useStores();
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const [path, setPath] = useState<{ id: string; name: string }[]>([]);
  const [stats, setStats] = useState<{ devicesCount: number; cablesCount: number; factorsCount: number } | null>(null);

  const startNodeId = editorStore.startPointId;
  const endNodeId = editorStore.endPointId;

  // Находим путь между стартом и финишем
  useEffect(() => {
    if (startNodeId && endNodeId) {
      const foundPath = findPathBetweenNodes(startNodeId, endNodeId);
      setPath(foundPath);
    } else {
      setPath([]);
    }
  }, [startNodeId, endNodeId, editorStore.nodes, editorStore.edges]);

  // Собираем статистику схемы
  useEffect(() => {
    const devices = editorStore.nodes.filter(n => n.type === 'DEVICE');
    const cables = editorStore.nodes.filter(n => n.type === 'CABLE');
    const factors = editorStore.nodes.filter(n => n.type === 'FACTOR');
    setStats({
      devicesCount: devices.length,
      cablesCount: cables.length,
      factorsCount: factors.length,
    });
  }, [editorStore.nodes]);

  // Поиск пути между узлами (BFS)
  const findPathBetweenNodes = (startId: string, endId: string): { id: string; name: string }[] => {
    const adjacencyList = new Map<string, string[]>();
    
    editorStore.edges.forEach(edge => {
      if (edge.connectionType === 'CABLE_DEVICE') {
        adjacencyList.set(edge.sourceNodeId, [...(adjacencyList.get(edge.sourceNodeId) || []), edge.targetNodeId]);
        adjacencyList.set(edge.targetNodeId, [...(adjacencyList.get(edge.targetNodeId) || []), edge.sourceNodeId]);
      }
    });

    const queue: string[][] = [[startId]];
    const visited = new Set<string>([startId]);

    while (queue.length > 0) {
      const pathIds = queue.shift()!;
      const lastId = pathIds[pathIds.length - 1];

      if (lastId === endId) {
        return pathIds.map(id => {
          const node = editorStore.getNodeById(id);
          return { id, name: node?.customName || node?.name || 'Устройство' };
        });
      }

      const neighbors = adjacencyList.get(lastId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...pathIds, neighbor]);
        }
      }
    }

    return [];
  };

  const isPathValid = path.length >= 2;

  const handleRunSimulation = async () => {
    if (!startNodeId || !endNodeId || !isPathValid) {
      alert('Укажите корректные точки старта и финиша');
      return;
    }

    setLoading(true);
    try {
      const result = await simulationService.runSimulation(editorStore.currentSchemaId!, {
        name: `Симуляция ${new Date().toLocaleTimeString()}`,
        startNodeId: startNodeId!,
        endNodeId: endNodeId!,
        durationSeconds: duration,
      });

      simulationStore.setCurrentResult(result);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Simulation failed:', error);
      alert('Ошибка при запуске симуляции');
    } finally {
      setLoading(false);
    }
  };

  const isValid = startNodeId && endNodeId && isPathValid;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Запуск симуляции">
      <FormGroup>
        <Label>Название симуляции</Label>
        <Input 
          type="text" 
          placeholder="Например: Тест производительности"
          defaultValue={`Симуляция ${new Date().toLocaleDateString()}`}
        />
      </FormGroup>

      <FormGroup>
        <Label>Длительность (секунды)</Label>
        <Input 
          type="number" 
          value={duration} 
          onChange={(e) => setDuration(Number(e.target.value))}
          min={10}
          max={600}
          step={10}
        />
      </FormGroup>

      <SectionTitle>Маршрут передачи данных</SectionTitle>
      <PathContainer>
        <PathTitle>
          {isPathValid ? 'Маршрут найден' : 'Маршрут не найден'}
        </PathTitle>
        <PathList>
          {path.map((node, idx) => (
            <React.Fragment key={node.id}>
              <PathNode isStart={idx === 0} isEnd={idx === path.length - 1}>
                {idx === 0 && '🚀 '}
                {idx === path.length - 1 && '🎯 '}
                {node.name}
              </PathNode>
              {idx < path.length - 1 && <PathArrow>→</PathArrow>}
            </React.Fragment>
          ))}
        </PathList>
        {!isPathValid && startNodeId && endNodeId && (
          <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '8px' }}>
            Нет соединения между выбранными устройствами
          </div>
        )}
      </PathContainer>

      <SectionTitle>🏭 Активные факторы</SectionTitle>
      <FactorList>
        {editorStore.nodes
          .filter(n => n.type === 'FACTOR' && n.isEnabled !== false)
          .map(factor => (
            <FactorTag key={factor.id}>
              {factor.icon || '📊'} {factor.factorType} ({factor.factorValue}{factor.factorUnit})
            </FactorTag>
          ))}
        {editorStore.nodes.filter(n => n.type === 'FACTOR' && n.isEnabled !== false).length === 0 && (
          <div style={{ fontSize: '12px', color: '#999' }}>Нет активных факторов</div>
        )}
      </FactorList>

      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
        <Button variant="outline" onClick={onClose} fullWidth>Отмена</Button>
        <Button 
          onClick={handleRunSimulation} 
          loading={loading}
          disabled={!isValid}
          fullWidth
        >
          {loading ? 'Запуск...' : '▶ Запустить симуляцию'}
        </Button>
      </div>
    </Modal>
  );
};

export default SimulationModal;
