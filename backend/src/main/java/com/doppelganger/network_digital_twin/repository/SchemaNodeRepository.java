package com.doppelganger.network_digital_twin.repository;

import com.doppelganger.network_digital_twin.entity.SchemaNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SchemaNodeRepository extends JpaRepository<SchemaNode, String> {
    List<SchemaNode> findBySchemaId(String schemaId);
    List<SchemaNode> findByDeviceId(String deviceId);
    List<SchemaNode> findBySchemaIdAndNodeType(String schemaId, SchemaNode.NodeType nodeType);
    @Modifying
    @Query("DELETE FROM SchemaNode n WHERE n.schema.id = :schemaId")
    void deleteBySchemaId(@Param("schemaId") String schemaId);
}
