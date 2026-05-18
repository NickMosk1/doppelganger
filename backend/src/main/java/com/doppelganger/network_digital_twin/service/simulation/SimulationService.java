package com.doppelganger.network_digital_twin.service.simulation;

import com.doppelganger.network_digital_twin.dto.SimulationResponseDto;
import com.doppelganger.network_digital_twin.dto.SimulationResponseDto.CriticalEvent;
import com.doppelganger.network_digital_twin.dto.SimulationResponseDto.DeviceMetric;
import com.doppelganger.network_digital_twin.dto.SimulationResponseDto.Summary;
import com.doppelganger.network_digital_twin.dto.SimulationResponseDto.TimelinePoint;
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
    private final FactorNodeRepository factorNodeRepository;
    private final ObjectMapper objectMapper;
    
    public SimulationService(SimulationResultRepository simulationResultRepository,
                              SchemaRepository schemaRepository,
                              SchemaNodeRepository schemaNodeRepository,
                              ConnectionRepository connectionRepository,
                              FactorNodeRepository factorNodeRepository,
                              ObjectMapper objectMapper) {
        this.simulationResultRepository = simulationResultRepository;
        this.schemaRepository = schemaRepository;
        this.schemaNodeRepository = schemaNodeRepository;
        this.connectionRepository = connectionRepository;
        this.factorNodeRepository = factorNodeRepository;
        this.objectMapper = objectMapper;
    }
    
    @Transactional
    public SimulationResponseDto runSimulation(String schemaId, String startNodeId, 
                                                String endNodeId, String name, 
                                                Integer durationSeconds) {
        
        log.info("Starting simulation for schema: {}, from {} to {}", schemaId, startNodeId, endNodeId);
        
        Schema schema = schemaRepository.findById(schemaId)
            .orElseThrow(() -> new RuntimeException("Schema not found"));
        
        List<SchemaNode> allNodes = schemaNodeRepository.findBySchemaId(schemaId);
        List<Connection> allConnections = connectionRepository.findBySchemaId(schemaId);
        
        // Строим граф и находим путь
        Map<String, List<Connection>> adjacencyList = buildAdjacencyList(allConnections);
        List<String> path = findPath(startNodeId, endNodeId, adjacencyList);
        
        if (path.isEmpty()) {
            throw new RuntimeException("No path found between nodes");
        }
        
        log.info("Found path with {} nodes: {}", path.size(), path);
        
        // Получаем факторы и характеристики
        Map<String, List<FactorImpact>> factorImpacts = buildFactorImpacts(allNodes, allConnections);
        Map<String, ElementSpecs> elementSpecs = buildElementSpecs(allNodes);
        
        // Создаем контекст симуляции
        SimulationContext ctx = new SimulationContext();
        ctx.setSchemaId(schemaId);
        ctx.setSchemaName(schema.getName());
        ctx.setStartNodeId(startNodeId);
        ctx.setEndNodeId(endNodeId);
        ctx.setPath(path);
        ctx.setAllNodes(allNodes);
        ctx.setFactorImpacts(factorImpacts);
        ctx.setElementSpecs(elementSpecs);
        ctx.setDurationSeconds(durationSeconds != null ? durationSeconds : 60);
        ctx.setStepSeconds(5);
        
        // Запускаем симуляцию
        SimulationResultData resultData = runDynamicSimulation(ctx);
        
        // Сохраняем результат
        SimulationResult saved = saveSimulationResult(schema, startNodeId, endNodeId, name, durationSeconds, resultData);
        
        // Формируем ответ
        return buildResponseDto(saved, resultData);
    }
    
    private Map<String, List<Connection>> buildAdjacencyList(List<Connection> connections) {
        Map<String, List<Connection>> adj = new HashMap<>();
        for (Connection conn : connections) {
            if (conn.getConnectionType() == Connection.ConnectionType.CABLE_DEVICE) {
                String sourceId = conn.getSourceNode().getId();
                String targetId = conn.getTargetNode().getId();
                adj.computeIfAbsent(sourceId, k -> new ArrayList<>()).add(conn);
                adj.computeIfAbsent(targetId, k -> new ArrayList<>()).add(conn);
            }
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
    
    private Map<String, List<FactorImpact>> buildFactorImpacts(List<SchemaNode> nodes, List<Connection> connections) {
        Map<String, List<FactorImpact>> impacts = new HashMap<>();
        
        Map<String, SchemaNode> factorNodes = nodes.stream()
            .filter(n -> n.getNodeType() == SchemaNode.NodeType.FACTOR)
            .collect(Collectors.toMap(SchemaNode::getId, n -> n));
        
        for (Connection conn : connections) {
            if (conn.getConnectionType() == Connection.ConnectionType.FACTOR_ELEMENT) {
                String elementId = conn.getTargetNode().getId();
                String factorId = conn.getSourceNode().getId();
                SchemaNode factorNode = factorNodes.get(factorId);
                
                if (factorNode != null) {
                    FactorImpact impact = new FactorImpact();
                    impact.setFactorId(factorId);
                    impact.setFactorType(factorNode.getFactorType());
                    impact.setFactorValue(factorNode.getFactorValue() != null ? factorNode.getFactorValue() : 0.0);
                    impact.setDistance(conn.getDistance() != null ? conn.getDistance() : 0.0);
                    impact.setAttenuation(conn.getAttenuation() != null ? conn.getAttenuation() : 1.0);
                    impact.setRadius(factorNode.getFactorRadius() != null ? factorNode.getFactorRadius() : 10.0);
                    
                    impacts.computeIfAbsent(elementId, k -> new ArrayList<>()).add(impact);
                    log.debug("Factor {} affects element {} with value {}", factorNode.getFactorType(), elementId, impact.getFactorValue());
                }
            }
        }
        
        return impacts;
    }
    
    private Map<String, ElementSpecs> buildElementSpecs(List<SchemaNode> nodes) {
        Map<String, ElementSpecs> specs = new HashMap<>();
        
        for (SchemaNode node : nodes) {
            ElementSpecs spec = new ElementSpecs();
            spec.setNodeId(node.getId());
            spec.setNodeName(node.getCustomName() != null ? node.getCustomName() : node.getName());
            spec.setNodeType(node.getNodeType());
            
            if (node.getNodeType() == SchemaNode.NodeType.DEVICE && node.getDevice() != null) {
                Device device = node.getDevice();
                spec.setBaseLatencyMs(device.getBaseLatencyMs() != null ? device.getBaseLatencyMs() : 1.0);
                spec.setMaxThroughputMbps(device.getMaxThroughputMbps() != null ? device.getMaxThroughputMbps() : 1000);
                spec.setTempCoefficient(device.getTempCoefficient() != null ? device.getTempCoefficient() : 1.0);
                spec.setEmiCoefficient(device.getEmiCoefficient() != null ? device.getEmiCoefficient() : 1.0);
                spec.setVibrationCoefficient(device.getVibrationCoefficient() != null ? device.getVibrationCoefficient() : 1.0);
                spec.setDustCoefficient(device.getDustCoefficient() != null ? device.getDustCoefficient() : 1.0);
            }
            
            if (node.getNodeType() == SchemaNode.NodeType.CABLE) {
                spec.setCableLengthM(node.getCableLengthM() != null ? node.getCableLengthM() : 10.0);
                spec.setCableType(node.getCableType());
                spec.setBandwidthMbps(node.getBandwidthMbps() != null ? node.getBandwidthMbps() : 1000.0);
                spec.setImmunityRating(5);
                spec.setShieldingType(0);
                spec.setAttenuationDbPerKm(0.5);
            }
            
            specs.put(node.getId(), spec);
        }
        
        return specs;
    }
    
    private SimulationResultData runDynamicSimulation(SimulationContext ctx) {
        
        List<TimelinePoint> timeline = new ArrayList<>();
        List<CriticalEvent> events = new ArrayList<>();
        Map<String, DeviceState> deviceStates = new HashMap<>();
        Map<String, CableState> cableStates = new HashMap<>();
        
        // Инициализация
        for (String nodeId : ctx.getPath()) {
            ElementSpecs specs = ctx.getElementSpecs().get(nodeId);
            if (specs != null) {
                if (specs.getNodeType() == SchemaNode.NodeType.DEVICE) {
                    deviceStates.put(nodeId, new DeviceState(nodeId, specs));
                } else if (specs.getNodeType() == SchemaNode.NodeType.CABLE) {
                    cableStates.put(nodeId, new CableState(nodeId, specs));
                }
            }
        }
        
        // Симуляция по времени
        Map<String, Double> previousFactors = new HashMap<>();
        
        for (int t = 0; t <= ctx.getDurationSeconds(); t += ctx.getStepSeconds()) {
            
            Map<String, Double> currentFactors = getCurrentFactors(ctx, t, previousFactors);
            previousFactors = currentFactors;
            
            Map<String, DeviceMetric> deviceMetrics = new HashMap<>();
            double totalLatency = 0;
            double maxPacketLoss = 0;
            
            for (String nodeId : ctx.getPath()) {
                ElementSpecs specs = ctx.getElementSpecs().get(nodeId);
                if (specs == null) continue;
                
                List<FactorImpact> impacts = ctx.getFactorImpacts().getOrDefault(nodeId, new ArrayList<>());
                
                if (specs.getNodeType() == SchemaNode.NodeType.DEVICE) {
                    DeviceState state = deviceStates.get(nodeId);
                    DeviceMetric metric = calculateDeviceMetrics(specs, impacts, currentFactors, t, state);
                    deviceMetrics.put(nodeId, metric);
                    totalLatency += metric.getLatencyMs();
                    maxPacketLoss = Math.max(maxPacketLoss, metric.getPacketLossPercent());
                    
                    generateDeviceEvents(nodeId, specs, metric, t, events);
                    
                    if (state != null) {
                        state.setLastLatency(metric.getLatencyMs());
                        state.setLastPacketLoss(metric.getPacketLossPercent());
                        state.setLastThroughput(metric.getThroughputMbps());
                    }
                    
                } else if (specs.getNodeType() == SchemaNode.NodeType.CABLE) {
                    CableState state = cableStates.get(nodeId);
                    CableMetric metric = calculateCableMetrics(specs, impacts, currentFactors, t, state);
                    
                    totalLatency += metric.getLatencyMs();
                    maxPacketLoss = Math.max(maxPacketLoss, metric.getPacketLossPercent());
                    
                    generateCableEvents(nodeId, specs, metric, t, events);
                    
                    if (state != null) {
                        state.setLastLatency(metric.getLatencyMs());
                        state.setLastPacketLoss(metric.getPacketLossPercent());
                        state.setLastThroughput(metric.getThroughputMbps());
                        state.setDegraded(metric.getPacketLossPercent() > 20);
                        state.setFailed(metric.getPacketLossPercent() > 80);
                    }
                }
            }
            
            timeline.add(TimelinePoint.builder()
                .timestamp(t)
                .avgLatencyMs(totalLatency / ctx.getPath().size())
                .packetLossPercent(maxPacketLoss)
                .devices(deviceMetrics)
                .build());
        }
        
        SimulationResultData resultData = new SimulationResultData();
        resultData.setTimeline(timeline);
        resultData.setEvents(events);
        resultData.setDeviceStates(deviceStates);
        resultData.setCableStates(cableStates);
        
        return resultData;
    }
    
    private Map<String, Double> getCurrentFactors(SimulationContext ctx, int time, Map<String, Double> previous) {
        Map<String, Double> factors = new HashMap<>();
        
        for (SchemaNode node : ctx.getAllNodes()) {
            if (node.getNodeType() == SchemaNode.NodeType.FACTOR && node.getFactorType() != null) {
                String factorType = node.getFactorType().toUpperCase();
                double currentValue = node.getFactorValue() != null ? node.getFactorValue() : 0.0;
                
                Double previousValue = previous.get(factorType);
                if (previousValue != null && Math.abs(previousValue - currentValue) > 0.1) {
                    log.debug("Factor {} changed from {} to {} at time {}", factorType, previousValue, currentValue, time);
                }
                
                factors.put(factorType, currentValue);
            }
        }
        
        factors.putIfAbsent("TEMPERATURE", 25.0);
        factors.putIfAbsent("EMI", 20.0);
        factors.putIfAbsent("VIBRATION", 10.0);
        factors.putIfAbsent("DUST", 5.0);
        
        return factors;
    }
    
    private DeviceMetric calculateDeviceMetrics(ElementSpecs specs, List<FactorImpact> impacts,
                                                 Map<String, Double> globalFactors, int time, DeviceState state) {
        
        double latency = specs.getBaseLatencyMs();
        double packetLoss = 0.0;
        double throughput = specs.getMaxThroughputMbps();
        
        for (FactorImpact impact : impacts) {
            double effectiveValue = impact.getFactorValue();
            
            if (impact.getDistance() > 0 && impact.getRadius() > 0) {
                double distanceFactor = Math.max(0, 1 - (impact.getDistance() / impact.getRadius()));
                effectiveValue *= distanceFactor;
            }
            
            effectiveValue *= impact.getAttenuation();
            
            switch (impact.getFactorType().toUpperCase()) {
                case "TEMPERATURE":
                    double tempImpact = effectiveValue * specs.getTempCoefficient();
                    if (tempImpact > 40) {
                        latency *= (1 + (tempImpact - 40) * 0.03);
                        packetLoss += (tempImpact - 40) * 1.5;
                    }
                    if (tempImpact > 70 && state != null) {
                        state.setFailed(true);
                        packetLoss = 100;
                    }
                    break;
                    
                case "EMI":
                    double emiImpact = effectiveValue * specs.getEmiCoefficient();
                    if (emiImpact > 30) {
                        latency *= (1 + (emiImpact - 30) * 0.02);
                        packetLoss += (emiImpact - 30) * 2.0;
                    }
                    if (emiImpact > 80) {
                        packetLoss = 100;
                    }
                    break;
                    
                case "VIBRATION":
                    double vibImpact = effectiveValue * specs.getVibrationCoefficient();
                    if (vibImpact > 50) {
                        packetLoss += (vibImpact - 50) * 1.0;
                        latency += Math.random() * (vibImpact - 50) * 0.1;
                    }
                    break;
                    
                case "DUST":
                    double dustImpact = effectiveValue * specs.getDustCoefficient();
                    if (dustImpact > 30) {
                        throughput *= (1 - dustImpact / 100);
                        packetLoss += dustImpact * 0.5;
                    }
                    break;
            }
        }
        
        Double globalTemp = globalFactors.getOrDefault("TEMPERATURE", 25.0);
        if (globalTemp > 40) {
            packetLoss += (globalTemp - 40) * 0.5;
        }
        
        packetLoss = Math.min(100, packetLoss);
        throughput = throughput * (1 - packetLoss / 100);
        
        String status = packetLoss > 80 ? "FAILED" : (packetLoss > 20 ? "DEGRADED" : "OPERATIONAL");
        
        return DeviceMetric.builder()
            .latencyMs(Math.round(latency * 10) / 10.0)
            .packetLossPercent(Math.round(packetLoss * 10) / 10.0)
            .throughputMbps((double) Math.round(throughput))
            .temperature(globalTemp)
            .status(status)
            .build();
    }
    
    private CableMetric calculateCableMetrics(ElementSpecs specs, List<FactorImpact> impacts,
                                               Map<String, Double> globalFactors, int time, CableState state) {
        
        double latency = specs.getCableLengthM() / 200000.0 * 1000;
        double packetLoss = 0.0;
        double ber = 0.0;
        double attenuation = specs.getAttenuationDbPerKm() * (specs.getCableLengthM() / 1000.0);
        
        for (FactorImpact impact : impacts) {
            double effectiveValue = impact.getFactorValue();
            
            if (impact.getDistance() > 0 && impact.getRadius() > 0) {
                double distanceFactor = Math.max(0, 1 - (impact.getDistance() / impact.getRadius()));
                effectiveValue *= distanceFactor;
            }
            
            effectiveValue *= impact.getAttenuation();
            
            switch (impact.getFactorType().toUpperCase()) {
                case "TEMPERATURE":
                    if (effectiveValue > 50) {
                        attenuation *= (1 + (effectiveValue - 50) * 0.05);
                        packetLoss += (effectiveValue - 50) * 0.5;
                    }
                    if (effectiveValue > 85 && state != null) {
                        state.setFailed(true);
                        packetLoss = 100;
                    }
                    break;
                    
                case "EMI":
                    double shieldingFactor = getShieldingFactor(specs.getShieldingType());
                    double effectiveEMI = effectiveValue / shieldingFactor;
                    
                    if (effectiveEMI > 40) {
                        ber = calculateBER(effectiveEMI, specs.getImmunityRating());
                        packetLoss = ber * 100;
                        latency *= (1 + effectiveEMI / 100);
                    }
                    break;
                    
                case "VIBRATION":
                    if (effectiveValue > 60) {
                        packetLoss += (effectiveValue - 60) * 1.5;
                        latency += effectiveValue * 0.05;
                    }
                    break;
            }
        }
        
        if (specs.getCableLengthM() > 100) {
            packetLoss += (specs.getCableLengthM() - 100) * 0.1;
        }
        
        packetLoss = Math.min(100, packetLoss);
        double throughput = specs.getBandwidthMbps() * (1 - packetLoss / 100);
        
        if (packetLoss > 10 && state != null && !state.isProblemDetected()) {
            state.setProblemDetected(true);
            state.setProblemCause(getCableProblemCause(impacts, packetLoss));
        }
        
        return CableMetric.builder()
            .latencyMs(Math.round(latency * 10) / 10.0)
            .packetLossPercent(Math.round(packetLoss * 10) / 10.0)
            .throughputMbps((double) Math.round(throughput))
            .bitErrorRate(ber)
            .attenuationDb(attenuation)
            .build();
    }
    
    private void generateDeviceEvents(String nodeId, ElementSpecs specs, DeviceMetric metric,
                                       int time, List<CriticalEvent> events) {
        
        if (metric.getPacketLossPercent() > 80) {
            events.add(CriticalEvent.builder()
                .timestamp(time)
                .type("DEVICE_FAILURE")
                .deviceId(nodeId)
                .deviceName(specs.getNodeName())
                .message(String.format("Устройство '%s' вышло из строя (потери пакетов: %.1f%%)", 
                    specs.getNodeName(), metric.getPacketLossPercent()))
                .severity("CRITICAL")
                .build());
        }
        
        if (metric.getLatencyMs() > 200) {
            events.add(CriticalEvent.builder()
                .timestamp(time)
                .type("HIGH_LATENCY")
                .deviceId(nodeId)
                .deviceName(specs.getNodeName())
                .message(String.format("Задержка на '%s' достигла %.1f мс", 
                    specs.getNodeName(), metric.getLatencyMs()))
                .severity("WARNING")
                .build());
        }
    }
    
    private void generateCableEvents(String nodeId, ElementSpecs specs, CableMetric metric,
                                      int time, List<CriticalEvent> events) {
        
        if (metric.getPacketLossPercent() > 50) {
            String cause = analyzeCableDegradationCause(specs, metric);
            
            events.add(CriticalEvent.builder()
                .timestamp(time)
                .type("CABLE_DEGRADATION")
                .deviceId(nodeId)
                .deviceName(specs.getNodeName())
                .message(String.format("Кабель '%s' деградировал: %s. Потери: %.1f%%. Рекомендация: %s", 
                    specs.getNodeName(), cause, metric.getPacketLossPercent(), 
                    generateCableRecommendation(specs, metric)))
                .severity(metric.getPacketLossPercent() > 80 ? "CRITICAL" : "WARNING")
                .build());
        }
    }
    
    private String analyzeCableDegradationCause(ElementSpecs specs, CableMetric metric) {
        List<String> causes = new ArrayList<>();
        
        if (specs.getShieldingType() == 0 && metric.getBitErrorRate() > 0.01) {
            causes.add("отсутствует экранирование");
        }
        
        if (specs.getCableLengthM() > 100) {
            causes.add(String.format("длина кабеля %.0fм превышает норму", specs.getCableLengthM()));
        }
        
        if (metric.getAttenuationDb() > 20) {
            causes.add("высокое затухание сигнала");
        }
        
        return causes.isEmpty() ? "воздействие внешних факторов" : String.join(", ", causes);
    }
    
    private String generateCableRecommendation(ElementSpecs specs, CableMetric metric) {
        List<String> recommendations = new ArrayList<>();
        
        if (specs.getShieldingType() == 0 && metric.getBitErrorRate() > 0.01) {
            recommendations.add("Замените кабель на экранированный (FTP/SFTP)");
        }
        
        if (specs.getCableLengthM() > 100) {
            recommendations.add("Уменьшите длину кабеля или используйте оптику");
        }
        
        if (metric.getAttenuationDb() > 20) {
            recommendations.add("Используйте кабель с меньшим затуханием");
        }
        
        return recommendations.isEmpty() ? "Проведите диагностику кабеля" : String.join("; ", recommendations);
    }
    
    private String getCableProblemCause(List<FactorImpact> impacts, double packetLoss) {
        List<String> causes = new ArrayList<>();
        for (FactorImpact impact : impacts) {
            switch (impact.getFactorType().toUpperCase()) {
                case "EMI": causes.add("электромагнитные помехи"); break;
                case "TEMPERATURE": causes.add("перегрев"); break;
                case "VIBRATION": causes.add("вибрация"); break;
            }
        }
        return causes.isEmpty() ? "внешние факторы" : String.join(", ", causes);
    }
    
    private double getShieldingFactor(Integer shieldingType) {
        if (shieldingType == null) return 1.0;
        switch (shieldingType) {
            case 1: return 2.0;
            case 2: return 5.0;
            case 3: return 10.0;
            default: return 1.0;
        }
    }
    
    private double calculateBER(double emiValue, Integer immunityRating) {
        double immunity = immunityRating != null ? immunityRating : 5;
        double snr = Math.max(0, 30 - emiValue / immunity * 10);
        return Math.pow(10, -snr / 10);
    }
    
    private SimulationResult saveSimulationResult(Schema schema, String startNodeId, String endNodeId,
                                                   String name, Integer durationSeconds,
                                                   SimulationResultData resultData) {
        
        String startNodeName = "";
        String endNodeName = "";
        
        try {
            startNodeName = schemaNodeRepository.findById(startNodeId)
                .map(n -> n.getCustomName() != null ? n.getCustomName() : n.getName())
                .orElse("");
            endNodeName = schemaNodeRepository.findById(endNodeId)
                .map(n -> n.getCustomName() != null ? n.getCustomName() : n.getName())
                .orElse("");
        } catch (Exception e) {
            log.warn("Could not fetch node names", e);
        }
        
        double maxLatency = resultData.getTimeline().stream()
            .mapToDouble(TimelinePoint::getAvgLatencyMs)
            .max().orElse(0);
        double avgLatency = resultData.getTimeline().stream()
            .mapToDouble(TimelinePoint::getAvgLatencyMs)
            .average().orElse(0);
        double avgPacketLoss = resultData.getTimeline().stream()
            .mapToDouble(TimelinePoint::getPacketLossPercent)
            .average().orElse(0);
        
        String grade = calculateGradeWithFactors(avgPacketLoss, resultData.getEvents().size());
        int score = calculateScore(avgPacketLoss, resultData.getEvents().size());
        
        List<String> bottlenecks = findBottlenecks(resultData.getTimeline(), resultData.getEvents());
        
        Summary summary = Summary.builder()
            .maxLatencyMs(maxLatency)
            .avgLatencyMs(avgLatency)
            .packetLossPercent(avgPacketLoss)
            .throughputMbps(calculateAverageThroughputFromTimeline(resultData.getTimeline()))
            .devicesFailed((int) resultData.getDeviceStates().values().stream().filter(DeviceState::isFailed).count())
            .cablesFailed((int) resultData.getCableStates().values().stream().filter(CableState::isFailed).count())
            .bottlenecks(bottlenecks)
            .recommendation(buildRecommendation(resultData))
            .build();
        
        SimulationResult result = new SimulationResult();
        result.setSchema(schema);
        result.setName(name != null ? name : "Симуляция " + LocalDateTime.now());
        result.setStartNodeId(startNodeId);
        result.setStartNodeName(startNodeName);
        result.setEndNodeId(endNodeId);
        result.setEndNodeName(endNodeName);
        result.setDurationSeconds(durationSeconds != null ? durationSeconds : 60);
        result.setGrade(grade);
        result.setScore(score);
        
        try {
            result.setSummary(objectMapper.writeValueAsString(summary));
            result.setTimeline(objectMapper.writeValueAsString(resultData.getTimeline()));
            result.setEvents(objectMapper.writeValueAsString(resultData.getEvents()));
        } catch (Exception e) {
            log.error("Failed to serialize simulation results", e);
        }
        
        return simulationResultRepository.save(result);
    }
    
    private String buildRecommendation(SimulationResultData resultData) {
        List<String> recommendations = new ArrayList<>();
        
        for (DeviceState state : resultData.getDeviceStates().values()) {
            if (state.getLastPacketLoss() > 20) {
                recommendations.add(String.format(
                    "⚠️ Устройство '%s': потери пакетов %.1f%%. Проверьте охлаждение и экранирование",
                    state.getNodeName(), state.getLastPacketLoss()
                ));
            }
        }
        
        for (CableState state : resultData.getCableStates().values()) {
            if (state.isProblemDetected()) {
                recommendations.add(String.format(
                    "🔌 Кабель '%s': %s. Рекомендуется замена на экранированную версию",
                    state.getNodeName(), state.getProblemCause()
                ));
            }
        }
        
        if (recommendations.isEmpty()) {
            recommendations.add("Сеть работает в нормальном режиме");
        }
        
        return String.join("\n", recommendations);
    }
    
    private List<String> findBottlenecks(List<TimelinePoint> timeline, List<CriticalEvent> events) {
        List<String> bottlenecks = new ArrayList<>();
        
        double maxLatency = timeline.stream()
            .mapToDouble(TimelinePoint::getAvgLatencyMs)
            .max().orElse(0);
        
        if (maxLatency > 100) {
            bottlenecks.add("Высокая задержка (" + Math.round(maxLatency) + " мс)");
        }
        
        double maxLoss = timeline.stream()
            .mapToDouble(TimelinePoint::getPacketLossPercent)
            .max().orElse(0);
        
        if (maxLoss > 20) {
            bottlenecks.add("Высокие потери пакетов (" + Math.round(maxLoss) + "%)");
        }
        
        long criticalEvents = events.stream()
            .filter(e -> "CRITICAL".equals(e.getSeverity()))
            .count();
        
        if (criticalEvents > 0) {
            bottlenecks.add(criticalEvents + " критических событий");
        }
        
        return bottlenecks;
    }
    
    private double calculateAverageThroughputFromTimeline(List<TimelinePoint> timeline) {
        return timeline.stream()
            .flatMap(t -> t.getDevices().values().stream())
            .mapToDouble(DeviceMetric::getThroughputMbps)
            .average()
            .orElse(1000.0);
    }
    
    private String calculateGradeWithFactors(double avgPacketLoss, int eventsCount) {
        if (avgPacketLoss > 50 || eventsCount > 5) return "F";
        if (avgPacketLoss > 20 || eventsCount > 2) return "D";
        if (avgPacketLoss > 10 || eventsCount > 0) return "C";
        if (avgPacketLoss > 5) return "B";
        return "A";
    }
    
    private int calculateScore(double avgPacketLoss, int eventsCount) {
        int score = 100;
        score -= avgPacketLoss * 1.5;
        score -= eventsCount * 10;
        return Math.max(0, Math.min(100, (int) score));
    }
    
    private SimulationResponseDto buildResponseDto(SimulationResult result, SimulationResultData resultData) {
        try {
            Summary summary = objectMapper.readValue(result.getSummary(), Summary.class);
            
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
                .summary(summary)
                .timeline(resultData.getTimeline())
                .events(resultData.getEvents())
                .grade(result.getGrade())
                .score(result.getScore())
                .createdAt(result.getCreatedAt().toString())
                .build();
        } catch (Exception e) {
            log.error("Failed to build response DTO", e);
            throw new RuntimeException("Failed to build response", e);
        }
    }
    
    public List<SimulationResponseDto> getSimulationHistory(String schemaId) {
        List<SimulationResult> results = simulationResultRepository.findBySchemaIdOrderByCreatedAtDesc(schemaId);
        return results.stream()
            .map(this::convertToDto)
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }
    
    public SimulationResponseDto getSimulationResult(String simulationId) {
        SimulationResult result = simulationResultRepository.findById(simulationId)
            .orElseThrow(() -> new RuntimeException("Simulation result not found"));
        return convertToDto(result);
    }
    
    private SimulationResponseDto convertToDto(SimulationResult result) {
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
                .summary(objectMapper.readValue(result.getSummary(), Summary.class))
                .timeline(objectMapper.readValue(result.getTimeline(),
                    new com.fasterxml.jackson.core.type.TypeReference<List<TimelinePoint>>() {}))
                .events(objectMapper.readValue(result.getEvents(),
                    new com.fasterxml.jackson.core.type.TypeReference<List<CriticalEvent>>() {}))
                .build();
        } catch (Exception e) {
            log.error("Failed to convert simulation result to DTO", e);
            return null;
        }
    }
    
    // ==================== ВНУТРЕННИЕ КЛАССЫ ====================
    
    static class SimulationContext {
        private String schemaId;
        private String schemaName;
        private String startNodeId;
        private String endNodeId;
        private List<String> path;
        private List<SchemaNode> allNodes;
        private Map<String, List<FactorImpact>> factorImpacts;
        private Map<String, ElementSpecs> elementSpecs;
        private Integer durationSeconds;
        private Integer stepSeconds;
        
        // Getters and Setters
        public String getSchemaId() { return schemaId; }
        public void setSchemaId(String schemaId) { this.schemaId = schemaId; }
        public String getSchemaName() { return schemaName; }
        public void setSchemaName(String schemaName) { this.schemaName = schemaName; }
        public String getStartNodeId() { return startNodeId; }
        public void setStartNodeId(String startNodeId) { this.startNodeId = startNodeId; }
        public String getEndNodeId() { return endNodeId; }
        public void setEndNodeId(String endNodeId) { this.endNodeId = endNodeId; }
        public List<String> getPath() { return path; }
        public void setPath(List<String> path) { this.path = path; }
        public List<SchemaNode> getAllNodes() { return allNodes; }
        public void setAllNodes(List<SchemaNode> allNodes) { this.allNodes = allNodes; }
        public Map<String, List<FactorImpact>> getFactorImpacts() { return factorImpacts; }
        public void setFactorImpacts(Map<String, List<FactorImpact>> factorImpacts) { this.factorImpacts = factorImpacts; }
        public Map<String, ElementSpecs> getElementSpecs() { return elementSpecs; }
        public void setElementSpecs(Map<String, ElementSpecs> elementSpecs) { this.elementSpecs = elementSpecs; }
        public Integer getDurationSeconds() { return durationSeconds; }
        public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }
        public Integer getStepSeconds() { return stepSeconds; }
        public void setStepSeconds(Integer stepSeconds) { this.stepSeconds = stepSeconds; }
    }
    
    static class SimulationResultData {
        private List<TimelinePoint> timeline = new ArrayList<>();
        private List<CriticalEvent> events = new ArrayList<>();
        private Map<String, DeviceState> deviceStates = new HashMap<>();
        private Map<String, CableState> cableStates = new HashMap<>();
        
        public List<TimelinePoint> getTimeline() { return timeline; }
        public void setTimeline(List<TimelinePoint> timeline) { this.timeline = timeline; }
        public List<CriticalEvent> getEvents() { return events; }
        public void setEvents(List<CriticalEvent> events) { this.events = events; }
        public Map<String, DeviceState> getDeviceStates() { return deviceStates; }
        public void setDeviceStates(Map<String, DeviceState> deviceStates) { this.deviceStates = deviceStates; }
        public Map<String, CableState> getCableStates() { return cableStates; }
        public void setCableStates(Map<String, CableState> cableStates) { this.cableStates = cableStates; }
    }
    
    static class FactorImpact {
        private String factorId;
        private String factorType;
        private Double factorValue;
        private Double distance;
        private Double attenuation;
        private Double radius;
        
        // Getters and Setters
        public String getFactorId() { return factorId; }
        public void setFactorId(String factorId) { this.factorId = factorId; }
        public String getFactorType() { return factorType; }
        public void setFactorType(String factorType) { this.factorType = factorType; }
        public Double getFactorValue() { return factorValue; }
        public void setFactorValue(Double factorValue) { this.factorValue = factorValue; }
        public Double getDistance() { return distance; }
        public void setDistance(Double distance) { this.distance = distance; }
        public Double getAttenuation() { return attenuation; }
        public void setAttenuation(Double attenuation) { this.attenuation = attenuation; }
        public Double getRadius() { return radius; }
        public void setRadius(Double radius) { this.radius = radius; }
    }
    
    static class ElementSpecs {
        private String nodeId;
        private String nodeName;
        private SchemaNode.NodeType nodeType;
        private Double baseLatencyMs;
        private Integer maxThroughputMbps;
        private Double tempCoefficient;
        private Double emiCoefficient;
        private Double vibrationCoefficient;
        private Double dustCoefficient;
        private Double cableLengthM;
        private String cableType;
        private Double bandwidthMbps;
        private Integer immunityRating;
        private Integer shieldingType;
        private Double attenuationDbPerKm;
        
        // Getters and Setters
        public String getNodeId() { return nodeId; }
        public void setNodeId(String nodeId) { this.nodeId = nodeId; }
        public String getNodeName() { return nodeName; }
        public void setNodeName(String nodeName) { this.nodeName = nodeName; }
        public SchemaNode.NodeType getNodeType() { return nodeType; }
        public void setNodeType(SchemaNode.NodeType nodeType) { this.nodeType = nodeType; }
        public Double getBaseLatencyMs() { return baseLatencyMs; }
        public void setBaseLatencyMs(Double baseLatencyMs) { this.baseLatencyMs = baseLatencyMs; }
        public Integer getMaxThroughputMbps() { return maxThroughputMbps; }
        public void setMaxThroughputMbps(Integer maxThroughputMbps) { this.maxThroughputMbps = maxThroughputMbps; }
        public Double getTempCoefficient() { return tempCoefficient; }
        public void setTempCoefficient(Double tempCoefficient) { this.tempCoefficient = tempCoefficient; }
        public Double getEmiCoefficient() { return emiCoefficient; }
        public void setEmiCoefficient(Double emiCoefficient) { this.emiCoefficient = emiCoefficient; }
        public Double getVibrationCoefficient() { return vibrationCoefficient; }
        public void setVibrationCoefficient(Double vibrationCoefficient) { this.vibrationCoefficient = vibrationCoefficient; }
        public Double getDustCoefficient() { return dustCoefficient; }
        public void setDustCoefficient(Double dustCoefficient) { this.dustCoefficient = dustCoefficient; }
        public Double getCableLengthM() { return cableLengthM; }
        public void setCableLengthM(Double cableLengthM) { this.cableLengthM = cableLengthM; }
        public String getCableType() { return cableType; }
        public void setCableType(String cableType) { this.cableType = cableType; }
        public Double getBandwidthMbps() { return bandwidthMbps; }
        public void setBandwidthMbps(Double bandwidthMbps) { this.bandwidthMbps = bandwidthMbps; }
        public Integer getImmunityRating() { return immunityRating; }
        public void setImmunityRating(Integer immunityRating) { this.immunityRating = immunityRating; }
        public Integer getShieldingType() { return shieldingType; }
        public void setShieldingType(Integer shieldingType) { this.shieldingType = shieldingType; }
        public Double getAttenuationDbPerKm() { return attenuationDbPerKm; }
        public void setAttenuationDbPerKm(Double attenuationDbPerKm) { this.attenuationDbPerKm = attenuationDbPerKm; }
    }
    
    static class DeviceState {
        private String nodeId;
        private String nodeName;
        private double lastLatency;
        private double lastPacketLoss;
        private double lastThroughput;
        private boolean failed;
        
        public DeviceState(String nodeId, ElementSpecs specs) {
            this.nodeId = nodeId;
            this.nodeName = specs != null ? specs.getNodeName() : nodeId;
            this.failed = false;
        }
        
        // Getters and Setters
        public String getNodeId() { return nodeId; }
        public void setNodeId(String nodeId) { this.nodeId = nodeId; }
        public String getNodeName() { return nodeName; }
        public void setNodeName(String nodeName) { this.nodeName = nodeName; }
        public double getLastLatency() { return lastLatency; }
        public void setLastLatency(double lastLatency) { this.lastLatency = lastLatency; }
        public double getLastPacketLoss() { return lastPacketLoss; }
        public void setLastPacketLoss(double lastPacketLoss) { this.lastPacketLoss = lastPacketLoss; }
        public double getLastThroughput() { return lastThroughput; }
        public void setLastThroughput(double lastThroughput) { this.lastThroughput = lastThroughput; }
        public boolean isFailed() { return failed; }
        public void setFailed(boolean failed) { this.failed = failed; }
    }
    
    static class CableState {
        private String nodeId;
        private String nodeName;
        private double lastLatency;
        private double lastPacketLoss;
        private double lastThroughput;
        private boolean degraded;
        private boolean failed;
        private boolean problemDetected;
        private String problemCause;
        
        public CableState(String nodeId, ElementSpecs specs) {
            this.nodeId = nodeId;
            this.nodeName = specs != null ? specs.getNodeName() : nodeId;
            this.degraded = false;
            this.failed = false;
            this.problemDetected = false;
        }
        
        // Getters and Setters
        public String getNodeId() { return nodeId; }
        public void setNodeId(String nodeId) { this.nodeId = nodeId; }
        public String getNodeName() { return nodeName; }
        public void setNodeName(String nodeName) { this.nodeName = nodeName; }
        public double getLastLatency() { return lastLatency; }
        public void setLastLatency(double lastLatency) { this.lastLatency = lastLatency; }
        public double getLastPacketLoss() { return lastPacketLoss; }
        public void setLastPacketLoss(double lastPacketLoss) { this.lastPacketLoss = lastPacketLoss; }
        public double getLastThroughput() { return lastThroughput; }
        public void setLastThroughput(double lastThroughput) { this.lastThroughput = lastThroughput; }
        public boolean isDegraded() { return degraded; }
        public void setDegraded(boolean degraded) { this.degraded = degraded; }
        public boolean isFailed() { return failed; }
        public void setFailed(boolean failed) { this.failed = failed; }
        public boolean isProblemDetected() { return problemDetected; }
        public void setProblemDetected(boolean problemDetected) { this.problemDetected = problemDetected; }
        public String getProblemCause() { return problemCause; }
        public void setProblemCause(String problemCause) { this.problemCause = problemCause; }
    }
    
    @lombok.Builder
    static class CableMetric {
        private double latencyMs;
        private double packetLossPercent;
        private double throughputMbps;
        private double bitErrorRate;
        private double attenuationDb;
        
        // Getters and Setters
        public double getLatencyMs() { return latencyMs; }
        public void setLatencyMs(double latencyMs) { this.latencyMs = latencyMs; }
        public double getPacketLossPercent() { return packetLossPercent; }
        public void setPacketLossPercent(double packetLossPercent) { this.packetLossPercent = packetLossPercent; }
        public double getThroughputMbps() { return throughputMbps; }
        public void setThroughputMbps(double throughputMbps) { this.throughputMbps = throughputMbps; }
        public double getBitErrorRate() { return bitErrorRate; }
        public void setBitErrorRate(double bitErrorRate) { this.bitErrorRate = bitErrorRate; }
        public double getAttenuationDb() { return attenuationDb; }
        public void setAttenuationDb(double attenuationDb) { this.attenuationDb = attenuationDb; }
    }
}
