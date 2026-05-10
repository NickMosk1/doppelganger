package com.doppelganger.network_digital_twin.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "schemas", indexes = {
    @Index(name = "idx_schema_user", columnList = "user_id"),
    @Index(name = "idx_schema_parent", columnList = "parent_schema_id"),
    @Index(name = "idx_schema_public", columnList = "is_public")
})
public class Schema {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(length = 500)
    private String description;
    
    // Владелец схемы (обязательно)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    // Публичная ли схема (можно использовать другим пользователям)
    private Boolean isPublic = false;
    
    // Количество использований в чужих схемах
    private Integer usageCount = 0;
    
    // Родительская схема (может принадлежать другому пользователю)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_schema_id")
    private Schema parentSchema;
    
    @OneToMany(mappedBy = "parentSchema", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Schema> childrenSchemas = new ArrayList<>();

    @OneToMany(mappedBy = "schema", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<SchemaNode> nodes = new ArrayList<>();

    @OneToMany(mappedBy = "schema", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Connection> connections = new ArrayList<>();
    
    private String path;
    private Integer depth = 0;
    
    private Double temperatureOffset = 0.0;
    private Double emiOffset = 0.0;
    private Double vibrationOffset = 0.0;
    private Double dustOffset = 0.0;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (depth == null) depth = 0;
        if (path == null && name != null) path = "/" + name;
        if (isPublic == null) isPublic = false;
        if (usageCount == null) usageCount = 0;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    private LocalDateTime lastOpenedAt;

    // Добавьте геттер и сеттер
    public LocalDateTime getLastOpenedAt() {
        return lastOpenedAt;
    }

    public void setLastOpenedAt(LocalDateTime lastOpenedAt) {
        this.lastOpenedAt = lastOpenedAt;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public Boolean getIsPublic() { return isPublic; }
    public void setIsPublic(Boolean isPublic) { this.isPublic = isPublic; }
    
    public Integer getUsageCount() { return usageCount; }
    public void setUsageCount(Integer usageCount) { this.usageCount = usageCount; }
    
    public Schema getParentSchema() { return parentSchema; }
    public void setParentSchema(Schema parentSchema) { this.parentSchema = parentSchema; }
    
    public List<Schema> getChildrenSchemas() { return childrenSchemas; }
    public void setChildrenSchemas(List<Schema> childrenSchemas) { this.childrenSchemas = childrenSchemas; }
    
    public List<SchemaNode> getNodes() { return nodes; }
    public void setNodes(List<SchemaNode> nodes) { this.nodes = nodes; }
    
    public List<Connection> getConnections() { return connections; }
    public void setConnections(List<Connection> connections) { this.connections = connections; }
    
    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
    
    public Integer getDepth() { return depth; }
    public void setDepth(Integer depth) { this.depth = depth; }
    
    public Double getTemperatureOffset() { return temperatureOffset; }
    public void setTemperatureOffset(Double temperatureOffset) { this.temperatureOffset = temperatureOffset; }
    
    public Double getEmiOffset() { return emiOffset; }
    public void setEmiOffset(Double emiOffset) { this.emiOffset = emiOffset; }
    
    public Double getVibrationOffset() { return vibrationOffset; }
    public void setVibrationOffset(Double vibrationOffset) { this.vibrationOffset = vibrationOffset; }
    
    public Double getDustOffset() { return dustOffset; }
    public void setDustOffset(Double dustOffset) { this.dustOffset = dustOffset; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public String getFullPath() {
        return path != null ? path : "/" + name;
    }
}
