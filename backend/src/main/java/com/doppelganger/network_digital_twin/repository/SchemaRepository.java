package com.doppelganger.network_digital_twin.repository;

import com.doppelganger.network_digital_twin.entity.Schema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SchemaRepository extends JpaRepository<Schema, String> {
    
    // Поиск по имени (частичное совпадение)
    List<Schema> findByNameContainingIgnoreCase(String name);
    
    // Поиск корневых схем (без родителей)
    List<Schema> findByParentSchemaIsNull();
    
    // Поиск дочерних схем по родителю
    List<Schema> findByParentSchemaId(String parentId);
    
    // Поиск схемы с полным графом (все узлы и связи)
    @Query("SELECT s FROM Schema s LEFT JOIN FETCH s.nodes LEFT JOIN FETCH s.connections WHERE s.id = :id")
    Optional<Schema> findByIdWithNodesAndConnections(@Param("id") String id);
    
    // Поиск схемы со всеми дочерними (для рекурсивного отображения)
    @Query("SELECT s FROM Schema s LEFT JOIN FETCH s.childrenSchemas WHERE s.id = :id")
    Optional<Schema> findByIdWithChildren(@Param("id") String id);
    
    // Поиск по пути (точное совпадение)
    Optional<Schema> findByPath(String path);
    
    // Поиск схем с глубиной больше указанной
    List<Schema> findByDepthGreaterThanEqual(Integer minDepth);
    
    // Подсчет всех узлов в схеме (включая дочерние)
    @Query("SELECT COUNT(n) FROM SchemaNode n WHERE n.schema.id = :schemaId")
    Long countNodesInSchema(@Param("schemaId") String schemaId);
    
    // Подсчет связей в схеме
    @Query("SELECT COUNT(c) FROM Connection c WHERE c.schema.id = :schemaId")
    Long countConnectionsInSchema(@Param("schemaId") String schemaId);
    
    // Поиск по имени родителя
    @Query("SELECT s FROM Schema s WHERE s.parentSchema.name = :parentName")
    List<Schema> findByParentSchemaName(@Param("parentName") String parentName);
}
