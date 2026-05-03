package com.doppelganger.network_digital_twin.dto;

import java.util.HashMap;
import java.util.Map;

public class SimulationRequestDto {
    private String name;
    private Integer durationSeconds;
    private Map<String, Double> factors;
    private Boolean saveHistory;
    
    // Пустой конструктор (нужен для Jackson)
    public SimulationRequestDto() {
        this.factors = new HashMap<>();
        this.saveHistory = false;
    }
    
    // Конструктор со всеми полями
    public SimulationRequestDto(String name, Integer durationSeconds, Map<String, Double> factors, Boolean saveHistory) {
        this.name = name;
        this.durationSeconds = durationSeconds;
        this.factors = factors != null ? factors : new HashMap<>();
        this.saveHistory = saveHistory != null ? saveHistory : false;
    }
    
    // Getters and Setters
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public Integer getDurationSeconds() {
        return durationSeconds;
    }
    
    public void setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
    }
    
    public Map<String, Double> getFactors() {
        return factors;
    }
    
    public void setFactors(Map<String, Double> factors) {
        this.factors = factors;
    }
    
    public Boolean getSaveHistory() {
        return saveHistory;
    }
    
    public void setSaveHistory(Boolean saveHistory) {
        this.saveHistory = saveHistory;
    }
    
    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private String name;
        private Integer durationSeconds;
        private Map<String, Double> factors;
        private Boolean saveHistory;
        
        public Builder name(String name) {
            this.name = name;
            return this;
        }
        
        public Builder durationSeconds(Integer durationSeconds) {
            this.durationSeconds = durationSeconds;
            return this;
        }
        
        public Builder factors(Map<String, Double> factors) {
            this.factors = factors;
            return this;
        }
        
        public Builder saveHistory(Boolean saveHistory) {
            this.saveHistory = saveHistory;
            return this;
        }
        
        public SimulationRequestDto build() {
            return new SimulationRequestDto(name, durationSeconds, factors, saveHistory);
        }
    }
}
