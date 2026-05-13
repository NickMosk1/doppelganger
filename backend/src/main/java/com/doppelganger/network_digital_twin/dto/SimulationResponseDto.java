package com.doppelganger.network_digital_twin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulationResponseDto {
    private String id;
    private String name;
    private String schemaId;
    private String schemaName;
    private String startNodeId;
    private String startNodeName;
    private String endNodeId;
    private String endNodeName;
    private Integer durationSeconds;
    private Summary summary;
    private List<TimelinePoint> timeline;
    private List<CriticalEvent> events;
    private String grade;
    private Integer score;
    private String createdAt;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private Double maxLatencyMs;
        private Double avgLatencyMs;
        private Double minLatencyMs;
        private Double packetLossPercent;
        private Double throughputMbps;
        private Integer devicesFailed;
        private Integer cablesFailed;
        private List<String> bottlenecks;
        private String recommendation;
    }
    
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @Data
    public static class TimelinePoint {
        private Integer timestamp;
        private Double avgLatencyMs;
        private Double packetLossPercent;
        private Map<String, DeviceMetric> devices;
    }

    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @Data
    public static class CriticalEvent {
        private Integer timestamp;
        private String type;
        private String deviceId;
        private String deviceName;
        private String message;
        private String severity;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeviceMetric {
        private Double latencyMs;
        private Double packetLossPercent;
        private Double throughputMbps;
        private Double temperature;
        private String status;
    }
}
