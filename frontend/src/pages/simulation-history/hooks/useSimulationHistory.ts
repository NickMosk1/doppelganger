
import { useState, useEffect } from "react";
import { SimulationResult } from "../types";
import SimulationService from "../../../services/simulation.service";

const simulationService = new SimulationService();

export const useSimulationHistory = (schemaId: string | undefined) => {
  const [history, setHistory] = useState<SimulationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedSim, setSelectedSim] = useState<SimulationResult | null>(null);
  const [expandedLoading, setExpandedLoading] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      if (!schemaId) return;
      try {
        const data = await simulationService.getSimulationHistory(schemaId);
        setHistory(data);
      } catch (error) {
        console.error("Failed to load history:", error);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [schemaId]);

  const loadSimulationDetails = async (simId: string) => {
    setExpandedLoading(true);
    try {
      const fullResult = await simulationService.getSimulationResult(simId);
      setSelectedSim(fullResult);
      setExpandedId(simId);
    } catch (error) {
      console.error("Failed to load simulation details:", error);
    } finally {
      setExpandedLoading(false);
    }
  };

  const closeDetails = () => {
    setExpandedId(null);
    setSelectedSim(null);
  };

  return {
    history,
    loading,
    expandedId,
    selectedSim,
    expandedLoading,
    loadSimulationDetails,
    closeDetails,
  };
};
