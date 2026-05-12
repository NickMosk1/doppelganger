// backend/src/main/java/com/doppelganger/network_digital_twin/repository/FactorNodeRepository.java
package com.doppelganger.network_digital_twin.repository;

import com.doppelganger.network_digital_twin.entity.FactorNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FactorNodeRepository extends JpaRepository<FactorNode, String> {
    List<FactorNode> findBySchemaId(String schemaId);
    List<FactorNode> findByFactorType(String factorType);
    List<FactorNode> findBySchemaIdAndFactorType(String schemaId, String factorType);
}