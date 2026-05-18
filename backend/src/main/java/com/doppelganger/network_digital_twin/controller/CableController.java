package com.doppelganger.network_digital_twin.controller;

import com.doppelganger.network_digital_twin.dto.CableDto;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cables")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CableController {
    
    private final CableService cableService;
    
    @GetMapping
    public ResponseEntity<List<CableDto>> getAllCables() {
        List<CableDto> cables = cableService.getAllCables().stream()
            .map(CableDto::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(cables);
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<CableDto>> getActiveCables() {
        List<CableDto> cables = cableService.getActiveCables().stream()
            .map(CableDto::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(cables);
    }
    
    @GetMapping("/industrial")
    public ResponseEntity<List<CableDto>> getIndustrialCables() {
        List<CableDto> cables = cableService.getIndustrialCables().stream()
            .map(CableDto::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(cables);
    }
    
    @GetMapping("/shielded")
    public ResponseEntity<List<CableDto>> getShieldedCables() {
        List<CableDto> cables = cableService.getShieldedCables().stream()
            .map(CableDto::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(cables);
    }
    
    @GetMapping("/oil-resistant")
    public ResponseEntity<List<CableDto>> getOilResistantCables() {
        List<CableDto> cables = cableService.getOilResistantCables().stream()
            .map(CableDto::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(cables);
    }
    
    @GetMapping("/uv-resistant")
    public ResponseEntity<List<CableDto>> getUvResistantCables() {
        List<CableDto> cables = cableService.getUvResistantCables().stream()
            .map(CableDto::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(cables);
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
    public ResponseEntity<CableDto> getCableById(@PathVariable String id) {
        Cable cable = cableService.getCableById(id);
        return ResponseEntity.ok(CableDto.fromEntity(cable));
    }
    
    @GetMapping("/type/{type}")
    public ResponseEntity<List<CableDto>> getCablesByType(@PathVariable CableType type) {
        List<CableDto> cables = cableService.getCablesByType(type).stream()
            .map(CableDto::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(cables);
    }
    
    @GetMapping("/search/price")
    public ResponseEntity<List<CableDto>> searchByPrice(@RequestParam Double maxPrice) {
        List<CableDto> cables = cableService.searchCablesByPrice(maxPrice).stream()
            .map(CableDto::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(cables);
    }
    
    @PostMapping
    public ResponseEntity<CableDto> createCable(@Valid @RequestBody Cable cable) {
        Cable created = cableService.createCable(cable);
        return ResponseEntity.status(HttpStatus.CREATED).body(CableDto.fromEntity(created));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<CableDto> updateCable(@PathVariable String id, @Valid @RequestBody Cable cable) {
        Cable updated = cableService.updateCable(id, cable);
        return ResponseEntity.ok(CableDto.fromEntity(updated));
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
