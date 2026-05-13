package com.doppelganger.network_digital_twin.service;

import com.doppelganger.network_digital_twin.dto.SimulationResponseDto;
import com.doppelganger.network_digital_twin.entity.*;
import com.doppelganger.network_digital_twin.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class SimulationService {
    
    private static final Logger log = LoggerFactory.getLogger(SimulationService.class);
    
    private final SimulationResultRepository simulationResultRepository;
    private final SchemaRepository schemaRepository;
    private final SchemaNodeRepository schemaNodeRepository;
    private final ConnectionRepository connectionRepository;
    private final FactorNodeRepository factorNodeRepository;  // ← Изменено!
    private final ObjectMapper objectMapper;
    
    public SimulationService(SimulationResultRepository simulationResultRepository,
                              SchemaRepository schemaRepository,
                              SchemaNodeRepository schemaNodeRepository,
                              ConnectionRepository connectionRepository,
                              FactorNodeRepository factorNodeRepository,  // ← Изменено!
                              ObjectMapper objectMapper) {
        this.simulationResultRepository = simulationResultRepository;
        this.schemaRepository = schemaRepository;
        this.schemaNodeRepository = schemaNodeRepository;
        this.connectionRepository = connectionRepository;
        this.factorNodeRepository = factorNodeRepository;
        this.objectMapper = objectMapper;
    }
    
    @Transactional
    public SimulationResponseDto runSimulation(String schemaId, String startNodeId, String endNodeId, 
                                                String name, Integer durationSeconds) {
        log.info("Running simulation for schema: {} from {} to {}", schemaId, startNodeId, endNodeId);
        
        Schema schema = schemaRepository.findById(schemaId)
            .orElseThrow(() -> new RuntimeException("Schema not found"));
        
        SchemaNode startNode = schemaNodeRepository.findById(startNodeId)
            .orElseThrow(() -> new RuntimeException("Start node not found"));
        SchemaNode endNode = schemaNodeRepository.findById(endNodeId)
            .orElseThrow(() -> new RuntimeException("End node not found"));
        
        List<SchemaNode> nodes = schemaNodeRepository.findBySchemaId(schemaId);
        List<Connection> connections = connectionRepository.findBySchemaId(schemaId);
        
        // Получаем промышленные факторы из FactorNodeRepository
        List<FactorNode> factors = factorNodeRepository.findAll();
        Map<String, Double> globalFactors = new HashMap<>();
        
        for (FactorNode factor : factors) {
            globalFactors.put(factor.getFactorType(), factor.getFactorValue());
        }
        
        double temperature = globalFactors.getOrDefault("TEMPERATURE", 25.0);
        double emi = globalFactors.getOrDefault("EMI", 20.0);
        double vibration = globalFactors.getOrDefault("VIBRATION", 10.0);
        
        // Строим граф и находим путь
        Map<String, List<Connection>> adjacencyList = buildAdjacencyList(connections);
        List<String> path = findPath(startNodeId, endNodeId, adjacencyList);
        
        if (path.isEmpty()) {
            throw new RuntimeException("No path found between nodes");
        }
        
        // Симуляция
        List<SimulationResponseDto.TimelinePoint> timeline = new ArrayList<>();
        List<SimulationResponseDto.CriticalEvent> events = new ArrayList<>();
        
        double maxLatency = 0;
        double totalLatency = 0;
        double maxPacketLoss = 0;
        int devicesFailed = 0;
        int step = 5;
        
        for (int t = 0; t <= durationSeconds; t += step) {
            double stepLatency = 0;
            double stepPacketLoss = 0;
            Map<String, SimulationResponseDto.DeviceMetric> deviceMetrics = new HashMap<>();
            
            for (String nodeId : path) {
                SchemaNode node = nodes.stream().filter(n -> n.getId().equals(nodeId)).findFirst().orElse(null);
                if (node == null) continue;
                
                double latency = calculateLatency(node, temperature, emi, vibration, t);
                double packetLoss = calculatePacketLoss(node, temperature, emi, vibration, t);
                
                stepLatency += latency;
                stepPacketLoss = Math.max(stepPacketLoss, packetLoss);
                
                String status = "OPERATIONAL";
                if (packetLoss > 50 || latency > 500) {
                    status = "FAILED";
                    devicesFailed++;
                } else if (packetLoss > 20 || latency > 200) {
                    status = "DEGRADED";
                }
                
                deviceMetrics.put(nodeId, SimulationResponseDto.DeviceMetric.builder()
                    .latencyMs(latency)
                    .packetLossPercent(packetLoss)
                    .throughputMbps(calculateThroughput(node, packetLoss))
                    .temperature(temperature)
                    .status(status)
                    .build());
                
                if (latency > maxLatency) maxLatency = latency;
                totalLatency += latency;
                if (packetLoss > maxPacketLoss) maxPacketLoss = packetLoss;
                
                if (temperature > 60 && t % 30 == 0) {
                    events.add(SimulationResponseDto.CriticalEvent.builder()
                        .timestamp(t)
                        .type("OVERHEAT")
                        .deviceId(nodeId)
                        .deviceName(node.getCustomName() != null ? node.getCustomName() : "Устройство")
                        .message("Температура достигла " + temperature + "°C")
                        .severity(temperature > 75 ? "CRITICAL" : "WARNING")
                        .build());
                }
                
                if (emi > 50 && packetLoss > 30) {
                    events.add(SimulationResponseDto.CriticalEvent.builder()
                        .timestamp(t)
                        .type("EMI_HIGH")
                        .deviceId(nodeId)
                        .deviceName(node.getCustomName() != null ? node.getCustomName() : "Устройство")
                        .message("Высокий уровень ЭМИ: " + emi + " dBm")
                        .severity("WARNING")
                        .build());
                }
            }
            
            timeline.add(SimulationResponseDto.TimelinePoint.builder()
                .timestamp(t)
                .avgLatencyMs(stepLatency / path.size())
                .packetLossPercent(stepPacketLoss)
                .devices(deviceMetrics)
                .build());
        }
        
        double avgLatency = totalLatency / (timeline.size() * path.size());
        String grade = calculateGrade(maxLatency, maxPacketLoss, devicesFailed);
        
        SimulationResponseDto.Summary summary = SimulationResponseDto.Summary.builder()
            .maxLatencyMs(Math.round(maxLatency * 10) / 10.0)
            .avgLatencyMs(Math.round(avgLatency * 10) / 10.0)
            .minLatencyMs(Math.round((maxLatency / 10) * 10) / 10.0)
            .packetLossPercent(Math.round(maxPacketLoss * 10) / 10.0)
            .throughputMbps(calculateAverageThroughput(nodes, maxPacketLoss))
            .devicesFailed(devicesFailed)
            .cablesFailed(0)
            .bottlenecks(findBottlenecks(timeline))
            .recommendation(generateRecommendation(maxLatency, maxPacketLoss, devicesFailed))
            .build();
        
        // Сохраняем результат
        SimulationResult result = new SimulationResult();
        result.setSchema(schema);
        result.setName(name != null ? name : "Симуляция " + LocalDateTime.now());
        result.setStartNodeId(startNodeId);
        result.setStartNodeName(startNode.getCustomName() != null ? startNode.getCustomName() : startNode.getName());
        result.setEndNodeId(endNodeId);
        result.setEndNodeName(endNode.getCustomName() != null ? endNode.getCustomName() : endNode.getName());
        result.setDurationSeconds(durationSeconds);
        result.setGrade(grade);
        result.setScore(calculateScore(maxLatency, maxPacketLoss, devicesFailed));
        
        try {
            result.setSummary(objectMapper.writeValueAsString(summary));
            result.setTimeline(objectMapper.writeValueAsString(timeline));
            result.setEvents(objectMapper.writeValueAsString(events));
        } catch (Exception e) {
            log.error("Failed to serialize simulation results", e);
        }
        
        simulationResultRepository.save(result);
        
        return SimulationResponseDto.builder()
            .id(result.getId())
            .name(result.getName())
            .schemaId(schemaId)
            .schemaName(schema.getName())
            .startNodeId(startNodeId)
            .startNodeName(startNode.getCustomName() != null ? startNode.getCustomName() : startNode.getName())
            .endNodeId(endNodeId)
            .endNodeName(endNode.getCustomName() != null ? endNode.getCustomName() : endNode.getName())
            .durationSeconds(durationSeconds)
            .summary(summary)
            .timeline(timeline)
            .events(events)
            .grade(grade)
            .score(result.getScore())
            .createdAt(result.getCreatedAt().toString())
            .build();
    }
    
    private double calculateLatency(SchemaNode node, double temperature, double emi, double vibration, int time) {
        double baseLatency = 1.0;
        if (node.getDevice() != null && node.getDevice().getBaseLatencyMs() != null) {
            baseLatency = node.getDevice().getBaseLatencyMs();
        }
        
        double tempImpact = 1.0;
        if (temperature > 40) {
            tempImpact = 1.0 + (temperature - 40) * 0.02;
        }
        
        double emiImpact = 1.0;
        if (emi > 30) {
            emiImpact = 1.0 + (emi - 30) * 0.01;
        }
        
        double vibrationImpact = 1.0;
        if (vibration > 50) {
            vibrationImpact = 1.0 + (vibration - 50) * 0.005;
        }
        
        return baseLatency * tempImpact * emiImpact * vibrationImpact;
    }
    
    private double calculatePacketLoss(SchemaNode node, double temperature, double emi, double vibration, int time) {
        double packetLoss = 0.0;
        
        if (temperature > 60) {
            packetLoss += (temperature - 60) * 2.0;
        }
        if (emi > 50) {
            packetLoss += (emi - 50) * 1.0;
        }
        if (vibration > 70) {
            packetLoss += (vibration - 70) * 0.5;
        }
        
        return Math.min(100, packetLoss);
    }
    
    private double calculateThroughput(SchemaNode node, double packetLoss) {
        double maxThroughput = 1000.0;
        if (node.getDevice() != null && node.getDevice().getMaxThroughputMbps() != null) {
            maxThroughput = node.getDevice().getMaxThroughputMbps();
        }
        return maxThroughput * (1 - packetLoss / 100);
    }
    
    private List<String> findBottlenecks(List<SimulationResponseDto.TimelinePoint> timeline) {
        List<String> bottlenecks = new ArrayList<>();
        double maxLatency = timeline.stream()
            .mapToDouble(SimulationResponseDto.TimelinePoint::getAvgLatencyMs)
            .max().orElse(0);
        
        if (maxLatency > 100) {
            bottlenecks.add("Высокая задержка (" + Math.round(maxLatency) + "мс)");
        }
        
        double maxLoss = timeline.stream()
            .mapToDouble(SimulationResponseDto.TimelinePoint::getPacketLossPercent)
            .max().orElse(0);
        
        if (maxLoss > 20) {
            bottlenecks.add("Высокие потери пакетов (" + Math.round(maxLoss) + "%)");
        }
        
        return bottlenecks;
    }
    
    private String generateRecommendation(double maxLatency, double packetLoss, int devicesFailed) {
        if (devicesFailed > 0) {
            return "Рекомендуется проверить охлаждение и экранирование оборудования";
        }
        if (maxLatency > 100) {
            return "Рекомендуется оптимизировать маршрутизацию или увеличить пропускную способность";
        }
        if (packetLoss > 20) {
            return "Рекомендуется усилить экранирование кабелей или снизить уровень помех";
        }
        return "Сеть работает в нормальном режиме";
    }
    
    private String calculateGrade(double maxLatency, double packetLoss, int devicesFailed) {
        if (devicesFailed > 0 || maxLatency > 500 || packetLoss > 50) return "F";
        if (maxLatency > 200 || packetLoss > 20 || devicesFailed > 0) return "D";
        if (maxLatency > 100 || packetLoss > 10) return "C";
        if (maxLatency > 50 || packetLoss > 5) return "B";
        return "A";
    }
    
    private int calculateScore(double maxLatency, double packetLoss, int devicesFailed) {
        int score = 100;
        if (maxLatency > 50) score -= (maxLatency - 50) / 5;
        if (packetLoss > 5) score -= (packetLoss - 5) * 2;
        if (devicesFailed > 0) score -= devicesFailed * 20;
        return Math.max(0, Math.min(100, (int) score));
    }
    
    private double calculateAverageThroughput(List<SchemaNode> nodes, double packetLoss) {
        return nodes.stream()
            .filter(n -> n.getDevice() != null && n.getDevice().getMaxThroughputMbps() != null)
            .mapToDouble(n -> n.getDevice().getMaxThroughputMbps())
            .average()
            .orElse(1000) * (1 - packetLoss / 100);
    }
    
    public List<SimulationResponseDto> getSimulationHistory(String schemaId) {
        List<SimulationResult> results = simulationResultRepository.findBySchemaIdOrderByCreatedAtDesc(schemaId);
        return results.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
    
    private SimulationResponseDto convertToDto(SimulationResult result) {
        try {
            return SimulationResponseDto.builder()
                .id(result.getId())
                .name(result.getName())
                .schemaId(result.getSchema().getId())
                .schemaName(result.getSchema().getName())
                .startNodeId(result.getStartNodeId())
                .startNodeName(result.getStartNodeName())     // Добавить
                .endNodeId(result.getEndNodeId())
                .endNodeName(result.getEndNodeName())         // Добавить
                .durationSeconds(result.getDurationSeconds())
                .grade(result.getGrade())
                .score(result.getScore())
                .createdAt(result.getCreatedAt().toString())
                .summary(objectMapper.readValue(result.getSummary(), SimulationResponseDto.Summary.class))
                .build();
        } catch (Exception e) {
            log.error("Failed to convert simulation result", e);
            return null;
        }
    }

    private Map<String, List<Connection>> buildAdjacencyList(List<Connection> connections) {
        Map<String, List<Connection>> adj = new HashMap<>();
        for (Connection conn : connections) {
            String sourceId = conn.getSourceNode().getId();
            String targetId = conn.getTargetNode().getId();
            adj.computeIfAbsent(sourceId, k -> new ArrayList<>()).add(conn);
            adj.computeIfAbsent(targetId, k -> new ArrayList<>()).add(conn);
        }
        return adj;
    }

    private List<String> findPath(String start, String end, Map<String, List<Connection>> adj) {
        Queue<List<String>> queue = new LinkedList<>();
        Set<String> visited = new HashSet<>();
        
        List<String> startPath = new ArrayList<>();
        startPath.add(start);
        queue.add(startPath);
        visited.add(start);
        
        while (!queue.isEmpty()) {
            List<String> path = queue.poll();
            String last = path.get(path.size() - 1);
            
            if (last.equals(end)) {
                return path;
            }
            
            for (Connection conn : adj.getOrDefault(last, Collections.emptyList())) {
                String next = conn.getSourceNode().getId().equals(last) ? 
                    conn.getTargetNode().getId() : conn.getSourceNode().getId();
                
                if (!visited.contains(next)) {
                    visited.add(next);
                    List<String> newPath = new ArrayList<>(path);
                    newPath.add(next);
                    queue.add(newPath);
                }
            }
        }
        
        return Collections.emptyList();
    }

    public SimulationResponseDto getSimulationResult(String simulationId) {
        log.info("Fetching simulation result: {}", simulationId);
        
        SimulationResult result = simulationResultRepository.findById(simulationId)
            .orElseThrow(() -> new RuntimeException("Simulation result not found"));
        
        try {
            return SimulationResponseDto.builder()
                .id(result.getId())
                .name(result.getName())
                .schemaId(result.getSchema().getId())
                .schemaName(result.getSchema().getName())
                .startNodeId(result.getStartNodeId())
                .startNodeName(result.getStartNodeName())
                .endNodeId(result.getEndNodeId())
                .endNodeName(result.getEndNodeName())
                .durationSeconds(result.getDurationSeconds())
                .grade(result.getGrade())
                .score(result.getScore())
                .createdAt(result.getCreatedAt().toString())
                .summary(objectMapper.readValue(result.getSummary(), SimulationResponseDto.Summary.class))
                .timeline(objectMapper.readValue(result.getTimeline(), 
                    new com.fasterxml.jackson.core.type.TypeReference<List<SimulationResponseDto.TimelinePoint>>() {}))
                .events(objectMapper.readValue(result.getEvents(),
                    new com.fasterxml.jackson.core.type.TypeReference<List<SimulationResponseDto.CriticalEvent>>() {}))
                .build();
        } catch (Exception e) {
            log.error("Failed to deserialize simulation result", e);
            throw new RuntimeException("Failed to get simulation result", e);
        }
    }
}
