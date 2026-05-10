// backend/src/main/java/com/doppelganger/network_digital_twin/entity/Connection.java
package com.doppelganger.network_digital_twin.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "connections")
public class Connection {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
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
    
    @Column(name = "source_port_id")
    private String sourcePortId;
    
    @Column(name = "target_port_id")
    private String targetPortId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cable_id")
    private Cable cable;
    
    private Double lengthM;
    private Double bandwidthMbps;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (bandwidthMbps == null) {
            bandwidthMbps = 1000.0;
        }
        if (lengthM == null) {
            lengthM = 10.0;
        }
        if (sourcePortId == null) {
            sourcePortId = "";
        }
        if (targetPortId == null) {
            targetPortId = "";
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public Schema getSchema() {
        return schema;
    }
    
    public void setSchema(Schema schema) {
        this.schema = schema;
    }
    
    public SchemaNode getSourceNode() {
        return sourceNode;
    }
    
    public void setSourceNode(SchemaNode sourceNode) {
        this.sourceNode = sourceNode;
    }
    
    public SchemaNode getTargetNode() {
        return targetNode;
    }
    
    public void setTargetNode(SchemaNode targetNode) {
        this.targetNode = targetNode;
    }
    
    public String getSourcePortId() {
        return sourcePortId;
    }
    
    public void setSourcePortId(String sourcePortId) {
        this.sourcePortId = sourcePortId;
    }
    
    public String getTargetPortId() {
        return targetPortId;
    }
    
    public void setTargetPortId(String targetPortId) {
        this.targetPortId = targetPortId;
    }
    
    public Cable getCable() {
        return cable;
    }
    
    public void setCable(Cable cable) {
        this.cable = cable;
    }
    
    public Double getLengthM() {
        return lengthM;
    }
    
    public void setLengthM(Double lengthM) {
        this.lengthM = lengthM;
    }
    
    public Double getBandwidthMbps() {
        return bandwidthMbps;
    }
    
    public void setBandwidthMbps(Double bandwidthMbps) {
        this.bandwidthMbps = bandwidthMbps;
    }
}
