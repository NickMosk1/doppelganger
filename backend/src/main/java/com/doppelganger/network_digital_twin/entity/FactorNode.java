package com.doppelganger.network_digital_twin.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "factor_nodes", indexes = {
    @Index(name = "idx_factor_schema", columnList = "schema_id"),
    @Index(name = "idx_factor_type", columnList = "factor_type"),
    @Index(name = "idx_factor_priority", columnList = "priority")
})
public class FactorNode {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(name = "custom_name")
    private String customName;
    
    @Column(name = "factor_type", nullable = false)
    private String factorType; // TEMPERATURE, EMI, VIBRATION, DUST
    
    @Column(name = "factor_value")
    private Double factorValue;
    
    @Column(name = "factor_unit")
    private String factorUnit;
    
    @Column(name = "factor_radius")
    private Double factorRadius; // радиус влияния в метрах
    
    // ============ ДИНАМИКА ИЗМЕНЕНИЯ ============
    
    @Column(name = "change_rate_per_second")
    private Double changeRatePerSecond; // скорость изменения (ед./сек)
    
    @Column(name = "min_value")
    private Double minValue; // минимальное значение
    
    @Column(name = "max_value")
    private Double maxValue; // максимальное значение
    
    @Column(name = "value_change_pattern")
    private String valueChangePattern; // LINEAR, SINE, STEP, RANDOM, NONE
    
    @Column(name = "frequency_hz")
    private Double frequencyHz; // частота (для SINE паттерна, для VIBRATION)
    
    // ============ ВРЕМЕННЫЕ ХАРАКТЕРИСТИКИ ============
    
    @Column(name = "start_time_seconds")
    private Integer startTimeSeconds; // время начала действия (сек от старта)
    
    @Column(name = "duration_seconds")
    private Integer durationSeconds; // длительность действия (сек, null = постоянно)
    
    // ============ ПРОСТРАНСТВЕННОЕ РАСПРЕДЕЛЕНИЕ ============
    
    @Column(name = "falloff_type")
    private String falloffType; // INVERSE_SQUARE, LINEAR, STEP, NONE
    
    @Column(name = "falloff_exponent")
    private Double falloffExponent; // степень затухания (для INVERSE_SQUARE = 2)
    
    // ============ ПОРОГИ СРАБАТЫВАНИЯ ============
    
    @Column(name = "warning_threshold")
    private Double warningThreshold; // порог предупреждения
    
    @Column(name = "critical_threshold")
    private Double criticalThreshold; // критический порог
    
    @Column(name = "failure_threshold")
    private Double failureThreshold; // порог отказа
    
    // ============ ПРИОРИТЕТ ============
    
    @Column(name = "priority")
    private Integer priority; // приоритет влияния (1-10, чем выше, тем важнее)
    
    // ============ ПРОСТРАНСТВЕННОЕ РАСПОЛОЖЕНИЕ ============
    
    @Column(name = "position_x")
    private Double positionX;
    
    @Column(name = "position_y")
    private Double positionY;
    
    private Boolean isActive = true;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schema_id")
    @JsonIgnore
    private Schema schema;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (factorValue == null) factorValue = 0.0;
        if (factorRadius == null) factorRadius = 10.0;
        if (changeRatePerSecond == null) changeRatePerSecond = 0.0;
        if (valueChangePattern == null) valueChangePattern = "NONE";
        if (falloffType == null) falloffType = "NONE";
        if (falloffExponent == null) falloffExponent = 2.0;
        if (priority == null) priority = 5;
        if (isActive == null) isActive = true;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // ============ ГЕТТЕРЫ И СЕТТЕРЫ для новых полей ============
    
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
    
    // ============ СУЩЕСТВУЮЩИЕ ГЕТТЕРЫ И СЕТТЕРЫ ============
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getCustomName() { return customName; }
    public void setCustomName(String customName) { this.customName = customName; }
    
    public String getFactorType() { return factorType; }
    public void setFactorType(String factorType) { this.factorType = factorType; }
    
    public Double getFactorValue() { return factorValue; }
    public void setFactorValue(Double factorValue) { this.factorValue = factorValue; }
    
    public String getFactorUnit() { return factorUnit; }
    public void setFactorUnit(String factorUnit) { this.factorUnit = factorUnit; }
    
    public Double getFactorRadius() { return factorRadius; }
    public void setFactorRadius(Double factorRadius) { this.factorRadius = factorRadius; }
    
    public Double getPositionX() { return positionX; }
    public void setPositionX(Double positionX) { this.positionX = positionX; }
    
    public Double getPositionY() { return positionY; }
    public void setPositionY(Double positionY) { this.positionY = positionY; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public Schema getSchema() { return schema; }
    public void setSchema(Schema schema) { this.schema = schema; }
}
