package com.doppelganger.network_digital_twin.simulation;

import com.doppelganger.network_digital_twin.dto.SimulationResponseDto;
import com.doppelganger.network_digital_twin.entity.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class SimulationEngine {
    
    private static final Logger log = LoggerFactory.getLogger(SimulationEngine.class);
    
    public SimulationResponseDto runSimulation(Schema schema, 
                                                List<SchemaNode> nodes,
                                                List<Connection> connections,
                                                Map<String, Double> factors,
                                                Integer durationSeconds,
                                                String simulationName) {
        
        log.info("Starting simulation for schema: {}, duration: {}s", schema.getName(), durationSeconds);
        
        // Получаем значения факторов
        double temperature = factors.getOrDefault("temperature", 25.0);
        double emi = factors.getOrDefault("emi", 20.0);
        double vibration = factors.getOrDefault("vibration", 10.0);
        
        // Собираем устройства в карту по ID узла
        Map<String, SchemaNode> nodeMap = nodes.stream()
            .collect(Collectors.toMap(SchemaNode::getId, n -> n));
        
        // Результаты симуляции
        List<SimulationResponseDto.TimelinePoint> timeline = new ArrayList<>();
        List<SimulationResponseDto.CriticalEvent> events = new ArrayList<>();
        
        // Статистика для сводки
        double maxLatency = 0;
        double totalLatency = 0;
        double maxPacketLoss = 0;
        double minThroughput = Double.MAX_VALUE;
        String worstDevice = "";
        int sampleCount = 0;
        
        // Шаг симуляции: 5 секунд
        int step = 5;
        
        for (int t = 0; t <= durationSeconds; t += step) {
            Map<String, SimulationResponseDto.DeviceMetrics> deviceMetrics = new HashMap<>();
            
            for (Connection conn : connections) {
                SchemaNode source = conn.getSourceNode();
                Device device = source.getDevice();
                
                // Расчет задержки
                double baseLatency = device.getBaseLatencyMs() != null ? device.getBaseLatencyMs() : 1.0;
                double cableLength = conn.getLengthM() != null ? conn.getLengthM() : 10.0;
                double distanceLatency = cableLength / 100.0; // 1ms на 100м
                
                // Влияние температуры (экспоненциальное)
                double tempImpact = 1.0;
                if (temperature > 40) {
                    tempImpact = 1.0 + (temperature - 40) * 0.015;
                } else if (temperature > 60) {
                    tempImpact = 1.0 + (temperature - 40) * 0.025;
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
                
                // Итоговая задержка
                double latency = (baseLatency + distanceLatency) * tempImpact * emiImpact * vibrationImpact;
                
                // Потери пакетов
                double packetLoss = 0.0;
                if (temperature > 60) {
                    packetLoss += (temperature - 60) * 1.5;
                }
                if (emi > 50) {
                    packetLoss += (emi - 50) * 0.5;
                }
                if (vibration > 70) {
                    packetLoss += (vibration - 70) * 0.3;
                }
                packetLoss = Math.min(100, packetLoss);
                
                // Пропускная способность
                double throughput = device.getMaxThroughputMbps() != null ? device.getMaxThroughputMbps() : 1000.0;
                throughput = throughput * (1 - packetLoss / 100) * (temperature > 50 ? 0.8 : 1.0);
                
                // Статус устройства
                String status = "OPERATIONAL";
                if (packetLoss > 50 || latency > 500) {
                    status = "FAILED";
                } else if (packetLoss > 20 || latency > 200) {
                    status = "DEGRADED";
                } else if (temperature > 55) {
                    status = "OVERHEATING";
                }
                
                // Критические события
                if (temperature > 65 && t % 30 == 0) {
                    events.add(SimulationResponseDto.CriticalEvent.builder()
                        .timestamp(t)
                        .type("OVERHEAT")
                        .deviceName(source.getCustomName() != null ? source.getCustomName() : device.getName())
                        .message("Температура достигла " + temperature + "°C")
                        .severity(temperature > 75 ? "CRITICAL" : "WARNING")
                        .build());
                }
                
                deviceMetrics.put(source.getId(), SimulationResponseDto.DeviceMetrics.builder()
                    .latencyMs(Math.round(latency * 10) / 10.0)
                    .packetLossPercent(Math.round(packetLoss * 10) / 10.0)
                    .throughputMbps(Math.round(throughput * 10) / 10.0)
                    .status(status)
                    .temperature(temperature)
                    .build());
                
                // Обновляем статистику
                if (latency > maxLatency) {
                    maxLatency = latency;
                    worstDevice = source.getCustomName() != null ? source.getCustomName() : device.getName();
                }
                totalLatency += latency;
                if (packetLoss > maxPacketLoss) maxPacketLoss = packetLoss;
                if (throughput < minThroughput) minThroughput = throughput;
                sampleCount++;
            }
            
            timeline.add(SimulationResponseDto.TimelinePoint.builder()
                .timestamp(t)
                .devices(deviceMetrics)
                .build());
        }
        
        // Формируем сводку
        String grade = calculateGrade(maxLatency, maxPacketLoss, minThroughput);
        
        SimulationResponseDto.Summary summary = SimulationResponseDto.Summary.builder()
            .maxLatencyMs(Math.round(maxLatency * 10) / 10.0)
            .avgLatencyMs(Math.round((totalLatency / sampleCount) * 10) / 10.0)
            .maxPacketLossPercent(Math.round(maxPacketLoss * 10) / 10.0)
            .avgPacketLossPercent(Math.round((maxPacketLoss / 2) * 10) / 10.0)
            .minThroughputMbps(Math.round(minThroughput * 10) / 10.0)
            .maxTemperatureCelsius(temperature)
            .worstDevice(worstDevice)
            .grade(grade)
            .build();
        
        return SimulationResponseDto.builder()
            .id(UUID.randomUUID().toString())
            .name(simulationName)
            .schemaId(schema.getId())
            .schemaName(schema.getName())
            .startedAt(java.time.LocalDateTime.now())
            .finishedAt(java.time.LocalDateTime.now())
            .durationSeconds(durationSeconds)
            .summary(summary)
            .timeline(timeline)
            .criticalEvents(events)
            .build();
    }
    
    private String calculateGrade(double maxLatency, double maxPacketLoss, double minThroughput) {
        if (maxLatency < 50 && maxPacketLoss < 5 && minThroughput > 900) return "A";
        if (maxLatency < 100 && maxPacketLoss < 10 && minThroughput > 800) return "B";
        if (maxLatency < 200 && maxPacketLoss < 20 && minThroughput > 500) return "C";
        if (maxLatency < 500 && maxPacketLoss < 50 && minThroughput > 100) return "D";
        return "F";
    }
}
