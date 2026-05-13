package com.doppelganger.network_digital_twin.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Map;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "simulation_results", indexes = {
    @Index(name = "idx_simulation_schema", columnList = "schema_id"),
    @Index(name = "idx_simulation_created", columnList = "created_at")
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
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSONB")
    private String summary;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSONB")
    private String timeline;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSONB")
    private String events;
    
    private String grade;
    private Integer score;
    
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getStartNodeName() { return startNodeName; }
    public void setStartNodeName(String startNodeName) { this.startNodeName = startNodeName; }

    public String getEndNodeName() { return endNodeName; }
    public void setEndNodeName(String endNodeName) { this.endNodeName = endNodeName; }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public Schema getSchema() { return schema; }
    public void setSchema(Schema schema) { this.schema = schema; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getStartNodeId() { return startNodeId; }
    public void setStartNodeId(String startNodeId) { this.startNodeId = startNodeId; }
    
    public String getEndNodeId() { return endNodeId; }
    public void setEndNodeId(String endNodeId) { this.endNodeId = endNodeId; }
    
    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }
    
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    
    public String getTimeline() { return timeline; }
    public void setTimeline(String timeline) { this.timeline = timeline; }
    
    public String getEvents() { return events; }
    public void setEvents(String events) { this.events = events; }
    
    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }
    
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
