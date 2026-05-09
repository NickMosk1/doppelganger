package com.doppelganger.network_digital_twin.service;

import com.doppelganger.network_digital_twin.entity.Connection;
import com.doppelganger.network_digital_twin.entity.Schema;
import com.doppelganger.network_digital_twin.entity.SchemaNode;
import com.doppelganger.network_digital_twin.exception.ResourceNotFoundException;
import com.doppelganger.network_digital_twin.repository.ConnectionRepository;
import com.doppelganger.network_digital_twin.repository.SchemaRepository;
import com.doppelganger.network_digital_twin.repository.SchemaNodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ConnectionService {
    
    private final ConnectionRepository connectionRepository;
    private final SchemaRepository schemaRepository;
    private final SchemaNodeRepository schemaNodeRepository;
    
    public List<Connection> getConnectionsBySchemaId(String schemaId) {
        log.debug("Fetching connections for schema: {}", schemaId);
        return connectionRepository.findBySchemaId(schemaId);
    }
    
    public Connection getConnectionById(String id) {
        log.debug("Fetching connection with id: {}", id);
        return connectionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Connection not found: " + id));
    }
    
    @Transactional
    public Connection createConnection(String schemaId, String sourceNodeId, 
                                        String targetNodeId, Double lengthM) {
        log.info("Creating connection from {} to {}", sourceNodeId, targetNodeId);
        
        Schema schema = schemaRepository.findById(schemaId)
            .orElseThrow(() -> new ResourceNotFoundException("Schema not found: " + schemaId));
        
        SchemaNode sourceNode = schemaNodeRepository.findById(sourceNodeId)
            .orElseThrow(() -> new ResourceNotFoundException("Source node not found: " + sourceNodeId));
        
        SchemaNode targetNode = schemaNodeRepository.findById(targetNodeId)
            .orElseThrow(() -> new ResourceNotFoundException("Target node not found: " + targetNodeId));
        
        Connection connection = new Connection();
        connection.setSchema(schema);
        connection.setSourceNode(sourceNode);
        connection.setTargetNode(targetNode);
        connection.setLengthM(lengthM != null ? lengthM : 10.0);
        
        return connectionRepository.save(connection);
    }
    
    @Transactional
    public Connection updateConnection(String id, Double lengthM) {
        log.info("Updating connection: {}", id);
        Connection connection = getConnectionById(id);
        if (lengthM != null) connection.setLengthM(lengthM);
        return connectionRepository.save(connection);
    }
    
    @Transactional
    public void deleteConnection(String id) {
        log.info("Deleting connection: {}", id);
        if (!connectionRepository.existsById(id)) {
            log.warn("Connection not found with id: {}", id);
            return;
        }
        connectionRepository.deleteById(id);
    }
    
    @Transactional
    public void deleteAllConnectionsBySchemaId(String schemaId) {
        log.info("Deleting all connections for schema: {}", schemaId);
        List<Connection> connections = connectionRepository.findBySchemaId(schemaId);
        connectionRepository.deleteAll(connections);
    }
}