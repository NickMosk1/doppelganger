package com.doppelganger.network_digital_twin.controller;

import com.doppelganger.network_digital_twin.dto.SimulationRequestDto;
import com.doppelganger.network_digital_twin.dto.SimulationResponseDto;
import com.doppelganger.network_digital_twin.entity.Connection;
import com.doppelganger.network_digital_twin.entity.SchemaNode;
import com.doppelganger.network_digital_twin.repository.ConnectionRepository;
import com.doppelganger.network_digital_twin.repository.SchemaNodeRepository;
import com.doppelganger.network_digital_twin.service.simulation.SimulationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class SimulationController {
    
    private final SimulationService simulationService;
    private final SchemaNodeRepository schemaNodeRepository;
    private final ConnectionRepository connectionRepository;
    
    public SimulationController(SimulationService simulationService,
                                SchemaNodeRepository schemaNodeRepository,
                                ConnectionRepository connectionRepository) {
        this.simulationService = simulationService;
        this.schemaNodeRepository = schemaNodeRepository;
        this.connectionRepository = connectionRepository;
    }
    
    @PostMapping("/schemas/{schemaId}/simulations/run")
    public ResponseEntity<SimulationResponseDto> runSimulation(
            @PathVariable String schemaId,
            @RequestBody SimulationRequestDto request) {
        
        SimulationResponseDto result = simulationService.runSimulation(
            schemaId,
            request.getStartNodeId(),
            request.getEndNodeId(),
            request.getName(),
            request.getDurationSeconds()
        );
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/schemas/{schemaId}/simulations/history")
    public ResponseEntity<List<SimulationResponseDto>> getSimulationHistory(@PathVariable String schemaId) {
        return ResponseEntity.ok(simulationService.getSimulationHistory(schemaId));
    }
    
    @GetMapping("/simulations/{simulationId}")
    public ResponseEntity<SimulationResponseDto> getSimulationResult(@PathVariable String simulationId) {
        return ResponseEntity.ok(simulationService.getSimulationResult(simulationId));
    }

    @GetMapping("/debug/factors/{schemaId}")
    public ResponseEntity<Map<String, Object>> debugFactors(@PathVariable String schemaId) {
        Map<String, Object> debug = new HashMap<>();
        
        List<SchemaNode> nodes = schemaNodeRepository.findBySchemaId(schemaId);
        List<Connection> connections = connectionRepository.findBySchemaId(schemaId);
        
        // Факторы
        List<Map<String, Object>> factors = nodes.stream()
            .filter(n -> n.getNodeType() == SchemaNode.NodeType.FACTOR)
            .map(n -> {
                Map<String, Object> f = new HashMap<>();
                f.put("id", n.getId());
                f.put("name", n.getName());
                f.put("factorType", n.getFactorType());
                f.put("factorValue", n.getFactorValue());
                f.put("warningThreshold", n.getWarningThreshold());
                f.put("criticalThreshold", n.getCriticalThreshold());
                f.put("failureThreshold", n.getFailureThreshold());
                f.put("valueChangePattern", n.getValueChangePattern());
                f.put("isEnabled", n.getIsEnabled());
                return f;
            })
            .collect(Collectors.toList());
        
        // FACTOR_ELEMENT связи
        List<Map<String, Object>> factorConnections = connections.stream()
            .filter(c -> c.getConnectionType() == Connection.ConnectionType.FACTOR_ELEMENT)
            .map(c -> {
                Map<String, Object> conn = new HashMap<>();
                conn.put("id", c.getId());
                conn.put("sourceNodeId", c.getSourceNode().getId());
                conn.put("targetNodeId", c.getTargetNode().getId());
                conn.put("distance", c.getDistance());
                return conn;
            })
            .collect(Collectors.toList());
        
        debug.put("factors", factors);
        debug.put("factorConnections", factorConnections);
        debug.put("totalFactors", factors.size());
        debug.put("totalFactorConnections", factorConnections.size());
        
        return ResponseEntity.ok(debug);
    }
}