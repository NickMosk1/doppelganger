package com.doppelganger.network_digital_twin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchemaFullDto {
    private String id;
    private String name;
    private String description;
    private Integer depth;
    private String path;
    private List<NodeDto> nodes;
    private List<ConnectionDto> connections;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NodeDto {
        private String id;
        private String customName;
        private String nodeType;
        private Double positionX;
        private Double positionY;
        private DeviceDto device;
        private Double cableLengthM;
        private String cableType;
        private FactorDto factor;
        
        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class DeviceDto {
            private String id;
            private String name;
            private String type;
            private String manufacturer;
            private Double baseLatencyMs;
            private Integer maxThroughputMbps;
        }
        
        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class FactorDto {
            private String factorType;
            private Double factorValue;
            private String factorUnit;
            private Double factorRadius;
        }
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConnectionDto {
        private String id;
        private Double lengthM;
        private Double bandwidthMbps;
        @JsonProperty("sourceNodeId")
        private String sourceNodeId;
        private String connectionType;  // 🔧 Добавить!
        @JsonProperty("targetNodeId")
        private String targetNodeId;
        private NodeRefDto sourceNode;
        private NodeRefDto targetNode;
        private CableDto cable;
        private String sourcePortId;
        private String targetPortId;
        private FactorDataDto factorData;  // 🔧 Добавить!

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class FactorDataDto {
            private String factorId;
            private String factorType;
            private Double distance;
            private Double attenuation;
        }

        public String getSourceNodeId() {
            return sourceNodeId;
        }

        public void setSourceNodeId(String sourceNodeId) {
            this.sourceNodeId = sourceNodeId;
        }
        
        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class NodeRefDto {
            private String id;
            private String customName;
        }
        
        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class CableDto {
            private String id;
            private String name;
            private String type;
            private Double maxLengthM;
            private Double attenuationDbPerKm;
        }
    }
}
