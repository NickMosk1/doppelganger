package com.doppelganger.network_digital_twin.controller;

import com.doppelganger.network_digital_twin.dto.SimulationRequestDto;
import com.doppelganger.network_digital_twin.dto.SimulationResponseDto;
import com.doppelganger.network_digital_twin.service.simulation.SimulationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class SimulationController {
    
    private final SimulationService simulationService;
    
    public SimulationController(SimulationService simulationService) {
        this.simulationService = simulationService;
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
}
