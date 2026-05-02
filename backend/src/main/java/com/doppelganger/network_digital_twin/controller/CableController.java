package com.doppelganger.network_digital_twin.controller;

import com.doppelganger.network_digital_twin.entity.Cable;
import com.doppelganger.network_digital_twin.entity.Cable.CableType;
import com.doppelganger.network_digital_twin.service.CableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cables")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CableController {
    
    private final CableService cableService;
    
    @GetMapping
    public ResponseEntity<List<Cable>> getAllCables() {
        return ResponseEntity.ok(cableService.getAllCables());
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<Cable>> getActiveCables() {
        return ResponseEntity.ok(cableService.getActiveCables());
    }
    
    @GetMapping("/industrial")
    public ResponseEntity<List<Cable>> getIndustrialCables() {
        return ResponseEntity.ok(cableService.getIndustrialCables());
    }
    
    @GetMapping("/shielded")
    public ResponseEntity<List<Cable>> getShieldedCables() {
        return ResponseEntity.ok(cableService.getShieldedCables());
    }
    
    @GetMapping("/types")
    public ResponseEntity<Map<String, String>> getCableTypes() {
        return ResponseEntity.ok(Map.of(
            "COPPER", CableType.COPPER.getRussianName(),
            "FIBER", CableType.FIBER.getRussianName(),
            "TWISTED_PAIR", CableType.TWISTED_PAIR.getRussianName(),
            "COAXIAL", CableType.COAXIAL.getRussianName(),
            "SHIELDED", CableType.SHIELDED.getRussianName(),
            "INDUSTRIAL", CableType.INDUSTRIAL.getRussianName()
        ));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Cable> getCableById(@PathVariable String id) {
        return ResponseEntity.ok(cableService.getCableById(id));
    }
    
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Cable>> getCablesByType(@PathVariable CableType type) {
        return ResponseEntity.ok(cableService.getCablesByType(type));
    }
    
    @GetMapping("/search/price")
    public ResponseEntity<List<Cable>> searchByPrice(@RequestParam Double maxPrice) {
        return ResponseEntity.ok(cableService.searchCablesByPrice(maxPrice));
    }
    
    @PostMapping
    public ResponseEntity<Cable> createCable(@Valid @RequestBody Cable cable) {
        Cable created = cableService.createCable(cable);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Cable> updateCable(@PathVariable String id, @Valid @RequestBody Cable cable) {
        return ResponseEntity.ok(cableService.updateCable(id, cable));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCable(@PathVariable String id) {
        cableService.deleteCable(id);
        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateCable(@PathVariable String id) {
        cableService.deactivateCable(id);
        return ResponseEntity.noContent().build();
    }
}
