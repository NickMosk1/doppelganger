package com.doppelganger.network_digital_twin.repository;

import com.doppelganger.network_digital_twin.entity.Schema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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
    
    // Поиск схемы с полным графом
    @Query("SELECT s FROM Schema s LEFT JOIN FETCH s.nodes LEFT JOIN FETCH s.connections WHERE s.id = :id")
    Optional<Schema> findByIdWithNodesAndConnections(@Param("id") String id);
    
    // Поиск схемы со всеми дочерними
    @Query("SELECT s FROM Schema s LEFT JOIN FETCH s.childrenSchemas WHERE s.id = :id")
    Optional<Schema> findByIdWithChildren(@Param("id") String id);
    
    // Поиск по пути
    Optional<Schema> findByPath(String path);
    
    // Поиск схем с глубиной больше указанной
    List<Schema> findByDepthGreaterThanEqual(Integer minDepth);
    
    // Подсчет узлов в схеме
    @Query("SELECT COUNT(n) FROM SchemaNode n WHERE n.schema.id = :schemaId")
    Long countNodesInSchema(@Param("schemaId") String schemaId);
    
    // Подсчет связей в схеме
    @Query("SELECT COUNT(c) FROM Connection c WHERE c.schema.id = :schemaId")
    Long countConnectionsInSchema(@Param("schemaId") String schemaId);
    
    // Поиск по имени родителя
    @Query("SELECT s FROM Schema s WHERE s.parentSchema.name = :parentName")
    List<Schema> findByParentSchemaName(@Param("parentName") String parentName);
    
    // ============ НОВЫЕ МЕТОДЫ ДЛЯ АУТЕНТИФИКАЦИИ ============
    
    // Найти публичные схемы
    List<Schema> findByIsPublicTrue();
    
    // Найти схемы пользователя
    List<Schema> findByUserId(String userId);
    
    // Найти корневые схемы пользователя (без родителя)
    List<Schema> findByUserIdAndParentSchemaIsNull(String userId);
    
    // Найти публичные схемы, не принадлежащие пользователю
    @Query("SELECT s FROM Schema s WHERE s.isPublic = true AND s.user.id != :userId")
    List<Schema> findPublicSchemasExcludingUser(@Param("userId") String userId);
    
    // Поиск по имени в публичных схемах
    List<Schema> findByNameContainingIgnoreCaseAndIsPublicTrue(String name);
    
    // Инкремент usage_count
    @Modifying
    @Query("UPDATE Schema s SET s.usageCount = s.usageCount + 1 WHERE s.id = :schemaId")
    void incrementUsageCount(@Param("schemaId") String schemaId);
}
