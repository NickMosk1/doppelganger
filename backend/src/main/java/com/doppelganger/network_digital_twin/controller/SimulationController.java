package com.doppelganger.network_digital_twin.controller;

import com.doppelganger.network_digital_twin.dto.SimulationRequestDto;
import com.doppelganger.network_digital_twin.dto.SimulationResponseDto;
import com.doppelganger.network_digital_twin.service.SimulationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/schemas/{schemaId}/simulate")
@CrossOrigin(origins = "*")
public class SimulationController {
    
    private final SimulationService simulationService;
    
    public SimulationController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }
    
    @PostMapping
    public ResponseEntity<SimulationResponseDto> runSimulation(
            @PathVariable String schemaId,
            @RequestBody(required = false) SimulationRequestDto request) {
        
        if (request == null) {
            request = SimulationRequestDto.builder()
                .name("Quick simulation")
                .durationSeconds(60)
                .saveHistory(false)
                .build();
        }
        
        SimulationResponseDto result = simulationService.runSimulation(schemaId, request);
        return ResponseEntity.ok(result);
    }
}
