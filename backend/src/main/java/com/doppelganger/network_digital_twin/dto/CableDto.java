package com.doppelganger.network_digital_twin.dto;

import com.doppelganger.network_digital_twin.entity.Cable;
import com.doppelganger.network_digital_twin.entity.Cable.CableType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CableDto {
    private String id;
    private String name;
    private CableType type;
    private String typeRussianName;
    private String manufacturer;
    private String model;
    
    // Физические характеристики
    private Double maxLengthM;
    private Double attenuationDbPerKm;
    private Double propagationSpeed;
    
    // Механические характеристики
    private Double bendingRadiusMm;
    private Integer tensileStrengthN;
    private Integer operatingTensionMaxN;
    
    // Электрические/оптические параметры
    private Double impedanceOhms;
    private Double coreDiameterUm;
    private Double capacitancePerKmNf;
    private Double resistancePerKmOhms;
    
    // Частотные характеристики
    private Integer maxFrequencyMhz;
    private Integer signalToNoiseRatioDb;
    
    // Промышленная устойчивость
    private Integer immunityRating;
    private Integer temperatureRating;
    private Integer shieldingType;
    private Boolean oilResistance;
    private Boolean uvResistance;
    private String chemicalResistance;
    
    // Срок службы
    private Integer expectedLifetimeYears;
    private Double degradationRatePerYear;
    
    // Стоимость
    private Double pricePerMeter;
    
    // Дополнительные
    private String description;
    private Boolean isActive;
    private Boolean isCustom;
    private String createdAt;
    private String updatedAt;
    
    public static CableDto fromEntity(Cable cable) {
        return CableDto.builder()
            .id(cable.getId())
            .name(cable.getName())
            .type(cable.getType())
            .typeRussianName(cable.getType().getRussianName())
            .manufacturer(cable.getManufacturer())
            .model(cable.getModel())
            .maxLengthM(cable.getMaxLengthM())
            .attenuationDbPerKm(cable.getAttenuationDbPerKm())
            .propagationSpeed(cable.getPropagationSpeed())
            .bendingRadiusMm(cable.getBendingRadiusMm())
            .tensileStrengthN(cable.getTensileStrengthN())
            .operatingTensionMaxN(cable.getOperatingTensionMaxN())
            .impedanceOhms(cable.getImpedanceOhms())
            .coreDiameterUm(cable.getCoreDiameterUm())
            .capacitancePerKmNf(cable.getCapacitancePerKmNf())
            .resistancePerKmOhms(cable.getResistancePerKmOhms())
            .maxFrequencyMhz(cable.getMaxFrequencyMhz())
            .signalToNoiseRatioDb(cable.getSignalToNoiseRatioDb())
            .immunityRating(cable.getImmunityRating())
            .temperatureRating(cable.getTemperatureRating())
            .shieldingType(cable.getShieldingType())
            .oilResistance(cable.getOilResistance())
            .uvResistance(cable.getUvResistance())
            .chemicalResistance(cable.getChemicalResistance())
            .expectedLifetimeYears(cable.getExpectedLifetimeYears())
            .degradationRatePerYear(cable.getDegradationRatePerYear())
            .pricePerMeter(cable.getPricePerMeter())
            .description(cable.getDescription())
            .isActive(cable.getIsActive())
            .isCustom(cable.getIsCustom())
            .createdAt(cable.getCreatedAt() != null ? cable.getCreatedAt().toString() : null)
            .updatedAt(cable.getUpdatedAt() != null ? cable.getUpdatedAt().toString() : null)
            .build();
    }
}
