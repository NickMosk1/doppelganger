// backend/src/main/java/com/doppelganger/network_digital_twin/controller/FactorController.java
package com.doppelganger.network_digital_twin.controller;

import com.doppelganger.network_digital_twin.entity.FactorNode;
import com.doppelganger.network_digital_twin.service.FactorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/factors")
@CrossOrigin(origins = "*")
public class FactorController {
    
    private final FactorService factorService;
    
    public FactorController(FactorService factorService) {
        this.factorService = factorService;
    }
    
    @GetMapping
    public ResponseEntity<List<FactorNode>> getAllFactors() {
        return ResponseEntity.ok(factorService.getAllFactors());
    }
    
    @GetMapping("/schema/{schemaId}")
    public ResponseEntity<List<FactorNode>> getFactorsBySchema(@PathVariable String schemaId) {
        return ResponseEntity.ok(factorService.getFactorsBySchema(schemaId));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<FactorNode> getFactorById(@PathVariable String id) {
        return ResponseEntity.ok(factorService.getFactorById(id));
    }
    
    @GetMapping("/type/{type}")
    public ResponseEntity<List<FactorNode>> getFactorsByType(@PathVariable String type) {
        return ResponseEntity.ok(factorService.getFactorsByType(type));
    }
    
    @PostMapping
    public ResponseEntity<FactorNode> createFactor(@Valid @RequestBody FactorNode factor) {
        FactorNode created = factorService.createFactor(factor);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PostMapping("/schema/{schemaId}")
    public ResponseEntity<FactorNode> createFactorInSchema(@PathVariable String schemaId, @Valid @RequestBody FactorNode factor) {
        FactorNode created = factorService.createFactorInSchema(schemaId, factor);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<FactorNode> updateFactor(@PathVariable String id, @Valid @RequestBody FactorNode factor) {
        return ResponseEntity.ok(factorService.updateFactor(id, factor));
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
