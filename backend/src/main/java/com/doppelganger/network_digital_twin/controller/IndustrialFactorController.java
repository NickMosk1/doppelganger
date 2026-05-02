package com.doppelganger.network_digital_twin.controller;

import com.doppelganger.network_digital_twin.entity.IndustrialFactor;
import com.doppelganger.network_digital_twin.service.IndustrialFactorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/factors")
@CrossOrigin(origins = "*")
public class IndustrialFactorController {
    
    private final IndustrialFactorService factorService;
    
    public IndustrialFactorController(IndustrialFactorService factorService) {
        this.factorService = factorService;
    }
    
    @GetMapping
    public ResponseEntity<List<IndustrialFactor>> getAllFactors() {
        return ResponseEntity.ok(factorService.getAllFactors());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<IndustrialFactor> getFactorById(@PathVariable String id) {
        return ResponseEntity.ok(factorService.getFactorById(id));
    }
    
    @GetMapping("/name/{name}")
    public ResponseEntity<IndustrialFactor> getFactorByName(@PathVariable String name) {
        return ResponseEntity.ok(factorService.getFactorByName(name));
    }
    
    @PutMapping("/{id}/value")
    public ResponseEntity<IndustrialFactor> updateFactorValue(
            @PathVariable String id,
            @RequestBody Map<String, Double> request) {
        Double newValue = request.get("value");
        IndustrialFactor updated = factorService.updateFactorValue(id, newValue);
        return ResponseEntity.ok(updated);
    }
    
    @GetMapping("/current")
    public ResponseEntity<Map<String, Double>> getCurrentFactors() {
        Map<String, Double> currentFactors = new HashMap<>();
        
        factorService.getAllFactors().forEach(factor -> {
            currentFactors.put(factor.getName(), factor.getValue());
        });
        
        return ResponseEntity.ok(currentFactors);
    }
}
