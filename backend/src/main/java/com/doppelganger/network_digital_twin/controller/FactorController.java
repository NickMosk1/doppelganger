package com.doppelganger.network_digital_twin.controller;

import com.doppelganger.network_digital_twin.dto.FactorDto;
import com.doppelganger.network_digital_twin.entity.FactorNode;
import com.doppelganger.network_digital_twin.service.FactorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/factors")
@CrossOrigin(origins = "*")
public class FactorController {
    
    private final FactorService factorService;
    
    public FactorController(FactorService factorService) {
        this.factorService = factorService;
    }
    
    @GetMapping
    public ResponseEntity<List<FactorDto>> getAllFactors() {
        List<FactorDto> factors = factorService.getAllFactors().stream()
            .map(FactorDto::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(factors);
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<FactorDto>> getActiveFactors() {
        List<FactorDto> factors = factorService.getActiveFactors().stream()
            .map(FactorDto::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(factors);
    }
    
    @GetMapping("/schema/{schemaId}")
    public ResponseEntity<List<FactorDto>> getFactorsBySchema(@PathVariable String schemaId) {
        List<FactorDto> factors = factorService.getFactorsBySchema(schemaId).stream()
            .map(FactorDto::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(factors);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<FactorDto> getFactorById(@PathVariable String id) {
        FactorNode factor = factorService.getFactorById(id);
        return ResponseEntity.ok(FactorDto.fromEntity(factor));
    }
    
    @GetMapping("/type/{type}")
    public ResponseEntity<List<FactorDto>> getFactorsByType(@PathVariable String type) {
        List<FactorDto> factors = factorService.getFactorsByType(type).stream()
            .map(FactorDto::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(factors);
    }
    
    @GetMapping("/priority/{minPriority}")
    public ResponseEntity<List<FactorDto>> getFactorsByPriority(@PathVariable Integer minPriority) {
        List<FactorDto> factors = factorService.getFactorsByPriority(minPriority).stream()
            .map(FactorDto::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(factors);
    }
    
    @GetMapping("/dynamic")
    public ResponseEntity<List<FactorDto>> getDynamicFactors() {
        List<FactorDto> factors = factorService.getDynamicFactors().stream()
            .map(FactorDto::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(factors);
    }
    
    @PostMapping
    public ResponseEntity<FactorDto> createFactor(@Valid @RequestBody FactorNode factor) {
        FactorNode created = factorService.createFactor(factor);
        return ResponseEntity.status(HttpStatus.CREATED).body(FactorDto.fromEntity(created));
    }
    
    @PostMapping("/schema/{schemaId}")
    public ResponseEntity<FactorDto> createFactorInSchema(@PathVariable String schemaId, 
                                                           @Valid @RequestBody FactorNode factor) {
        FactorNode created = factorService.createFactorInSchema(schemaId, factor);
        return ResponseEntity.status(HttpStatus.CREATED).body(FactorDto.fromEntity(created));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<FactorDto> updateFactor(@PathVariable String id, 
                                                   @Valid @RequestBody FactorNode factor) {
        FactorNode updated = factorService.updateFactor(id, factor);
        return ResponseEntity.ok(FactorDto.fromEntity(updated));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFactor(@PathVariable String id) {
        factorService.deleteFactor(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/types")
    public ResponseEntity<Map<String, String>> getFactorTypes() {
        return ResponseEntity.ok(Map.of(
            "TEMPERATURE", "Температура",
            "EMI", "Электромагнитные помехи",
            "VIBRATION", "Вибрация",
            "DUST", "Запыленность"
        ));
    }
}
