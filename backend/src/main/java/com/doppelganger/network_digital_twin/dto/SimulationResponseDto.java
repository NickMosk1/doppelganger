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
    
    // ============ НОВЫЕ ПОЛЯ ДЛЯ РАСШИРЕННОЙ АНАЛИТИКИ ============
    private EconomicImpact economicImpact;
    private List<DeviceDetail> deviceDetails;
    private List<CableDetail> cableDetails;
    private Map<String, FactorContribution> factorContributions;
    
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
        
        // ============ НОВЫЕ ПОЛЯ ============
        private Double totalReplacementCost;      // Общая стоимость замены
        private Double totalRepairCost;           // Общая стоимость ремонта
        private Double totalDowntimeSeconds;      // Общее время простоя
        private String worstAffectedDevice;       // Наиболее пострадавшее устройство
        private String worstAffectedCable;        // Наиболее пострадавший кабель
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimelinePoint {
        private Integer timestamp;
        private Double avgLatencyMs;
        private Double packetLossPercent;
        private Map<String, DeviceMetric> devices;
        
        // ============ НОВЫЕ ПОЛЯ ============
        private Map<String, CableMetric> cables;
        private Map<String, FactorValue> factorValues;
        private Double totalThroughputMbps;
        private Integer activeAlertsCount;
        private Integer activeCriticalCount;
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
        private String recommendation;
        
        // ============ НОВЫЕ ПОЛЯ ============
        private String affectedElementType;  // DEVICE, CABLE
        private String factorType;           // TEMPERATURE, EMI, VIBRATION, DUST
        private Double factorValue;          // Значение фактора в момент события
        private Double threshold;             // Порог, который был превышен
        private Double estimatedCost;         // Оценочная стоимость ущерба
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
        
        // ============ НОВЫЕ ПОЛЯ ============
        private Double emiLevel;
        private Double vibrationLevel;
        private Double dustLevel;
        private Double currentUtilizationPercent;
        private String degradationCause;
    }
    
    // ============ НОВЫЕ DTO ============
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CableMetric {
        private String cableId;
        private String cableName;
        private Double packetLossPercent;
        private Double throughputMbps;
        private Double attenuationDb;
        private Double bitErrorRate;
        private String status;
        private String degradationCause;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FactorValue {
        private String factorType;
        private Double currentValue;
        private Double warningThreshold;
        private Double criticalThreshold;
        private Double failureThreshold;
        private String severity;  // NORMAL, WARNING, CRITICAL, FAILURE
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EconomicImpact {
        private Double totalReplacementCost;
        private Double totalRepairCost;
        private Double estimatedDowntimeCost;  // Стоимость простоя
        private Double totalLoss;
        private Map<String, Double> deviceLosses;
        private Map<String, Double> cableLosses;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeviceDetail {
        private String deviceId;
        private String deviceName;
        private String deviceType;
        private Double baseLatencyMs;
        private Double maxThroughputMbps;
        private List<FactorImpactDetail> factorImpacts;
        private Double finalLatencyMs;
        private Double finalPacketLossPercent;
        private String finalStatus;
        private Boolean isFailed;
        private Double replacementCost;
        private Double repairCost;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CableDetail {
        private String cableId;
        private String cableName;
        private String cableType;
        private Double lengthM;
        private List<FactorImpactDetail> factorImpacts;
        private Double finalPacketLossPercent;
        private String finalStatus;
        private Boolean isFailed;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FactorImpactDetail {
        private String factorId;
        private String factorName;
        private String factorType;
        private Double factorValue;
        private Double distance;
        private Double effectiveValue;
        private String thresholdLevel;  // NORMAL, WARNING, CRITICAL, FAILURE
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FactorContribution {
        private String factorId;
        private String factorName;
        private String factorType;
        private Double contributionPercent;  // Процент влияния на общую деградацию
        private Integer affectedElementsCount;
        private List<String> affectedElementIds;
    }
}
