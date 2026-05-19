package com.doppelganger.network_digital_twin.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "simulation_results", indexes = {
    @Index(name = "idx_simulation_schema", columnList = "schema_id"),
    @Index(name = "idx_simulation_created", columnList = "created_at"),
    @Index(name = "idx_simulation_grade", columnList = "grade")
})
public class SimulationResult {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schema_id", nullable = false)
    private Schema schema;
    
    @Column(nullable = false)
    private String name;
    
    @Column(name = "start_node_id", nullable = false)
    private String startNodeId;
    
    @Column(name = "start_node_name")
    private String startNodeName;
    
    @Column(name = "end_node_id", nullable = false)
    private String endNodeId;
    
    @Column(name = "end_node_name")
    private String endNodeName;
    
    @Column(name = "duration_seconds")
    private Integer durationSeconds;
    
    // Основные результаты
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSONB")
    private String summary;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSONB")
    private String timeline;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSONB")
    private String events;
    
    // ============ НОВЫЕ ПОЛЯ ДЛЯ РАСШИРЕННЫХ ДАННЫХ ============
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSONB")
    private String economicImpact;      // Экономические показатели
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSONB")
    private String deviceDetails;       // Детальная информация по устройствам
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSONB")
    private String cableDetails;        // Детальная информация по кабелям
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSONB")
    private String factorContributions; // Вклад факторов в деградацию
    
    // Общие метрики
    private String grade;
    private Integer score;
    
    // Дополнительные метрики для фильтрации/сортировки
    @Column(name = "max_packet_loss")
    private Double maxPacketLoss;
    
    @Column(name = "max_latency_ms")
    private Double maxLatencyMs;
    
    @Column(name = "devices_failed_count")
    private Integer devicesFailedCount;
    
    @Column(name = "cables_failed_count")
    private Integer cablesFailedCount;
    
    @Column(name = "total_economic_loss")
    private Double totalEconomicLoss;
    
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        // Для обновлений, если нужно
    }
    
    // ============ GETTERS AND SETTERS ============
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public Schema getSchema() { return schema; }
    public void setSchema(Schema schema) { this.schema = schema; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getStartNodeId() { return startNodeId; }
    public void setStartNodeId(String startNodeId) { this.startNodeId = startNodeId; }
    
    public String getStartNodeName() { return startNodeName; }
    public void setStartNodeName(String startNodeName) { this.startNodeName = startNodeName; }
    
    public String getEndNodeId() { return endNodeId; }
    public void setEndNodeId(String endNodeId) { this.endNodeId = endNodeId; }
    
    public String getEndNodeName() { return endNodeName; }
    public void setEndNodeName(String endNodeName) { this.endNodeName = endNodeName; }
    
    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }
    
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    
    public String getTimeline() { return timeline; }
    public void setTimeline(String timeline) { this.timeline = timeline; }
    
    public String getEvents() { return events; }
    public void setEvents(String events) { this.events = events; }
    
    public String getEconomicImpact() { return economicImpact; }
    public void setEconomicImpact(String economicImpact) { this.economicImpact = economicImpact; }
    
    public String getDeviceDetails() { return deviceDetails; }
    public void setDeviceDetails(String deviceDetails) { this.deviceDetails = deviceDetails; }
    
    public String getCableDetails() { return cableDetails; }
    public void setCableDetails(String cableDetails) { this.cableDetails = cableDetails; }
    
    public String getFactorContributions() { return factorContributions; }
    public void setFactorContributions(String factorContributions) { this.factorContributions = factorContributions; }
    
    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }
    
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    
    public Double getMaxPacketLoss() { return maxPacketLoss; }
    public void setMaxPacketLoss(Double maxPacketLoss) { this.maxPacketLoss = maxPacketLoss; }
    
    public Double getMaxLatencyMs() { return maxLatencyMs; }
    public void setMaxLatencyMs(Double maxLatencyMs) { this.maxLatencyMs = maxLatencyMs; }
    
    public Integer getDevicesFailedCount() { return devicesFailedCount; }
    public void setDevicesFailedCount(Integer devicesFailedCount) { this.devicesFailedCount = devicesFailedCount; }
    
    public Integer getCablesFailedCount() { return cablesFailedCount; }
    public void setCablesFailedCount(Integer cablesFailedCount) { this.cablesFailedCount = cablesFailedCount; }
    
    public Double getTotalEconomicLoss() { return totalEconomicLoss; }
    public void setTotalEconomicLoss(Double totalEconomicLoss) { this.totalEconomicLoss = totalEconomicLoss; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
