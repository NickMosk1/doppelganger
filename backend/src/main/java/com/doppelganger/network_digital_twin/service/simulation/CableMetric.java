package com.doppelganger.network_digital_twin.service.simulation;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CableMetric {
    private double latencyMs;
    private double packetLossPercent;
    private double throughputMbps;
    private double bitErrorRate;
    private double attenuationDb;
}