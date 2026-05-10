// backend/src/main/java/com/doppelganger/network_digital_twin/controller/ConnectionController.java
package com.doppelganger.network_digital_twin.controller;

import com.doppelganger.network_digital_twin.entity.Connection;
import com.doppelganger.network_digital_twin.service.ConnectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/schemas/{schemaId}/connections")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ConnectionController {
    
    private final ConnectionService connectionService;
    
    @GetMapping
    public ResponseEntity<List<Connection>> getConnections(@PathVariable String schemaId) {
        return ResponseEntity.ok(connectionService.getConnectionsBySchemaId(schemaId));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Connection> getConnectionById(@PathVariable String id) {
        return ResponseEntity.ok(connectionService.getConnectionById(id));
    }
    
    @PostMapping
    public ResponseEntity<Connection> createConnection(
            @PathVariable String schemaId,
            @RequestBody Map<String, Object> request) {
        
        String sourceNodeId = (String) request.get("sourceNodeId");
        String targetNodeId = (String) request.get("targetNodeId");
        String sourcePortId = (String) request.get("sourcePortId");
        String targetPortId = (String) request.get("targetPortId");
        String cableId = (String) request.get("cableId");
        Double lengthM = request.get("lengthM") != null ? 
            ((Number) request.get("lengthM")).doubleValue() : 10.0;
        
        Connection connection = connectionService.createConnection(
            schemaId, sourceNodeId, targetNodeId, sourcePortId, targetPortId, cableId, lengthM);
        return ResponseEntity.status(HttpStatus.CREATED).body(connection);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Connection> updateConnection(
            @PathVariable String id,
            @RequestBody Map<String, Double> request) {
        Double lengthM = request.get("lengthM");
        return ResponseEntity.ok(connectionService.updateConnection(id, lengthM));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConnection(@PathVariable String id) {
        connectionService.deleteConnection(id);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping
    public ResponseEntity<Void> deleteAllConnections(@PathVariable String schemaId) {
        connectionService.deleteAllConnectionsBySchemaId(schemaId);
        return ResponseEntity.noContent().build();
    }
}
