package com.doppelganger.network_digital_twin.service.simulation;

import com.doppelganger.network_digital_twin.entity.SchemaNode;
import lombok.Data;

@Data
public class ElementSpecs {
    private String nodeId;
    private String nodeName;
    private SchemaNode.NodeType nodeType;
    
    // Для DEVICE
    private Double baseLatencyMs;
    private Integer maxThroughputMbps;
    private Double tempCoefficient;
    private Double emiCoefficient;
    private Double vibrationCoefficient;
    private Double dustCoefficient;
    
    // Для CABLE
    private Double cableLengthM;
    private String cableType;
    private Double bandwidthMbps;
    private Integer immunityRating;
    private Integer shieldingType;
    private Double attenuationDbPerKm;
}