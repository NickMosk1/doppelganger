package com.doppelganger.network_digital_twin.service.simulation;

import com.doppelganger.network_digital_twin.entity.SchemaNode;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class SimulationContext {
    private String schemaId;
    private List<String> path;  // путь от start до end
    private List<SchemaNode> allNodes;
    private Map<String, List<FactorImpact>> factorImpacts;  // элемент -> список факторов
    private Map<String, ElementSpecs> elementSpecs;        // элемент -> характеристики
    private Integer durationSeconds;
    private Integer stepSeconds;
}
