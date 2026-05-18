package com.doppelganger.network_digital_twin.dto;

import com.doppelganger.network_digital_twin.entity.FactorNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FactorDto {
    private String id;
    private String name;
    private String customName;
    private String factorType;
    private Double factorValue;
    private String factorUnit;
    private Double factorRadius;
    
    // Динамика изменения
    private Double changeRatePerSecond;
    private Double minValue;
    private Double maxValue;
    private String valueChangePattern;
    private Double frequencyHz;
    
    // Временные характеристики
    private Integer startTimeSeconds;
    private Integer durationSeconds;
    
    // Пространственное распределение
    private String falloffType;
    private Double falloffExponent;
    
    // Пороги срабатывания
    private Double warningThreshold;
    private Double criticalThreshold;
    private Double failureThreshold;
    
    // Приоритет
    private Integer priority;
    
    // Пространственное расположение
    private Double positionX;
    private Double positionY;
    
    private Boolean isActive;
    private String description;
    private String createdAt;
    private String updatedAt;
    
    public static FactorDto fromEntity(FactorNode factor) {
        return FactorDto.builder()
            .id(factor.getId())
            .name(factor.getName())
            .customName(factor.getCustomName())
            .factorType(factor.getFactorType())
            .factorValue(factor.getFactorValue())
            .factorUnit(factor.getFactorUnit())
            .factorRadius(factor.getFactorRadius())
            .changeRatePerSecond(factor.getChangeRatePerSecond())
            .minValue(factor.getMinValue())
            .maxValue(factor.getMaxValue())
            .valueChangePattern(factor.getValueChangePattern())
            .frequencyHz(factor.getFrequencyHz())
            .startTimeSeconds(factor.getStartTimeSeconds())
            .durationSeconds(factor.getDurationSeconds())
            .falloffType(factor.getFalloffType())
            .falloffExponent(factor.getFalloffExponent())
            .warningThreshold(factor.getWarningThreshold())
            .criticalThreshold(factor.getCriticalThreshold())
            .failureThreshold(factor.getFailureThreshold())
            .priority(factor.getPriority())
            .positionX(factor.getPositionX())
            .positionY(factor.getPositionY())
            .isActive(factor.getIsActive())
            .description(factor.getDescription())
            .createdAt(factor.getCreatedAt() != null ? factor.getCreatedAt().toString() : null)
            .updatedAt(factor.getUpdatedAt() != null ? factor.getUpdatedAt().toString() : null)
            .build();
    }
}