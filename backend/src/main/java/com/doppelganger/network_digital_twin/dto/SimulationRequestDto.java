package com.doppelganger.network_digital_twin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulationRequestDto {
    private String name;
    private String startNodeId;
    private String startNodeName;  // Добавить
    private String endNodeId;
    private String endNodeName;
    private Integer durationSeconds;
}
