package com.doppelganger.network_digital_twin.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "schema_nodes")
public class SchemaNode {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schema_id", nullable = false)
    @JsonIgnore
    private Schema schema;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id")
    private Device device;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_schema_id")
    private Schema childSchema;
    
    @Enumerated(EnumType.STRING)
    private NodeType nodeType;
    
    private Double positionX;
    private Double positionY;
    
    private Double temperatureOffset;
    private Double emiOffset;
    private Double vibrationOffset;
    private Double dustOffset;
    
    private String customName;
    private Boolean isEnabled = true;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public enum NodeType {
        DEVICE,
        SUBSCHEMA,
        CABLE
    }
    
    @Column(name = "cable_length_m")
    private Double cableLengthM;

    @Column(name = "cable_type", length = 50)
    private String cableType;

    // Getters and Setters
    public Double getCableLengthM() {
        return cableLengthM;
    }

    public void setCableLengthM(Double cableLengthM) {
        this.cableLengthM = cableLengthM;
    }

    public String getCableType() {
        return cableType;
    }

    public void setCableType(String cableType) {
        this.cableType = cableType;
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (nodeType == null) nodeType = NodeType.DEVICE;
        if (isEnabled == null) isEnabled = true;
        if (temperatureOffset == null) temperatureOffset = 0.0;
        if (emiOffset == null) emiOffset = 0.0;
        if (vibrationOffset == null) vibrationOffset = 0.0;
        if (dustOffset == null) dustOffset = 0.0;
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
    
    public Device getDevice() { return device; }
    public void setDevice(Device device) { this.device = device; }
    
    public Schema getChildSchema() { return childSchema; }
    public void setChildSchema(Schema childSchema) { this.childSchema = childSchema; }
    
    public NodeType getNodeType() { return nodeType; }
    public void setNodeType(NodeType nodeType) { this.nodeType = nodeType; }
    
    public Double getPositionX() { return positionX; }
    public void setPositionX(Double positionX) { this.positionX = positionX; }
    
    public Double getPositionY() { return positionY; }
    public void setPositionY(Double positionY) { this.positionY = positionY; }
    
    public Double getTemperatureOffset() { return temperatureOffset; }
    public void setTemperatureOffset(Double temperatureOffset) { this.temperatureOffset = temperatureOffset; }
    
    public Double getEmiOffset() { return emiOffset; }
    public void setEmiOffset(Double emiOffset) { this.emiOffset = emiOffset; }
    
    public Double getVibrationOffset() { return vibrationOffset; }
    public void setVibrationOffset(Double vibrationOffset) { this.vibrationOffset = vibrationOffset; }
    
    public Double getDustOffset() { return dustOffset; }
    public void setDustOffset(Double dustOffset) { this.dustOffset = dustOffset; }
    
    public String getCustomName() { return customName; }
    public void setCustomName(String customName) { this.customName = customName; }
    
    public Boolean getIsEnabled() { return isEnabled; }
    public void setIsEnabled(Boolean isEnabled) { this.isEnabled = isEnabled; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
