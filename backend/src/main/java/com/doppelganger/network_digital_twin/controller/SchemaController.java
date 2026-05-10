package com.doppelganger.network_digital_twin.controller;

import com.doppelganger.network_digital_twin.dto.SchemaFullDto;
import com.doppelganger.network_digital_twin.dto.SchemaSummaryDto;
import com.doppelganger.network_digital_twin.entity.Schema;
import com.doppelganger.network_digital_twin.entity.SchemaNode;
import com.doppelganger.network_digital_twin.service.SchemaService;
import com.doppelganger.network_digital_twin.service.SchemaNodeService;
import com.doppelganger.network_digital_twin.service.ConnectionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/schemas")
@CrossOrigin(origins = "*")
public class SchemaController {

    private static final Logger log = LoggerFactory.getLogger(SchemaController.class);
    
    private final SchemaService schemaService;
    private final SchemaNodeService schemaNodeService;
    private final ConnectionService connectionService;

    // Исправленный конструктор
    public SchemaController(SchemaService schemaService, 
                            SchemaNodeService schemaNodeService,
                            ConnectionService connectionService) {
        this.schemaService = schemaService;
        this.schemaNodeService = schemaNodeService;
        this.connectionService = connectionService;
    }
    
    @GetMapping
    public ResponseEntity<List<SchemaSummaryDto>> getAllSchemas() {
        List<Schema> schemas = schemaService.getAllSchemas();
        List<SchemaSummaryDto> result = schemas.stream()
            .map(schema -> {
                // Получаем статистику для каждой схемы
                Map<String, Object> stats = schemaService.getSchemaStats(schema.getId());
                
                return SchemaSummaryDto.builder()
                    .id(schema.getId())
                    .name(schema.getName())
                    .description(schema.getDescription())
                    .depth(schema.getDepth())
                    .isPublic(schema.getIsPublic())
                    .usageCount(schema.getUsageCount())
                    .createdAt(schema.getCreatedAt() != null ? schema.getCreatedAt().toString() : null)
                    .updatedAt(schema.getUpdatedAt() != null ? schema.getUpdatedAt().toString() : null)
                    .devicesCount((Long) stats.get("devicesCount"))
                    .cablesCount((Long) stats.get("cablesCount"))
                    .connectionsCount((Long) stats.get("connectionsCount"))
                    .build();
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(result);
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
        log.info("Getting full schema for id: {}", id);
        try {
            SchemaFullDto result = schemaService.getSchemaFull(id);
            log.info("Successfully retrieved full schema: {}", id);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error getting full schema: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    @GetMapping("/{id}/children")
    public ResponseEntity<List<Schema>> getChildSchemas(@PathVariable String id) {
        return ResponseEntity.ok(schemaService.getChildSchemas(id));
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<Map<String, Object>> getSchemaStats(@PathVariable String id) {
        return ResponseEntity.ok(schemaService.getSchemaStats(id));
    }
    
    @GetMapping("/public")
    public ResponseEntity<List<Schema>> getPublicSchemas() {
        return ResponseEntity.ok(schemaService.getPublicSchemas());
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
    
    @PutMapping("/{id}/full")
    public ResponseEntity<Map<String, String>> updateFullSchema(
            @PathVariable String id,
            @RequestBody Map<String, Object> request) {
        
        log.info("Updating full schema: {}", id);
        
        // Очищаем схему
        schemaService.clearSchema(id);
        
        // Маппинг фронтовых ID -> реальных ID
        Map<String, String> nodeIdMap = new HashMap<>();
        
        // 1. Сохраняем все узлы
        List<Map<String, Object>> nodes = (List<Map<String, Object>>) request.get("nodes");
        if (nodes != null && !nodes.isEmpty()) {
            log.info("Saving {} nodes", nodes.size());
            
            for (Map<String, Object> node : nodes) {
                String frontendId = (String) node.get("id");
                String nodeType = (String) node.get("type");
                
                log.info("Saving node: frontendId={}, type={}", frontendId, nodeType);
                
                if ("DEVICE".equals(nodeType)) {
                    String deviceId = (String) node.get("deviceId");
                    double posX = node.containsKey("positionX") ? ((Number) node.get("positionX")).doubleValue() : 0.0;
                    double posY = node.containsKey("positionY") ? ((Number) node.get("positionY")).doubleValue() : 0.0;
                    String customName = (String) node.get("customName");
                    
                    SchemaNode savedNode = schemaNodeService.addDeviceToSchema(id, deviceId, posX, posY, customName);
                    nodeIdMap.put(frontendId, savedNode.getId());
                    log.info("Saved device: {} -> {}", frontendId, savedNode.getId());
                    
                } else if ("CABLE".equals(nodeType)) {
                    String name = (String) node.get("name");
                    String customName = (String) node.get("customName");
                    double posX = node.containsKey("positionX") ? ((Number) node.get("positionX")).doubleValue() : 0.0;
                    double posY = node.containsKey("positionY") ? ((Number) node.get("positionY")).doubleValue() : 0.0;
                    double lengthM = node.containsKey("lengthM") ? ((Number) node.get("lengthM")).doubleValue() : 10.0;
                    String cableType = (String) node.getOrDefault("cableType", "ETHERNET");
                    
                    SchemaNode savedNode = schemaNodeService.addCableToSchema(id, name, customName, posX, posY, lengthM, cableType);
                    nodeIdMap.put(frontendId, savedNode.getId());
                    log.info("Saved cable: {} -> {}", frontendId, savedNode.getId());
                }
            }
        }
        
        // 2. Сохраняем связи с правильными ID
        List<Map<String, Object>> connections = (List<Map<String, Object>>) request.get("connections");
        if (connections != null && !connections.isEmpty()) {
            log.info("Saving {} connections", connections.size());
            
            for (Map<String, Object> conn : connections) {
                String frontendSourceId = (String) conn.get("sourceNodeId");
                String frontendTargetId = (String) conn.get("targetNodeId");
                
                // Получаем реальные ID из маппинга
                String realSourceId = nodeIdMap.get(frontendSourceId);
                String realTargetId = nodeIdMap.get(frontendTargetId);
                
                if (realSourceId == null || realTargetId == null) {
                    log.warn("Could not find real IDs for connection: {} -> {}", frontendSourceId, frontendTargetId);
                    continue;
                }
                
                String sourcePortId = (String) conn.get("sourcePortId");
                String targetPortId = (String) conn.get("targetPortId");
                double lengthM = conn.containsKey("lengthM") ? ((Number) conn.get("lengthM")).doubleValue() : 10.0;
                
                connectionService.createConnection(id, realSourceId, realTargetId, 
                    sourcePortId, targetPortId, null, lengthM);
                log.info("Saved connection: {} -> {}", realSourceId, realTargetId);
            }
        }
        
        log.info("Schema saved successfully. Nodes saved: {}, Connections saved: {}", 
            nodeIdMap.size(), connections != null ? connections.size() : 0);
        
        return ResponseEntity.ok(nodeIdMap);
    }
    
    @PostMapping("/{id}/last-opened")
    public ResponseEntity<Void> updateLastOpened(@PathVariable String id) {
        schemaService.updateLastOpened(id);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchema(@PathVariable String id) {
        schemaService.deleteSchema(id);
        return ResponseEntity.noContent().build();
    }
}
