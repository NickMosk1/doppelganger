package com.doppelganger.network_digital_twin.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "schema_nodes", indexes = {
    @Index(name = "idx_schema_node_schema", columnList = "schema_id"),
    @Index(name = "idx_schema_node_type", columnList = "node_type")
})
public class SchemaNode {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schema_id", nullable = false)
    @JsonIgnore
    private Schema schema;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "node_type", nullable = false)
    private NodeType nodeType;
    
    private String name;
    private String customName;
    
    private Double positionX;
    private Double positionY;
    
    private Boolean isEnabled = true;
    
    // ============ ДЛЯ DEVICE ============
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id")
    private Device device;
    
    // Переопределяемые параметры устройства (могут отличаться от шаблона)
    @Column(name = "override_base_latency_ms")
    private Double overrideBaseLatencyMs;
    
    @Column(name = "override_max_throughput_mbps")
    private Integer overrideMaxThroughputMbps;
    
    // ============ ДЛЯ CABLE ============
    @Column(name = "cable_length_m")
    private Double cableLengthM;
    
    @Column(name = "cable_type", length = 50)
    private String cableType;
    
    @Column(name = "bandwidth_mbps")
    private Double bandwidthMbps;
    
    // ============ ДЛЯ FACTOR ============
    @Column(name = "factor_type", length = 50)
    private String factorType;
    
    @Column(name = "factor_value")
    private Double factorValue;
    
    @Column(name = "factor_unit", length = 20)
    private String factorUnit;
    
    @Column(name = "factor_radius")
    private Double factorRadius;
    
    // Динамические поля для фактора
    @Column(name = "change_rate_per_second")
    private Double changeRatePerSecond;
    
    @Column(name = "min_value")
    private Double minValue;
    
    @Column(name = "max_value")
    private Double maxValue;
    
    @Column(name = "value_change_pattern", length = 20)
    private String valueChangePattern;
    
    @Column(name = "frequency_hz")
    private Double frequencyHz;
    
    @Column(name = "start_time_seconds")
    private Integer startTimeSeconds;
    
    @Column(name = "duration_seconds")
    private Integer durationSeconds;
    
    @Column(name = "falloff_type", length = 20)
    private String falloffType;
    
    @Column(name = "falloff_exponent")
    private Double falloffExponent;
    
    @Column(name = "warning_threshold")
    private Double warningThreshold;
    
    @Column(name = "critical_threshold")
    private Double criticalThreshold;
    
    @Column(name = "failure_threshold")
    private Double failureThreshold;
    
    @Column(name = "priority")
    private Integer priority;
    
    // ============ Промышленные смещения (для всех типов) ============
    private Double temperatureOffset = 0.0;
    private Double emiOffset = 0.0;
    private Double vibrationOffset = 0.0;
    private Double dustOffset = 0.0;
    
    // ============ ВЛОЖЕННЫЕ СХЕМЫ ============
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_schema_id")
    private Schema childSchema;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public enum NodeType {
        DEVICE, CABLE, FACTOR, SUBSCHEMA
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
        if (bandwidthMbps == null) bandwidthMbps = 1000.0;
        if (cableLengthM == null) cableLengthM = 10.0;
        if (cableType == null) cableType = "ETHERNET";
        if (factorRadius == null) factorRadius = 10.0;
        if (factorValue == null) factorValue = 0.0;
        if (changeRatePerSecond == null) changeRatePerSecond = 0.0;
        if (valueChangePattern == null) valueChangePattern = "NONE";
        if (falloffType == null) falloffType = "NONE";
        if (falloffExponent == null) falloffExponent = 2.0;
        if (priority == null) priority = 5;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // ============ GETTERS AND SETTERS ============
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public Schema getSchema() { return schema; }
    public void setSchema(Schema schema) { this.schema = schema; }
    
    public NodeType getNodeType() { return nodeType; }
    public void setNodeType(NodeType nodeType) { this.nodeType = nodeType; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getCustomName() { return customName; }
    public void setCustomName(String customName) { this.customName = customName; }
    
    public Double getPositionX() { return positionX; }
    public void setPositionX(Double positionX) { this.positionX = positionX; }
    
    public Double getPositionY() { return positionY; }
    public void setPositionY(Double positionY) { this.positionY = positionY; }
    
    public Boolean getIsEnabled() { return isEnabled; }
    public void setIsEnabled(Boolean isEnabled) { this.isEnabled = isEnabled; }
    
    public Device getDevice() { return device; }
    public void setDevice(Device device) { this.device = device; }
    
    public Double getOverrideBaseLatencyMs() { return overrideBaseLatencyMs; }
    public void setOverrideBaseLatencyMs(Double overrideBaseLatencyMs) { this.overrideBaseLatencyMs = overrideBaseLatencyMs; }
    
    public Integer getOverrideMaxThroughputMbps() { return overrideMaxThroughputMbps; }
    public void setOverrideMaxThroughputMbps(Integer overrideMaxThroughputMbps) { this.overrideMaxThroughputMbps = overrideMaxThroughputMbps; }
    
    public Double getCableLengthM() { return cableLengthM; }
    public void setCableLengthM(Double cableLengthM) { this.cableLengthM = cableLengthM; }
    
    public String getCableType() { return cableType; }
    public void setCableType(String cableType) { this.cableType = cableType; }
    
    public Double getBandwidthMbps() { return bandwidthMbps; }
    public void setBandwidthMbps(Double bandwidthMbps) { this.bandwidthMbps = bandwidthMbps; }
    
    public String getFactorType() { return factorType; }
    public void setFactorType(String factorType) { this.factorType = factorType; }
    
    public Double getFactorValue() { return factorValue; }
    public void setFactorValue(Double factorValue) { this.factorValue = factorValue; }
    
    public String getFactorUnit() { return factorUnit; }
    public void setFactorUnit(String factorUnit) { this.factorUnit = factorUnit; }
    
    public Double getFactorRadius() { return factorRadius; }
    public void setFactorRadius(Double factorRadius) { this.factorRadius = factorRadius; }
    
    public Double getChangeRatePerSecond() { return changeRatePerSecond; }
    public void setChangeRatePerSecond(Double changeRatePerSecond) { this.changeRatePerSecond = changeRatePerSecond; }
    
    public Double getMinValue() { return minValue; }
    public void setMinValue(Double minValue) { this.minValue = minValue; }
    
    public Double getMaxValue() { return maxValue; }
    public void setMaxValue(Double maxValue) { this.maxValue = maxValue; }
    
    public String getValueChangePattern() { return valueChangePattern; }
    public void setValueChangePattern(String valueChangePattern) { this.valueChangePattern = valueChangePattern; }
    
    public Double getFrequencyHz() { return frequencyHz; }
    public void setFrequencyHz(Double frequencyHz) { this.frequencyHz = frequencyHz; }
    
    public Integer getStartTimeSeconds() { return startTimeSeconds; }
    public void setStartTimeSeconds(Integer startTimeSeconds) { this.startTimeSeconds = startTimeSeconds; }
    
    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }
    
    public String getFalloffType() { return falloffType; }
    public void setFalloffType(String falloffType) { this.falloffType = falloffType; }
    
    public Double getFalloffExponent() { return falloffExponent; }
    public void setFalloffExponent(Double falloffExponent) { this.falloffExponent = falloffExponent; }
    
    public Double getWarningThreshold() { return warningThreshold; }
    public void setWarningThreshold(Double warningThreshold) { this.warningThreshold = warningThreshold; }
    
    public Double getCriticalThreshold() { return criticalThreshold; }
    public void setCriticalThreshold(Double criticalThreshold) { this.criticalThreshold = criticalThreshold; }
    
    public Double getFailureThreshold() { return failureThreshold; }
    public void setFailureThreshold(Double failureThreshold) { this.failureThreshold = failureThreshold; }
    
    public Integer getPriority() { return priority; }
    public void setPriority(Integer priority) { this.priority = priority; }
    
    public Double getTemperatureOffset() { return temperatureOffset; }
    public void setTemperatureOffset(Double temperatureOffset) { this.temperatureOffset = temperatureOffset; }
    
    public Double getEmiOffset() { return emiOffset; }
    public void setEmiOffset(Double emiOffset) { this.emiOffset = emiOffset; }
    
    public Double getVibrationOffset() { return vibrationOffset; }
    public void setVibrationOffset(Double vibrationOffset) { this.vibrationOffset = vibrationOffset; }
    
    public Double getDustOffset() { return dustOffset; }
    public void setDustOffset(Double dustOffset) { this.dustOffset = dustOffset; }
    
    public Schema getChildSchema() { return childSchema; }
    public void setChildSchema(Schema childSchema) { this.childSchema = childSchema; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
