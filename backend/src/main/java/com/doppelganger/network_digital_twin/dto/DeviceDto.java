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
    private Integer portCount;
    private Integer cpuPower;
    private Integer ramMb;
    private Double baseLatencyMs;
    private Integer maxThroughputMbps;
    private Double tempCoefficient;
    private Double emiCoefficient;
    private Double vibrationCoefficient;
    private Double dustCoefficient;
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
            .description(device.getDescription())
            .iconUrl(device.getIconUrl())
            .isActive(device.getIsActive())
            .createdAt(device.getCreatedAt() != null ? device.getCreatedAt().toString() : null)
            .updatedAt(device.getUpdatedAt() != null ? device.getUpdatedAt().toString() : null)
            .build();
    }
}
