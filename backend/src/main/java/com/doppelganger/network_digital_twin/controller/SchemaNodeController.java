package com.doppelganger.network_digital_twin.controller;

import com.doppelganger.network_digital_twin.entity.SchemaNode;
import com.doppelganger.network_digital_twin.service.SchemaNodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/schemas/{schemaId}/nodes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SchemaNodeController {
    
    private final SchemaNodeService schemaNodeService;
    
    // GET /api/schemas/{schemaId}/nodes - все узлы схемы
    @GetMapping
    public ResponseEntity<List<SchemaNode>> getNodesBySchema(@PathVariable String schemaId) {
        return ResponseEntity.ok(schemaNodeService.getNodesBySchemaId(schemaId));
    }
    
    // GET /api/schemas/{schemaId}/nodes/count - количество устройств на схеме
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getNodesCount(@PathVariable String schemaId) {
        long count = schemaNodeService.countDevicesOnSchema(schemaId);
        return ResponseEntity.ok(Map.of("count", count));
    }
    
    // GET /api/schemas/{schemaId}/nodes/{nodeId} - получить узел по ID
    @GetMapping("/{nodeId}")
    public ResponseEntity<SchemaNode> getNodeById(@PathVariable String nodeId) {
        return ResponseEntity.ok(schemaNodeService.getNodeById(nodeId));
    }
    
    // POST /api/schemas/{schemaId}/nodes/devices/{deviceId} - добавить устройство на схему
    @PostMapping("/devices/{deviceId}")
    public ResponseEntity<SchemaNode> addDeviceToSchema(
            @PathVariable String schemaId,
            @PathVariable String deviceId,
            @RequestBody(required = false) Map<String, Object> request) {
        
        Double posX = request != null && request.containsKey("positionX") 
            ? ((Number) request.get("positionX")).doubleValue() : 0.0;
        Double posY = request != null && request.containsKey("positionY") 
            ? ((Number) request.get("positionY")).doubleValue() : 0.0;
        String customName = request != null && request.containsKey("customName") 
            ? (String) request.get("customName") : null;
        
        SchemaNode node = schemaNodeService.addDeviceToSchema(schemaId, deviceId, posX, posY, customName);
        return ResponseEntity.status(HttpStatus.CREATED).body(node);
    }
    
    // POST /api/schemas/{schemaId}/nodes/subschemas/{childSchemaId} - добавить под-схему
    @PostMapping("/subschemas/{childSchemaId}")
    public ResponseEntity<SchemaNode> addSubSchemaToSchema(
            @PathVariable String schemaId,
            @PathVariable String childSchemaId,
            @RequestBody(required = false) Map<String, Object> request) {
        
        Double posX = request != null && request.containsKey("positionX") 
            ? ((Number) request.get("positionX")).doubleValue() : 0.0;
        Double posY = request != null && request.containsKey("positionY") 
            ? ((Number) request.get("positionY")).doubleValue() : 0.0;
        String customName = request != null && request.containsKey("customName") 
            ? (String) request.get("customName") : null;
        
        SchemaNode node = schemaNodeService.addSubSchemaToSchema(schemaId, childSchemaId, posX, posY, customName);
        return ResponseEntity.status(HttpStatus.CREATED).body(node);
    }
    
    // PUT /api/schemas/{schemaId}/nodes/{nodeId}/position - обновить позицию
    @PutMapping("/{nodeId}/position")
    public ResponseEntity<SchemaNode> updateNodePosition(
            @PathVariable String nodeId,
            @RequestBody Map<String, Double> position) {
        
        Double posX = position.get("positionX");
        Double posY = position.get("positionY");
        SchemaNode node = schemaNodeService.updateNodePosition(nodeId, posX, posY);
        return ResponseEntity.ok(node);
    }
    
    // PUT /api/schemas/{schemaId}/nodes/{nodeId}/name - обновить кастомное имя
    @PutMapping("/{nodeId}/name")
    public ResponseEntity<SchemaNode> updateNodeCustomName(
            @PathVariable String nodeId,
            @RequestBody Map<String, String> request) {
        
        String customName = request.get("customName");
        SchemaNode node = schemaNodeService.updateNodeCustomName(nodeId, customName);
        return ResponseEntity.ok(node);
    }
    
    // PUT /api/schemas/{schemaId}/nodes/{nodeId}/coefficients - обновить коэффициенты
    @PutMapping("/{nodeId}/coefficients")
    public ResponseEntity<SchemaNode> updateNodeCoefficients(
            @PathVariable String nodeId,
            @RequestBody Map<String, Double> coefficients) {
        
        SchemaNode node = schemaNodeService.updateNodeCoefficients(
            nodeId,
            coefficients.get("temperatureOffset"),
            coefficients.get("emiOffset"),
            coefficients.get("vibrationOffset"),
            coefficients.get("dustOffset")
        );
        return ResponseEntity.ok(node);
    }
    
    // PATCH /api/schemas/{schemaId}/nodes/{nodeId}/toggle - включить/выключить узел
    @PatchMapping("/{nodeId}/toggle")
    public ResponseEntity<SchemaNode> toggleNode(
            @PathVariable String nodeId,
            @RequestBody Map<String, Boolean> request) {
        
        Boolean isEnabled = request.get("isEnabled");
        SchemaNode node = schemaNodeService.toggleNodeEnabled(nodeId, isEnabled);
        return ResponseEntity.ok(node);
    }
    
    // DELETE /api/schemas/{schemaId}/nodes/{nodeId} - удалить узел
    @DeleteMapping("/{nodeId}")
    public ResponseEntity<Void> deleteNode(@PathVariable String nodeId) {
        schemaNodeService.deleteNode(nodeId);
        return ResponseEntity.noContent().build();
    }
    
    // DELETE /api/schemas/{schemaId}/nodes - удалить все узлы схемы
    @DeleteMapping
    public ResponseEntity<Void> deleteAllNodes(@PathVariable String schemaId) {
        schemaNodeService.deleteAllNodesBySchemaId(schemaId);
        return ResponseEntity.noContent().build();
    }
}
