package com.doppelganger.network_digital_twin.controller;

import com.doppelganger.network_digital_twin.dto.SchemaFullDto;
import com.doppelganger.network_digital_twin.dto.SchemaSummaryDto;
import com.doppelganger.network_digital_twin.entity.*;
import com.doppelganger.network_digital_twin.entity.SchemaNode.NodeType;
import com.doppelganger.network_digital_twin.service.SchemaService;
import com.doppelganger.network_digital_twin.service.SchemaNodeService;
import com.doppelganger.network_digital_twin.service.ConnectionService;
import com.doppelganger.network_digital_twin.repository.ConnectionRepository;
import com.doppelganger.network_digital_twin.repository.DeviceRepository;
import com.doppelganger.network_digital_twin.repository.SchemaNodeRepository;
import com.doppelganger.network_digital_twin.repository.SchemaRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
    private final ConnectionRepository connectionRepository;
    private final SchemaNodeRepository schemaNodeRepository;
    private final DeviceRepository deviceRepository;
    private final SchemaRepository schemaRepository;

    public SchemaController(SchemaService schemaService,
                            SchemaNodeService schemaNodeService,
                            ConnectionService connectionService,
                            ConnectionRepository connectionRepository,
                            SchemaNodeRepository schemaNodeRepository,
                            DeviceRepository deviceRepository,
                            SchemaRepository schemaRepository) {
        this.schemaService = schemaService;
        this.connectionRepository = connectionRepository;
        this.schemaNodeRepository = schemaNodeRepository;
        this.deviceRepository = deviceRepository;
        this.schemaRepository = schemaRepository;
    }
    
    @GetMapping
    public ResponseEntity<List<SchemaSummaryDto>> getAllSchemas() {
        List<Schema> schemas = schemaService.getAllSchemas();
        List<SchemaSummaryDto> result = schemas.stream()
            .map(schema -> {
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
                    .factorsCount((Long) stats.get("factorsCount"))
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
        SchemaFullDto result = schemaService.getSchemaFull(id);
        
        // Логируем первую связь для проверки
        if (result.getConnections() != null && !result.getConnections().isEmpty()) {
            SchemaFullDto.ConnectionDto first = result.getConnections().get(0);
            log.info("First connection in response: id={}, sourceNodeId={}, targetNodeId={}", 
                first.getId(), first.getSourceNodeId(), first.getTargetNodeId());
        }
        
        return ResponseEntity.ok(result);
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
    @Transactional
    public ResponseEntity<Map<String, String>> updateFullSchema(
            @PathVariable String id,
            @RequestBody Map<String, Object> request) {
        
        log.info("Updating full schema: {}", id);
        
        Schema schema = schemaService.getSchemaById(id);
        
        // Удаляем существующие данные
        connectionRepository.deleteBySchemaId(id);
        schemaNodeRepository.deleteBySchemaId(id);
        
        Map<String, String> nodeIdMap = new HashMap<>();
        
        // 1. Сохраняем все узлы
        List<Map<String, Object>> nodes = (List<Map<String, Object>>) request.get("nodes");
        if (nodes != null) {
            for (Map<String, Object> node : nodes) {
                String frontendId = (String) node.get("id");
                String nodeTypeStr = (String) node.get("type");
                SchemaNode.NodeType nodeType = SchemaNode.NodeType.valueOf(nodeTypeStr);
                
                SchemaNode schemaNode = new SchemaNode();
                schemaNode.setSchema(schema);
                schemaNode.setNodeType(nodeType);
                schemaNode.setName((String) node.get("name"));
                schemaNode.setCustomName((String) node.get("customName"));
                
                double posX = node.containsKey("positionX") ? ((Number) node.get("positionX")).doubleValue() : 0.0;
                double posY = node.containsKey("positionY") ? ((Number) node.get("positionY")).doubleValue() : 0.0;
                schemaNode.setPositionX(posX);
                schemaNode.setPositionY(posY);
                
                // Общие поля
                if (node.containsKey("temperatureOffset")) {
                    schemaNode.setTemperatureOffset(((Number) node.get("temperatureOffset")).doubleValue());
                }
                if (node.containsKey("emiOffset")) {
                    schemaNode.setEmiOffset(((Number) node.get("emiOffset")).doubleValue());
                }
                if (node.containsKey("vibrationOffset")) {
                    schemaNode.setVibrationOffset(((Number) node.get("vibrationOffset")).doubleValue());
                }
                if (node.containsKey("dustOffset")) {
                    schemaNode.setDustOffset(((Number) node.get("dustOffset")).doubleValue());
                }
                schemaNode.setIsEnabled(node.containsKey("isEnabled") ? (Boolean) node.get("isEnabled") : true);
                
                // Для DEVICE
                if (nodeType == SchemaNode.NodeType.DEVICE && node.containsKey("deviceId")) {
                    String deviceId = (String) node.get("deviceId");
                    Device device = deviceRepository.findById(deviceId).orElse(null);
                    schemaNode.setDevice(device);
                    schemaNode.setName(device != null ? device.getName() : "Unknown Device");
                }
                
                // Для CABLE
                if (nodeType == SchemaNode.NodeType.CABLE) {
                    if (node.containsKey("lengthM")) {
                        schemaNode.setCableLengthM(((Number) node.get("lengthM")).doubleValue());
                    }
                    if (node.containsKey("cableType")) {
                        schemaNode.setCableType((String) node.get("cableType"));
                    }
                    if (node.containsKey("bandwidthMbps")) {
                        schemaNode.setBandwidthMbps(((Number) node.get("bandwidthMbps")).doubleValue());
                    }
                }
                
                // Для FACTOR
                if (nodeType == SchemaNode.NodeType.FACTOR) {
                    if (node.containsKey("factorType")) {
                        schemaNode.setFactorType((String) node.get("factorType"));
                    }
                    if (node.containsKey("factorValue")) {
                        schemaNode.setFactorValue(((Number) node.get("factorValue")).doubleValue());
                    }
                    if (node.containsKey("factorUnit")) {
                        schemaNode.setFactorUnit((String) node.get("factorUnit"));
                    }
                    if (node.containsKey("factorRadius")) {
                        schemaNode.setFactorRadius(((Number) node.get("factorRadius")).doubleValue());
                    }
                }
                
                // Для SUBSCHEMA
                if (nodeType == SchemaNode.NodeType.SUBSCHEMA && node.containsKey("schemaId")) {
                    String childSchemaId = (String) node.get("schemaId");
                    Schema childSchema = schemaRepository.findById(childSchemaId).orElse(null);
                    schemaNode.setChildSchema(childSchema);
                }
                
                SchemaNode saved = schemaNodeRepository.save(schemaNode);
                nodeIdMap.put(frontendId, saved.getId());
                log.info("Saved {} node: {} -> {}", nodeType, frontendId, saved.getId());
            }
        }
        
        // 2. Сохраняем связи
        List<Map<String, Object>> connections = (List<Map<String, Object>>) request.get("connections");
        if (connections != null) {
            for (Map<String, Object> conn : connections) {
                String frontendSourceId = (String) conn.get("sourceNodeId");
                String frontendTargetId = (String) conn.get("targetNodeId");
                
                String realSourceId = nodeIdMap.get(frontendSourceId);
                String realTargetId = nodeIdMap.get(frontendTargetId);
                
                if (realSourceId == null || realTargetId == null) {
                    log.warn("Could not find real IDs: {} -> {}", frontendSourceId, frontendTargetId);
                    continue;
                }
                
                Connection connection = new Connection();
                connection.setSchema(schema);
                connection.setSourceNode(schemaNodeRepository.findById(realSourceId).orElse(null));
                connection.setTargetNode(schemaNodeRepository.findById(realTargetId).orElse(null));
                connection.setSourcePortId((String) conn.get("sourcePortId"));
                connection.setTargetPortId((String) conn.get("targetPortId"));
                connection.setLengthM(conn.containsKey("lengthM") ? ((Number) conn.get("lengthM")).doubleValue() : 10.0);
                connection.setBandwidthMbps(1000.0);
                
                String connectionType = (String) conn.get("connectionType");
                connection.setConnectionType("FACTOR_ELEMENT".equals(connectionType) 
                    ? Connection.ConnectionType.FACTOR_ELEMENT 
                    : Connection.ConnectionType.CABLE_DEVICE);
                
                if ("FACTOR_ELEMENT".equals(connectionType) && conn.containsKey("factorData")) {
                    Map<String, Object> factorData = (Map<String, Object>) conn.get("factorData");
                    if (factorData.containsKey("distance")) {
                        connection.setDistance(((Number) factorData.get("distance")).doubleValue());
                    }
                    if (factorData.containsKey("factorType")) {
                        connection.setFactorType((String) factorData.get("factorType"));
                    }
                }
                
                connectionRepository.save(connection);
                log.info("Saved connection: {} -> {}", realSourceId, realTargetId);
            }
        }
        
        log.info("Schema saved. Nodes: {}, Connections: {}", nodeIdMap.size(), 
            connections != null ? connections.size() : 0);
        
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
