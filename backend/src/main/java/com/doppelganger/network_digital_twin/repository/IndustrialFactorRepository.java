package com.doppelganger.network_digital_twin.repository;

import com.doppelganger.network_digital_twin.entity.IndustrialFactor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface IndustrialFactorRepository extends JpaRepository<IndustrialFactor, String> {
    Optional<IndustrialFactor> findByName(String name);
    List<IndustrialFactor> findByType(String type);
    List<IndustrialFactor> findByTypeIn(List<String> types);
}
