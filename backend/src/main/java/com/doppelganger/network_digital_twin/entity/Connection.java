package com.doppelganger.network_digital_twin.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "connections")
public class Connection {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schema_id", nullable = false)
    @JsonIgnore
    private Schema schema;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_node_id", nullable = false)
    private SchemaNode sourceNode;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_node_id", nullable = false)
    private SchemaNode targetNode;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cable_id")
    private Cable cable;
    
    private Double lengthM;
    private Double bandwidthMbps;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (bandwidthMbps == null && cable != null) {
            bandwidthMbps = 1000.0;
        }
        if (lengthM == null) lengthM = 10.0;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public Schema getSchema() { return schema; }
    public void setSchema(Schema schema) { this.schema = schema; }
    
    public SchemaNode getSourceNode() { return sourceNode; }
    public void setSourceNode(SchemaNode sourceNode) { this.sourceNode = sourceNode; }
    
    public SchemaNode getTargetNode() { return targetNode; }
    public void setTargetNode(SchemaNode targetNode) { this.targetNode = targetNode; }
    
    public Cable getCable() { return cable; }
    public void setCable(Cable cable) { this.cable = cable; }
    
    public Double getLengthM() { return lengthM; }
    public void setLengthM(Double lengthM) { this.lengthM = lengthM; }
    
    public Double getBandwidthMbps() { return bandwidthMbps; }
    public void setBandwidthMbps(Double bandwidthMbps) { this.bandwidthMbps = bandwidthMbps; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
