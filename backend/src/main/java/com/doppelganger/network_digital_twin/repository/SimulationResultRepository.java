package com.doppelganger.network_digital_twin.repository;

import com.doppelganger.network_digital_twin.entity.SimulationResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SimulationResultRepository extends JpaRepository<SimulationResult, String> {
    List<SimulationResult> findBySchemaIdOrderByCreatedAtDesc(String schemaId);
}
