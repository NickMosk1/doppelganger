package com.doppelganger.network_digital_twin.service;

import com.doppelganger.network_digital_twin.dto.SchemaFullDto;
import com.doppelganger.network_digital_twin.entity.*;
import com.doppelganger.network_digital_twin.exception.ResourceNotFoundException;
import com.doppelganger.network_digital_twin.repository.SchemaRepository;
import com.doppelganger.network_digital_twin.repository.SchemaNodeRepository;
import com.doppelganger.network_digital_twin.repository.ConnectionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class SchemaService {
    
    private static final Logger log = LoggerFactory.getLogger(SchemaService.class);
    
    private final SchemaRepository schemaRepository;
    private final SchemaNodeRepository schemaNodeRepository;
    private final ConnectionRepository connectionRepository;
    
    public SchemaService(SchemaRepository schemaRepository,
                         SchemaNodeRepository schemaNodeRepository,
                         ConnectionRepository connectionRepository) {
        this.schemaRepository = schemaRepository;
        this.schemaNodeRepository = schemaNodeRepository;
        this.connectionRepository = connectionRepository;
    }
    
    // ============ QUERIES ============

    public List<Schema> getPublicSchemas() {
        log.debug("Fetching public schemas");
        return schemaRepository.findByIsPublicTrue();
    }
    
    public List<Schema> getAllSchemas() {
        log.debug("Fetching all schemas");
        return schemaRepository.findAll();
    }
    
    public List<Schema> getRootSchemas() {
        log.debug("Fetching root schemas");
        return schemaRepository.findByParentSchemaIsNull();
    }
    
    public Schema getSchemaById(String id) {
        log.debug("Fetching schema with id: {}", id);
        return schemaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Schema not found with id: " + id));
    }
    
    public List<Schema> getChildSchemas(String parentId) {
        log.debug("Fetching child schemas for parent: {}", parentId);
        return schemaRepository.findByParentSchemaId(parentId);
    }
    
    public List<Schema> searchSchemasByName(String name) {
        log.debug("Searching schemas by name: {}", name);
        return schemaRepository.findByNameContainingIgnoreCase(name);
    }
    
    public Map<String, Object> getSchemaStats(String id) {
        log.debug("Getting stats for schema: {}", id);
        Long nodesCount = (long) schemaNodeRepository.findBySchemaId(id).size();
        Long connectionsCount = (long) connectionRepository.findBySchemaId(id).size();
        Integer depth = getSchemaById(id).getDepth();
        
        return Map.of(
            "nodesCount", nodesCount,
            "connectionsCount", connectionsCount,
            "depth", depth
        );
    }
    
    public SchemaFullDto getSchemaFull(String id) {
        log.debug("Fetching full schema: {}", id);
        Schema schema = getSchemaById(id);
        return buildFullDto(schema);
    }
    
    // ============ CREATE ============
    
    @Transactional
    public Schema createSchema(String name, String description) {
        log.info("Creating new schema: {}", name);
        
        Schema schema = new Schema();
        schema.setName(name);
        schema.setDescription(description);
        schema.setDepth(0);
        schema.setPath("/" + name);
        schema.setTemperatureOffset(0.0);
        schema.setEmiOffset(0.0);
        schema.setVibrationOffset(0.0);
        schema.setDustOffset(0.0);
        schema.setIsPublic(false);
        schema.setUsageCount(0);
        
        return schemaRepository.save(schema);
    }
    
    @Transactional
    public Schema createChildSchema(String parentId, String name, String description) {
        log.info("Creating child schema: {} under parent: {}", name, parentId);
        
        Schema parent = getSchemaById(parentId);
        Schema child = new Schema();
        child.setName(name);
        child.setDescription(description);
        child.setParentSchema(parent);
        child.setDepth(parent.getDepth() + 1);
        child.setPath(parent.getFullPath() + "/" + name);
        child.setTemperatureOffset(parent.getTemperatureOffset());
        child.setEmiOffset(parent.getEmiOffset());
        child.setVibrationOffset(parent.getVibrationOffset());
        child.setDustOffset(parent.getDustOffset());
        child.setIsPublic(false);
        child.setUsageCount(0);
        
        return schemaRepository.save(child);
    }
    
    // ============ UPDATE ============
    
    @Transactional
    public Schema updateSchema(String id, String name, String description, 
                                Double temperatureOffset, Double emiOffset,
                                Double vibrationOffset, Double dustOffset) {
        log.info("Updating schema with id: {}", id);
        
        Schema schema = getSchemaById(id);
        
        if (name != null) schema.setName(name);
        if (description != null) schema.setDescription(description);
        if (temperatureOffset != null) schema.setTemperatureOffset(temperatureOffset);
        if (emiOffset != null) schema.setEmiOffset(emiOffset);
        if (vibrationOffset != null) schema.setVibrationOffset(vibrationOffset);
        if (dustOffset != null) schema.setDustOffset(dustOffset);
        
        return schemaRepository.save(schema);
    }
    
    // ============ DELETE ============
    
    @Transactional
    public void deleteSchema(String id) {
        log.info("Deleting schema with id: {}", id);
        Schema schema = getSchemaById(id);
        schemaRepository.delete(schema);
    }
    
    // ============ UTILS ============
    
    private SchemaFullDto buildFullDto(Schema schema) {
        List<SchemaNode> nodes = schemaNodeRepository.findBySchemaId(schema.getId());
        List<Connection> connections = connectionRepository.findBySchemaId(schema.getId());
        
        List<SchemaFullDto.NodeDto> nodeDtos = nodes.stream()
            .filter(node -> node.getNodeType() == SchemaNode.NodeType.DEVICE)
            .map(node -> {
                Device device = node.getDevice();
                return SchemaFullDto.NodeDto.builder()
                    .id(node.getId())
                    .customName(node.getCustomName() != null ? node.getCustomName() : device.getName())
                    .nodeType(node.getNodeType().toString())
                    .positionX(node.getPositionX())
                    .positionY(node.getPositionY())
                    .device(SchemaFullDto.NodeDto.DeviceDto.builder()
                        .id(device.getId())
                        .name(device.getName())
                        .type(device.getType().toString())
                        .manufacturer(device.getManufacturer())
                        .baseLatencyMs(device.getBaseLatencyMs())
                        .maxThroughputMbps(device.getMaxThroughputMbps())
                        .build())
                    .build();
            })
            .collect(Collectors.toList());
        
        List<SchemaFullDto.ConnectionDto> connectionDtos = connections.stream()
            .map(conn -> {
                SchemaNode source = conn.getSourceNode();
                SchemaNode target = conn.getTargetNode();
                Cable cable = conn.getCable();
                
                String sourceName = source.getCustomName() != null ? 
                    source.getCustomName() : source.getDevice().getName();
                String targetName = target.getCustomName() != null ? 
                    target.getCustomName() : target.getDevice().getName();
                
                return SchemaFullDto.ConnectionDto.builder()
                    .id(conn.getId())
                    .lengthM(conn.getLengthM())
                    .bandwidthMbps(conn.getBandwidthMbps())
                    .sourceNode(SchemaFullDto.ConnectionDto.NodeRefDto.builder()
                        .id(source.getId())
                        .customName(sourceName)
                        .build())
                    .targetNode(SchemaFullDto.ConnectionDto.NodeRefDto.builder()
                        .id(target.getId())
                        .customName(targetName)
                        .build())
                    .cable(SchemaFullDto.ConnectionDto.CableDto.builder()
                        .id(cable.getId())
                        .name(cable.getName())
                        .type(cable.getType().toString())
                        .maxLengthM(cable.getMaxLengthM())
                        .attenuationDbPerKm(cable.getAttenuationDbPerKm())
                        .build())
                    .build();
            })
            .collect(Collectors.toList());
        
        return SchemaFullDto.builder()
            .id(schema.getId())
            .name(schema.getName())
            .description(schema.getDescription())
            .depth(schema.getDepth())
            .path(schema.getPath())
            .nodes(nodeDtos)
            .connections(connectionDtos)
            .build();
    }
}
