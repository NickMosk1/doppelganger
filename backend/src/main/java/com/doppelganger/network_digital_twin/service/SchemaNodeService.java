package com.doppelganger.network_digital_twin.service;

import com.doppelganger.network_digital_twin.entity.Schema;
import com.doppelganger.network_digital_twin.entity.SchemaNode;
import com.doppelganger.network_digital_twin.entity.Device;
import com.doppelganger.network_digital_twin.exception.ResourceNotFoundException;
import com.doppelganger.network_digital_twin.repository.SchemaNodeRepository;
import com.doppelganger.network_digital_twin.repository.SchemaRepository;
import com.doppelganger.network_digital_twin.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SchemaNodeService {
    
    private final SchemaNodeRepository schemaNodeRepository;
    private final SchemaRepository schemaRepository;
    private final DeviceRepository deviceRepository;
    
    // Получить все узлы схемы
    public List<SchemaNode> getNodesBySchemaId(String schemaId) {
        log.debug("Fetching nodes for schema: {}", schemaId);
        return schemaNodeRepository.findBySchemaId(schemaId);
    }
    
    // Получить узел по ID
    public SchemaNode getNodeById(String id) {
        log.debug("Fetching node with id: {}", id);
        return schemaNodeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("SchemaNode not found with id: " + id));
    }
    
    // Получить все узлы с определенным устройством
    public List<SchemaNode> getNodesByDeviceId(String deviceId) {
        log.debug("Fetching nodes by device: {}", deviceId);
        return schemaNodeRepository.findByDeviceId(deviceId);
    }
    
    // Добавить под-схему как узел (вложенность)
    @Transactional
    public SchemaNode addSubSchemaToSchema(String parentSchemaId, String childSchemaId,
                                            Double positionX, Double positionY,
                                            String customName) {
        log.info("Adding subschema {} to schema {}", childSchemaId, parentSchemaId);
        
        Schema parentSchema = schemaRepository.findById(parentSchemaId)
            .orElseThrow(() -> new ResourceNotFoundException("Parent schema not found: " + parentSchemaId));
        
        Schema childSchema = schemaRepository.findById(childSchemaId)
            .orElseThrow(() -> new ResourceNotFoundException("Child schema not found: " + childSchemaId));
        
        SchemaNode node = new SchemaNode();
        node.setSchema(parentSchema);
        node.setChildSchema(childSchema);
        node.setNodeType(SchemaNode.NodeType.SUBSCHEMA);
        node.setPositionX(positionX != null ? positionX : 0.0);
        node.setPositionY(positionY != null ? positionY : 0.0);
        node.setCustomName(customName);
        node.setIsEnabled(true);
        
        return schemaNodeRepository.save(node);
    }
    
    // Обновить позицию узла
    @Transactional
    public SchemaNode updateNodePosition(String nodeId, Double positionX, Double positionY) {
        log.info("Updating node position: {} -> ({}, {})", nodeId, positionX, positionY);
        
        SchemaNode node = getNodeById(nodeId);
        node.setPositionX(positionX);
        node.setPositionY(positionY);
        
        return schemaNodeRepository.save(node);
    }
    
    // Обновить кастомное имя узла
    @Transactional
    public SchemaNode updateNodeCustomName(String nodeId, String customName) {
        log.info("Updating node custom name: {} -> {}", nodeId, customName);
        
        SchemaNode node = getNodeById(nodeId);
        node.setCustomName(customName);
        
        return schemaNodeRepository.save(node);
    }
    
    // Обновить коэффициенты узла (переопределение)
    @Transactional
    public SchemaNode updateNodeCoefficients(String nodeId, 
                                              Double temperatureOffset,
                                              Double emiOffset,
                                              Double vibrationOffset,
                                              Double dustOffset) {
        log.info("Updating node coefficients: {}", nodeId);
        
        SchemaNode node = getNodeById(nodeId);
        
        if (temperatureOffset != null) node.setTemperatureOffset(temperatureOffset);
        if (emiOffset != null) node.setEmiOffset(emiOffset);
        if (vibrationOffset != null) node.setVibrationOffset(vibrationOffset);
        if (dustOffset != null) node.setDustOffset(dustOffset);
        
        return schemaNodeRepository.save(node);
    }
    
    // Включить/выключить узел
    @Transactional
    public SchemaNode toggleNodeEnabled(String nodeId, Boolean isEnabled) {
        log.info("Toggling node enabled: {} -> {}", nodeId, isEnabled);
        
        SchemaNode node = getNodeById(nodeId);
        node.setIsEnabled(isEnabled);
        
        return schemaNodeRepository.save(node);
    }
    
    // Удалить узел со схемы
    @Transactional
    public void deleteNode(String nodeId) {
        log.info("Deleting node: {}", nodeId);
        SchemaNode node = getNodeById(nodeId);
        schemaNodeRepository.delete(node);
    }
    
    // Удалить все узлы схемы
    @Transactional
    public void deleteAllNodesBySchemaId(String schemaId) {
        log.info("Deleting all nodes for schema: {}", schemaId);
        List<SchemaNode> nodes = schemaNodeRepository.findBySchemaId(schemaId);
        schemaNodeRepository.deleteAll(nodes);
    }
    
    // Получить количество устройств на схеме
    public Long countDevicesOnSchema(String schemaId) {
        log.debug("Counting devices on schema: {}", schemaId);
        List<SchemaNode> nodes = schemaNodeRepository.findBySchemaId(schemaId);
        return nodes.stream()
            .filter(n -> n.getNodeType() == SchemaNode.NodeType.DEVICE)
            .count();
    }

    @Transactional
    public SchemaNode addDeviceToSchema(String schemaId, String deviceId, 
                                        Double posX, Double posY, String customName) {
        log.info("Adding device to schema: schemaId={}, deviceId={}", schemaId, deviceId);
        
        Schema schema = schemaRepository.findById(schemaId)
            .orElseThrow(() -> new ResourceNotFoundException("Schema not found: " + schemaId));
        
        Device device = deviceRepository.findById(deviceId)
            .orElseThrow(() -> new ResourceNotFoundException("Device not found: " + deviceId));
        
        SchemaNode node = new SchemaNode();
        node.setSchema(schema);
        node.setDevice(device);
        node.setNodeType(SchemaNode.NodeType.DEVICE);
        node.setCustomName(customName != null ? customName : device.getName());
        node.setPositionX(posX != null ? posX : 0.0);
        node.setPositionY(posY != null ? posY : 0.0);
        node.setIsEnabled(true);
        
        SchemaNode saved = schemaNodeRepository.save(node);
        log.info("Device saved with id: {}", saved.getId());
        
        return saved;
    }

    @Transactional
    public SchemaNode addCableToSchema(String schemaId, String name, String customName, 
                                        Double posX, Double posY, Double lengthM, String cableType) {
        log.info("Adding cable to schema: schemaId={}, name={}", schemaId, name);
        
        Schema schema = schemaRepository.findById(schemaId)
            .orElseThrow(() -> new ResourceNotFoundException("Schema not found: " + schemaId));
        
        SchemaNode node = new SchemaNode();
        node.setSchema(schema);
        node.setNodeType(SchemaNode.NodeType.CABLE);
        node.setCustomName(customName != null ? customName : name);
        node.setPositionX(posX != null ? posX : 0.0);
        node.setPositionY(posY != null ? posY : 0.0);
        node.setCableLengthM(lengthM != null ? lengthM : 10.0);
        node.setCableType(cableType != null ? cableType : "ETHERNET");
        node.setIsEnabled(true);
        
        SchemaNode saved = schemaNodeRepository.save(node);
        log.info("Cable saved with id: {}", saved.getId());
        
        return saved;
    }
}
