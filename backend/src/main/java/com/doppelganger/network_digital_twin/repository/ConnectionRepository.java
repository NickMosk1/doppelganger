package com.doppelganger.network_digital_twin.repository;

import com.doppelganger.network_digital_twin.entity.Connection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ConnectionRepository extends JpaRepository<Connection, String> {
    List<Connection> findBySchemaId(String schemaId);
    List<Connection> findBySourceNodeId(String sourceNodeId);
    List<Connection> findByTargetNodeId(String targetNodeId);

    @Modifying
    @Query("DELETE FROM Connection c WHERE c.schema.id = :schemaId")
    void deleteBySchemaId(@Param("schemaId") String schemaId);
}
