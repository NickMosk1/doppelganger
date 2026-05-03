package com.doppelganger.network_digital_twin.service;

import com.doppelganger.network_digital_twin.dto.SimulationRequestDto;
import com.doppelganger.network_digital_twin.dto.SimulationResponseDto;
import com.doppelganger.network_digital_twin.entity.*;
import com.doppelganger.network_digital_twin.exception.ResourceNotFoundException;
import com.doppelganger.network_digital_twin.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class SimulationService {
    
    private static final Logger log = LoggerFactory.getLogger(SimulationService.class);
    
    private final SchemaRepository schemaRepository;
    private final SchemaNodeRepository schemaNodeRepository;
    private final ConnectionRepository connectionRepository;
    private final IndustrialFactorRepository factorRepository;
    
    public SimulationService(SchemaRepository schemaRepository,
                             SchemaNodeRepository schemaNodeRepository,
                             ConnectionRepository connectionRepository,
                             IndustrialFactorRepository factorRepository) {
        this.schemaRepository = schemaRepository;
        this.schemaNodeRepository = schemaNodeRepository;
        this.connectionRepository = connectionRepository;
        this.factorRepository = factorRepository;
    }
    
    public SimulationResponseDto runSimulation(String schemaId, SimulationRequestDto request) {
        log.info("Running simulation for schema: {}", schemaId);
        
        Schema schema = schemaRepository.findById(schemaId)
            .orElseThrow(() -> new ResourceNotFoundException("Schema not found: " + schemaId));
        
        List<SchemaNode> nodes = schemaNodeRepository.findBySchemaId(schemaId);
        List<Connection> connections = connectionRepository.findBySchemaId(schemaId);
        
        log.info("Found {} nodes and {} connections", nodes.size(), connections.size());
        
        if (nodes.isEmpty()) {
            throw new IllegalStateException("No devices on schema. Add devices first.");
        }
        
        if (connections.isEmpty()) {
            throw new IllegalStateException("No connections between devices. Add connections first.");
        }
        
        // Получаем факторы
        Map<String, Double> factors = new HashMap<>();
        List<IndustrialFactor> allFactors = factorRepository.findAll();
        for (IndustrialFactor factor : allFactors) {
            factors.put(factor.getName(), factor.getValue());
        }
        
        if (request.getFactors() != null) {
            factors.putAll(request.getFactors());
        }
        
        double temperature = factors.getOrDefault("temperature", 25.0);
        double emi = factors.getOrDefault("emi", 20.0);
        double vibration = factors.getOrDefault("vibration", 10.0);
        
        int duration = request.getDurationSeconds() != null ? request.getDurationSeconds() : 60;
        
        // Timeline и события
        List<SimulationResponseDto.TimelinePoint> timeline = new ArrayList<>();
        List<SimulationResponseDto.CriticalEvent> criticalEvents = new ArrayList<>();
        
        double maxLatency = 0;
        double totalLatency = 0;
        double maxPacketLoss = 0;
        double minThroughput = Double.MAX_VALUE;
        String worstDevice = "";
        int sampleCount = 0;
        
        // Шаг симуляции: 5 секунд
        int step = 5;
        
        for (int t = 0; t <= duration; t += step) {
            Map<String, SimulationResponseDto.DeviceMetrics> deviceMetrics = new HashMap<>();
            
            for (Connection conn : connections) {
                SchemaNode source = conn.getSourceNode();
                Device device = source.getDevice();
                
                double baseLatency = device.getBaseLatencyMs() != null ? device.getBaseLatencyMs() : 1.0;
                double cableLength = conn.getLengthM() != null ? conn.getLengthM() : 10.0;
                double distanceLatency = cableLength / 100.0;
                
                // Динамическая температура (растет со временем при высоких значениях)
                double currentTemp = temperature;
                if (temperature > 40 && t > 0) {
                    currentTemp = temperature + (t / 60.0) * 5;
                    currentTemp = Math.min(currentTemp, 85);
                }
                
                // Влияние температуры
                double tempImpact = 1.0;
                if (currentTemp > 40) {
                    tempImpact = 1.0 + (currentTemp - 40) * 0.015;
                }
                
                // Влияние ЭМИ
                double emiImpact = 1.0;
                if (emi > 30) {
                    emiImpact = 1.0 + (emi - 30) * 0.01;
                }
                
                // Влияние вибрации
                double vibrationImpact = 1.0;
                if (vibration > 50) {
                    vibrationImpact = 1.0 + (vibration - 50) * 0.005;
                }
                
                double latency = (baseLatency + distanceLatency) * tempImpact * emiImpact * vibrationImpact;
                
                // Потери пакетов
                double packetLoss = 0.0;
                if (currentTemp > 60) packetLoss += (currentTemp - 60) * 1.5;
                if (emi > 50) packetLoss += (emi - 50) * 0.5;
                if (vibration > 70) packetLoss += (vibration - 70) * 0.3;
                packetLoss = Math.min(100, packetLoss);
                
                // Пропускная способность
                double throughput = device.getMaxThroughputMbps() != null ? device.getMaxThroughputMbps() : 1000.0;
                throughput = throughput * (1 - packetLoss / 100);
                
                // Статус
                String status = "OPERATIONAL";
                if (packetLoss > 50 || latency > 500) {
                    status = "FAILED";
                } else if (packetLoss > 20 || latency > 200) {
                    status = "DEGRADED";
                } else if (currentTemp > 55) {
                    status = "OVERHEATING";
                }
                
                String deviceName = source.getCustomName() != null ? source.getCustomName() : device.getName();
                
                deviceMetrics.put(source.getId(), SimulationResponseDto.DeviceMetrics.builder()
                    .latencyMs(Math.round(latency * 10) / 10.0)
                    .packetLossPercent(Math.round(packetLoss * 10) / 10.0)
                    .throughputMbps(Math.round(throughput * 10) / 10.0)
                    .status(status)
                    .temperature(Math.round(currentTemp * 10) / 10.0)
                    .build());
                
                // Обновляем статистику
                if (latency > maxLatency) {
                    maxLatency = latency;
                    worstDevice = deviceName;
                }
                totalLatency += latency;
                if (packetLoss > maxPacketLoss) maxPacketLoss = packetLoss;
                if (throughput < minThroughput) minThroughput = throughput;
                sampleCount++;
                
                // Критические события
                if (currentTemp > 65 && t % 30 == 0) {
                    criticalEvents.add(SimulationResponseDto.CriticalEvent.builder()
                        .timestamp(t)
                        .type("OVERHEAT")
                        .deviceName(deviceName)
                        .message("Температура достигла " + Math.round(currentTemp) + "°C")
                        .severity(currentTemp > 75 ? "CRITICAL" : "WARNING")
                        .build());
                }
                
                if (packetLoss > 30 && packetLoss <= 50) {
                    criticalEvents.add(SimulationResponseDto.CriticalEvent.builder()
                        .timestamp(t)
                        .type("HIGH_PACKET_LOSS")
                        .deviceName(deviceName)
                        .message("Потери пакетов: " + Math.round(packetLoss) + "%")
                        .severity("WARNING")
                        .build());
                }
            }
            
            timeline.add(SimulationResponseDto.TimelinePoint.builder()
                .timestamp(t)
                .devices(deviceMetrics)
                .build());
        }
        
        // Оценка
        String grade;
        if (maxLatency < 50 && maxPacketLoss < 5 && minThroughput > 900) grade = "A";
        else if (maxLatency < 100 && maxPacketLoss < 10 && minThroughput > 800) grade = "B";
        else if (maxLatency < 200 && maxPacketLoss < 20 && minThroughput > 500) grade = "C";
        else if (maxLatency < 500 && maxPacketLoss < 50 && minThroughput > 100) grade = "D";
        else grade = "F";
        
        SimulationResponseDto.Summary summary = SimulationResponseDto.Summary.builder()
            .maxLatencyMs(Math.round(maxLatency * 10) / 10.0)
            .avgLatencyMs(Math.round((totalLatency / sampleCount) * 10) / 10.0)
            .maxPacketLossPercent(Math.round(maxPacketLoss * 10) / 10.0)
            .avgPacketLossPercent(Math.round((maxPacketLoss / 2) * 10) / 10.0)
            .minThroughputMbps(minThroughput == Double.MAX_VALUE ? 0 : Math.round(minThroughput * 10) / 10.0)
            .maxTemperatureCelsius(temperature)
            .worstDevice(worstDevice.isEmpty() ? "Unknown" : worstDevice)
            .grade(grade)
            .build();
        
        String simulationName = request.getName() != null ? request.getName() : "Simulation_" + System.currentTimeMillis();
        
        return SimulationResponseDto.builder()
            .id(UUID.randomUUID().toString())
            .name(simulationName)
            .schemaId(schema.getId())
            .schemaName(schema.getName())
            .startedAt(LocalDateTime.now())
            .finishedAt(LocalDateTime.now())
            .durationSeconds(duration)
            .summary(summary)
            .timeline(timeline)
            .criticalEvents(criticalEvents)
            .build();
    }
}
