package com.doppelganger.network_digital_twin.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class SimulationResponseDto {
    private String id;
    private String name;
    private String schemaId;
    private String schemaName;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private Integer durationSeconds;
    private Summary summary;
    private List<TimelinePoint> timeline;
    private List<CriticalEvent> criticalEvents;
    
    // Пустой конструктор
    public SimulationResponseDto() {
        this.timeline = new ArrayList<>();
        this.criticalEvents = new ArrayList<>();
    }
    
    // Конструктор со всеми полями
    public SimulationResponseDto(String id, String name, String schemaId, String schemaName,
                                  LocalDateTime startedAt, LocalDateTime finishedAt, Integer durationSeconds,
                                  Summary summary, List<TimelinePoint> timeline, List<CriticalEvent> criticalEvents) {
        this.id = id;
        this.name = name;
        this.schemaId = schemaId;
        this.schemaName = schemaName;
        this.startedAt = startedAt;
        this.finishedAt = finishedAt;
        this.durationSeconds = durationSeconds;
        this.summary = summary;
        this.timeline = timeline != null ? timeline : new ArrayList<>();
        this.criticalEvents = criticalEvents != null ? criticalEvents : new ArrayList<>();
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getSchemaId() { return schemaId; }
    public void setSchemaId(String schemaId) { this.schemaId = schemaId; }
    
    public String getSchemaName() { return schemaName; }
    public void setSchemaName(String schemaName) { this.schemaName = schemaName; }
    
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    
    public LocalDateTime getFinishedAt() { return finishedAt; }
    public void setFinishedAt(LocalDateTime finishedAt) { this.finishedAt = finishedAt; }
    
    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }
    
    public Summary getSummary() { return summary; }
    public void setSummary(Summary summary) { this.summary = summary; }
    
    public List<TimelinePoint> getTimeline() { return timeline; }
    public void setTimeline(List<TimelinePoint> timeline) { this.timeline = timeline; }
    
    public List<CriticalEvent> getCriticalEvents() { return criticalEvents; }
    public void setCriticalEvents(List<CriticalEvent> criticalEvents) { this.criticalEvents = criticalEvents; }
    
    // Builder
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private String id;
        private String name;
        private String schemaId;
        private String schemaName;
        private LocalDateTime startedAt;
        private LocalDateTime finishedAt;
        private Integer durationSeconds;
        private Summary summary;
        private List<TimelinePoint> timeline;
        private List<CriticalEvent> criticalEvents;
        
        public Builder id(String id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder schemaId(String schemaId) { this.schemaId = schemaId; return this; }
        public Builder schemaName(String schemaName) { this.schemaName = schemaName; return this; }
        public Builder startedAt(LocalDateTime startedAt) { this.startedAt = startedAt; return this; }
        public Builder finishedAt(LocalDateTime finishedAt) { this.finishedAt = finishedAt; return this; }
        public Builder durationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; return this; }
        public Builder summary(Summary summary) { this.summary = summary; return this; }
        public Builder timeline(List<TimelinePoint> timeline) { this.timeline = timeline; return this; }
        public Builder criticalEvents(List<CriticalEvent> criticalEvents) { this.criticalEvents = criticalEvents; return this; }
        
        public SimulationResponseDto build() {
            return new SimulationResponseDto(id, name, schemaId, schemaName, startedAt, finishedAt, 
                                           durationSeconds, summary, timeline, criticalEvents);
        }
    }
    
    // Вложенные классы
    public static class Summary {
        private Double maxLatencyMs;
        private Double avgLatencyMs;
        private Double maxPacketLossPercent;
        private Double avgPacketLossPercent;
        private Double minThroughputMbps;
        private Double maxTemperatureCelsius;
        private String worstDevice;
        private String grade;
        
        public Summary() {}
        
        public Summary(Double maxLatencyMs, Double avgLatencyMs, Double maxPacketLossPercent,
                       Double avgPacketLossPercent, Double minThroughputMbps, Double maxTemperatureCelsius,
                       String worstDevice, String grade) {
            this.maxLatencyMs = maxLatencyMs;
            this.avgLatencyMs = avgLatencyMs;
            this.maxPacketLossPercent = maxPacketLossPercent;
            this.avgPacketLossPercent = avgPacketLossPercent;
            this.minThroughputMbps = minThroughputMbps;
            this.maxTemperatureCelsius = maxTemperatureCelsius;
            this.worstDevice = worstDevice;
            this.grade = grade;
        }
        
        // Getters and Setters
        public Double getMaxLatencyMs() { return maxLatencyMs; }
        public void setMaxLatencyMs(Double maxLatencyMs) { this.maxLatencyMs = maxLatencyMs; }
        public Double getAvgLatencyMs() { return avgLatencyMs; }
        public void setAvgLatencyMs(Double avgLatencyMs) { this.avgLatencyMs = avgLatencyMs; }
        public Double getMaxPacketLossPercent() { return maxPacketLossPercent; }
        public void setMaxPacketLossPercent(Double maxPacketLossPercent) { this.maxPacketLossPercent = maxPacketLossPercent; }
        public Double getAvgPacketLossPercent() { return avgPacketLossPercent; }
        public void setAvgPacketLossPercent(Double avgPacketLossPercent) { this.avgPacketLossPercent = avgPacketLossPercent; }
        public Double getMinThroughputMbps() { return minThroughputMbps; }
        public void setMinThroughputMbps(Double minThroughputMbps) { this.minThroughputMbps = minThroughputMbps; }
        public Double getMaxTemperatureCelsius() { return maxTemperatureCelsius; }
        public void setMaxTemperatureCelsius(Double maxTemperatureCelsius) { this.maxTemperatureCelsius = maxTemperatureCelsius; }
        public String getWorstDevice() { return worstDevice; }
        public void setWorstDevice(String worstDevice) { this.worstDevice = worstDevice; }
        public String getGrade() { return grade; }
        public void setGrade(String grade) { this.grade = grade; }
        
        public static Builder builder() {
            return new Builder();
        }
        
        public static class Builder {
            private Double maxLatencyMs;
            private Double avgLatencyMs;
            private Double maxPacketLossPercent;
            private Double avgPacketLossPercent;
            private Double minThroughputMbps;
            private Double maxTemperatureCelsius;
            private String worstDevice;
            private String grade;
            
            public Builder maxLatencyMs(Double v) { this.maxLatencyMs = v; return this; }
            public Builder avgLatencyMs(Double v) { this.avgLatencyMs = v; return this; }
            public Builder maxPacketLossPercent(Double v) { this.maxPacketLossPercent = v; return this; }
            public Builder avgPacketLossPercent(Double v) { this.avgPacketLossPercent = v; return this; }
            public Builder minThroughputMbps(Double v) { this.minThroughputMbps = v; return this; }
            public Builder maxTemperatureCelsius(Double v) { this.maxTemperatureCelsius = v; return this; }
            public Builder worstDevice(String v) { this.worstDevice = v; return this; }
            public Builder grade(String v) { this.grade = v; return this; }
            
            public Summary build() {
                return new Summary(maxLatencyMs, avgLatencyMs, maxPacketLossPercent, avgPacketLossPercent,
                                  minThroughputMbps, maxTemperatureCelsius, worstDevice, grade);
            }
        }
    }
    
    public static class TimelinePoint {
        private Integer timestamp;
        private Map<String, DeviceMetrics> devices;
        
        public TimelinePoint() {}
        
        public TimelinePoint(Integer timestamp, Map<String, DeviceMetrics> devices) {
            this.timestamp = timestamp;
            this.devices = devices;
        }
        
        public Integer getTimestamp() { return timestamp; }
        public void setTimestamp(Integer timestamp) { this.timestamp = timestamp; }
        public Map<String, DeviceMetrics> getDevices() { return devices; }
        public void setDevices(Map<String, DeviceMetrics> devices) { this.devices = devices; }
        
        public static Builder builder() {
            return new Builder();
        }
        
        public static class Builder {
            private Integer timestamp;
            private Map<String, DeviceMetrics> devices;
            
            public Builder timestamp(Integer v) { this.timestamp = v; return this; }
            public Builder devices(Map<String, DeviceMetrics> v) { this.devices = v; return this; }
            
            public TimelinePoint build() {
                return new TimelinePoint(timestamp, devices);
            }
        }
    }
    
    public static class DeviceMetrics {
        private Double latencyMs;
        private Double packetLossPercent;
        private Double throughputMbps;
        private String status;
        private Double temperature;
        
        public DeviceMetrics() {}
        
        public DeviceMetrics(Double latencyMs, Double packetLossPercent, Double throughputMbps, String status, Double temperature) {
            this.latencyMs = latencyMs;
            this.packetLossPercent = packetLossPercent;
            this.throughputMbps = throughputMbps;
            this.status = status;
            this.temperature = temperature;
        }
        
        // Getters and Setters
        public Double getLatencyMs() { return latencyMs; }
        public void setLatencyMs(Double latencyMs) { this.latencyMs = latencyMs; }
        public Double getPacketLossPercent() { return packetLossPercent; }
        public void setPacketLossPercent(Double packetLossPercent) { this.packetLossPercent = packetLossPercent; }
        public Double getThroughputMbps() { return throughputMbps; }
        public void setThroughputMbps(Double throughputMbps) { this.throughputMbps = throughputMbps; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Double getTemperature() { return temperature; }
        public void setTemperature(Double temperature) { this.temperature = temperature; }
        
        public static Builder builder() {
            return new Builder();
        }
        
        public static class Builder {
            private Double latencyMs;
            private Double packetLossPercent;
            private Double throughputMbps;
            private String status;
            private Double temperature;
            
            public Builder latencyMs(Double v) { this.latencyMs = v; return this; }
            public Builder packetLossPercent(Double v) { this.packetLossPercent = v; return this; }
            public Builder throughputMbps(Double v) { this.throughputMbps = v; return this; }
            public Builder status(String v) { this.status = v; return this; }
            public Builder temperature(Double v) { this.temperature = v; return this; }
            
            public DeviceMetrics build() {
                return new DeviceMetrics(latencyMs, packetLossPercent, throughputMbps, status, temperature);
            }
        }
    }
    
    public static class CriticalEvent {
        private Integer timestamp;
        private String type;
        private String deviceName;
        private String message;
        private String severity;
        
        public CriticalEvent() {}
        
        public CriticalEvent(Integer timestamp, String type, String deviceName, String message, String severity) {
            this.timestamp = timestamp;
            this.type = type;
            this.deviceName = deviceName;
            this.message = message;
            this.severity = severity;
        }
        
        // Getters and Setters
        public Integer getTimestamp() { return timestamp; }
        public void setTimestamp(Integer timestamp) { this.timestamp = timestamp; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getDeviceName() { return deviceName; }
        public void setDeviceName(String deviceName) { this.deviceName = deviceName; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }
        
        public static Builder builder() {
            return new Builder();
        }
        
        public static class Builder {
            private Integer timestamp;
            private String type;
            private String deviceName;
            private String message;
            private String severity;
            
            public Builder timestamp(Integer v) { this.timestamp = v; return this; }
            public Builder type(String v) { this.type = v; return this; }
            public Builder deviceName(String v) { this.deviceName = v; return this; }
            public Builder message(String v) { this.message = v; return this; }
            public Builder severity(String v) { this.severity = v; return this; }
            
            public CriticalEvent build() {
                return new CriticalEvent(timestamp, type, deviceName, message, severity);
            }
        }
    }
}
