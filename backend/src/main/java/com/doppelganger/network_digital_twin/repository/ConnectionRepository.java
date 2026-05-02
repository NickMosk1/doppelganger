package com.doppelganger.network_digital_twin.repository;

import com.doppelganger.network_digital_twin.entity.Connection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ConnectionRepository extends JpaRepository<Connection, String> {
    List<Connection> findBySchemaId(String schemaId);
    List<Connection> findBySourceNodeId(String sourceNodeId);
    List<Connection> findByTargetNodeId(String targetNodeId);
}
