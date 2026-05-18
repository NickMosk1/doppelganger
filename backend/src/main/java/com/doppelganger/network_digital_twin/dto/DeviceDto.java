package com.doppelganger.network_digital_twin.dto;

import com.doppelganger.network_digital_twin.entity.Device.DeviceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceDto {
    private String id;
    private String name;
    private DeviceType type;
    private String typeRussianName;
    private String manufacturer;
    private String model;
    
    // Аппаратные характеристики
    private Integer portCount;
    private Integer cpuPower;
    private Integer ramMb;
    
    // Сетевые параметры
    private Double baseLatencyMs;
    private Integer maxThroughputMbps;
    
    // Промышленные коэффициенты
    private Double tempCoefficient;
    private Double emiCoefficient;
    private Double vibrationCoefficient;
    private Double dustCoefficient;
    
    // Допустимые диапазоны
    private Double maxOperatingTemp;
    private Double minOperatingTemp;
    private Double maxEmiTolerance;
    private Double maxVibrationTolerance;
    
    // Надежность
    private Integer mtbfHours;
    private Integer mttrMinutes;
    private Integer warmUpTimeSeconds;
    
    // ============ Экономические показатели ============
    private Double replacementCost;      // Стоимость замены (руб)
    private Double repairCost;           // Стоимость ремонта (руб)
    
    // Энергопотребление и защита
    private Integer powerConsumptionWatts;
    private Integer heatGenerationWatts;
    private String ipRating;
    private Integer operatingHumidityMax;
    private Boolean needsCooling;
    private Boolean hasRedundantPower;
    
    // Дополнительные
    private String description;
    private String iconUrl;
    private Boolean isActive;
    private String createdAt;
    private String updatedAt;
    
    // Метод для создания DTO из Entity
    public static DeviceDto fromEntity(com.doppelganger.network_digital_twin.entity.Device device) {
        return DeviceDto.builder()
            .id(device.getId())
            .name(device.getName())
            .type(device.getType())
            .typeRussianName(device.getType().getRussianName())
            .manufacturer(device.getManufacturer())
            .model(device.getModel())
            .portCount(device.getPortCount())
            .cpuPower(device.getCpuPower())
            .ramMb(device.getRamMb())
            .baseLatencyMs(device.getBaseLatencyMs())
            .maxThroughputMbps(device.getMaxThroughputMbps())
            .tempCoefficient(device.getTempCoefficient())
            .emiCoefficient(device.getEmiCoefficient())
            .vibrationCoefficient(device.getVibrationCoefficient())
            .dustCoefficient(device.getDustCoefficient())
            .maxOperatingTemp(device.getMaxOperatingTemp())
            .minOperatingTemp(device.getMinOperatingTemp())
            .maxEmiTolerance(device.getMaxEmiTolerance())
            .maxVibrationTolerance(device.getMaxVibrationTolerance())
            .mtbfHours(device.getMtbfHours())
            .mttrMinutes(device.getMttrMinutes())
            .warmUpTimeSeconds(device.getWarmUpTimeSeconds())
            .replacementCost(device.getReplacementCost())
            .repairCost(device.getRepairCost())
            .powerConsumptionWatts(device.getPowerConsumptionWatts())
            .heatGenerationWatts(device.getHeatGenerationWatts())
            .ipRating(device.getIpRating())
            .operatingHumidityMax(device.getOperatingHumidityMax())
            .needsCooling(device.getNeedsCooling())
            .hasRedundantPower(device.getHasRedundantPower())
            .description(device.getDescription())
            .iconUrl(device.getIconUrl())
            .isActive(device.getIsActive())
            .createdAt(device.getCreatedAt() != null ? device.getCreatedAt().toString() : null)
            .updatedAt(device.getUpdatedAt() != null ? device.getUpdatedAt().toString() : null)
            .build();
    }
}
