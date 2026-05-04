package com.doppelganger.network_digital_twin.controller;

import com.doppelganger.network_digital_twin.dto.SchemaFullDto;
import com.doppelganger.network_digital_twin.entity.Schema;
import com.doppelganger.network_digital_twin.service.SchemaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/schemas")
@CrossOrigin(origins = "*")
public class SchemaController {
    
    private final SchemaService schemaService;
    
    public SchemaController(SchemaService schemaService) {
        this.schemaService = schemaService;
    }
    
    @GetMapping
    public ResponseEntity<List<Schema>> getAllSchemas() {
        return ResponseEntity.ok(schemaService.getAllSchemas());
    }
    
    @GetMapping("/root")
    public ResponseEntity<List<Schema>> getRootSchemas() {
        return ResponseEntity.ok(schemaService.getRootSchemas());
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Schema>> searchSchemas(@RequestParam String name) {
        return ResponseEntity.ok(schemaService.searchSchemasByName(name));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Schema> getSchemaById(@PathVariable String id) {
        return ResponseEntity.ok(schemaService.getSchemaById(id));
    }
    
    @GetMapping("/{id}/full")
    public ResponseEntity<SchemaFullDto> getSchemaFull(@PathVariable String id) {
        return ResponseEntity.ok(schemaService.getSchemaFull(id));
    }
    
    @GetMapping("/{id}/children")
    public ResponseEntity<List<Schema>> getChildSchemas(@PathVariable String id) {
        return ResponseEntity.ok(schemaService.getChildSchemas(id));
    }
    
    @GetMapping("/{id}/stats")
    public ResponseEntity<Map<String, Object>> getSchemaStats(@PathVariable String id) {
        return ResponseEntity.ok(schemaService.getSchemaStats(id));
    }
    
    @PostMapping
    public ResponseEntity<Schema> createSchema(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String description = request.getOrDefault("description", "");
        Schema created = schemaService.createSchema(name, description);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PostMapping("/{parentId}/children")
    public ResponseEntity<Schema> createChildSchema(
            @PathVariable String parentId,
            @RequestBody Map<String, String> request) {
        String name = request.get("name");
        String description = request.getOrDefault("description", "");
        Schema created = schemaService.createChildSchema(parentId, name, description);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Schema> updateSchema(
            @PathVariable String id,
            @RequestBody Map<String, Object> request) {
        String name = (String) request.get("name");
        String description = (String) request.getOrDefault("description", "");
        Double tempOffset = request.containsKey("temperatureOffset") ? 
            ((Number) request.get("temperatureOffset")).doubleValue() : null;
        Double emiOffset = request.containsKey("emiOffset") ? 
            ((Number) request.get("emiOffset")).doubleValue() : null;
        Double vibOffset = request.containsKey("vibrationOffset") ? 
            ((Number) request.get("vibrationOffset")).doubleValue() : null;
        Double dustOffset = request.containsKey("dustOffset") ? 
            ((Number) request.get("dustOffset")).doubleValue() : null;
        
        Schema updated = schemaService.updateSchema(id, name, description, 
            tempOffset, emiOffset, vibOffset, dustOffset);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchema(@PathVariable String id) {
        schemaService.deleteSchema(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/public")
    public ResponseEntity<List<Schema>> getPublicSchemas() {
        return ResponseEntity.ok(schemaService.getPublicSchemas());
    }
}
