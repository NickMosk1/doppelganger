package com.doppelganger.network_digital_twin.repository;

import com.doppelganger.network_digital_twin.entity.FactorNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FactorNodeRepository extends JpaRepository<FactorNode, String> {
    
    List<FactorNode> findBySchemaId(String schemaId);
    
    List<FactorNode> findByFactorType(String factorType);
    
    List<FactorNode> findBySchemaIdAndFactorType(String schemaId, String factorType);
    
    // ============ НОВЫЕ МЕТОДЫ ============
    
    // Поиск активных факторов
    List<FactorNode> findByIsActiveTrue();
    
    // Поиск факторов с динамическим изменением
    List<FactorNode> findByValueChangePatternNot(String pattern);
    
    // Поиск факторов с высоким приоритетом
    List<FactorNode> findByPriorityGreaterThanEqual(Integer minPriority);
    
    // Поиск факторов по схеме с сортировкой по приоритету
    List<FactorNode> findBySchemaIdOrderByPriorityDesc(String schemaId);
    
    // Кастомный запрос: факторы, влияющие в заданный момент времени
    @Query("SELECT f FROM FactorNode f WHERE f.isActive = true AND " +
           "(f.startTimeSeconds IS NULL OR f.startTimeSeconds <= :timeSeconds) AND " +
           "(f.durationSeconds IS NULL OR f.startTimeSeconds + f.durationSeconds >= :timeSeconds)")
    List<FactorNode> findActiveFactorsAtTime(@Param("timeSeconds") Integer timeSeconds);
    
    // Поиск факторов с порогами
    List<FactorNode> findByWarningThresholdIsNotNull();
    
    List<FactorNode> findByCriticalThresholdIsNotNull();
    
    List<FactorNode> findByFailureThresholdIsNotNull();
}