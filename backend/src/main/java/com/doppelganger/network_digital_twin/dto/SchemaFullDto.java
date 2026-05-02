package com.doppelganger.network_digital_twin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

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
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConnectionDto {
        private String id;
        private Double lengthM;
        private Double bandwidthMbps;
        private NodeRefDto sourceNode;
        private NodeRefDto targetNode;
        private CableDto cable;
        
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
