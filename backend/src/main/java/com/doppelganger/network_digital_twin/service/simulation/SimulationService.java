package com.doppelganger.network_digital_twin.service.simulation;

import com.doppelganger.network_digital_twin.dto.SimulationResponseDto;
import com.doppelganger.network_digital_twin.dto.SimulationResponseDto.*;
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
        
        // Получаем факторы (включая динамические) и характеристики элементов
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
    
    // ==================== ПОСТРОЕНИЕ ГРАФА ====================
    
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
    
    // ==================== ПОСТРОЕНИЕ ФАКТОРОВ И ХАРАКТЕРИСТИК ====================
    
    private Map<String, List<FactorImpact>> buildFactorImpacts(List<SchemaNode> nodes, List<Connection> connections) {
        Map<String, List<FactorImpact>> impacts = new HashMap<>();
        
        // Находим все FACTOR узлы в схеме
        Map<String, SchemaNode> factorNodes = nodes.stream()
            .filter(n -> n.getNodeType() == SchemaNode.NodeType.FACTOR && n.getIsEnabled())
            .collect(Collectors.toMap(SchemaNode::getId, n -> n));
        
        log.info("=== BUILDING FACTOR IMPACTS ===");
        log.info("Found {} factor nodes in schema", factorNodes.size());
        
        for (Connection conn : connections) {
            if (conn.getConnectionType() == Connection.ConnectionType.FACTOR_ELEMENT) {
                String elementId = conn.getTargetNode().getId();
                String factorNodeId = conn.getSourceNode().getId();
                
                SchemaNode factorNode = factorNodes.get(factorNodeId);
                
                if (factorNode != null) {
                    FactorImpact impact = new FactorImpact();
                    impact.setFactorId(factorNodeId);
                    impact.setFactorType(factorNode.getFactorType());
                    impact.setBaseValue(factorNode.getFactorValue() != null ? factorNode.getFactorValue() : 0.0);
                    impact.setDistance(conn.getDistance() != null ? conn.getDistance() : 0.0);
                    impact.setAttenuation(conn.getAttenuation() != null ? conn.getAttenuation() : 1.0);
                    impact.setRadius(factorNode.getFactorRadius() != null ? factorNode.getFactorRadius() : 10.0);
                    
                    // Динамические параметры из SchemaNode (уже скопированы при создании схемы)
                    impact.setChangeRatePerSecond(factorNode.getChangeRatePerSecond() != null ? factorNode.getChangeRatePerSecond() : 0.0);
                    impact.setMinValue(factorNode.getMinValue());
                    impact.setMaxValue(factorNode.getMaxValue());
                    impact.setValueChangePattern(factorNode.getValueChangePattern() != null ? factorNode.getValueChangePattern() : "NONE");
                    impact.setFrequencyHz(factorNode.getFrequencyHz());
                    impact.setStartTimeSeconds(factorNode.getStartTimeSeconds() != null ? factorNode.getStartTimeSeconds() : 0);
                    impact.setDurationSeconds(factorNode.getDurationSeconds());
                    impact.setFalloffType(factorNode.getFalloffType() != null ? factorNode.getFalloffType() : "NONE");
                    impact.setFalloffExponent(factorNode.getFalloffExponent() != null ? factorNode.getFalloffExponent() : 2.0);
                    impact.setPriority(factorNode.getPriority() != null ? factorNode.getPriority() : 5);
                    
                    // ============ ПОРОГИ ИЗ SCHEMA_NODE ============
                    impact.setWarningThreshold(factorNode.getWarningThreshold());
                    impact.setCriticalThreshold(factorNode.getCriticalThreshold());
                    impact.setFailureThreshold(factorNode.getFailureThreshold());
                    
                    impacts.computeIfAbsent(elementId, k -> new ArrayList<>()).add(impact);
                    
                    log.debug("Factor {} affects element {}: value={}, thresholds: W={}, C={}, F={}", 
                        factorNode.getFactorType(), elementId, impact.getBaseValue(),
                        impact.getWarningThreshold(), impact.getCriticalThreshold(), impact.getFailureThreshold());
                } else {
                    log.warn("Factor node not found for id: {}", factorNodeId);
                }
            }
        }
        
        log.info("Total impacts: {} elements affected", impacts.size());
        return impacts;
    }
    
    private Map<String, ElementSpecs> buildElementSpecs(List<SchemaNode> nodes) {
        Map<String, ElementSpecs> specs = new HashMap<>();
        
        for (SchemaNode node : nodes) {
            if (!node.getIsEnabled()) continue;
            
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
                spec.setMaxOperatingTemp(device.getMaxOperatingTemp());
                spec.setMinOperatingTemp(device.getMinOperatingTemp());
                spec.setMaxEmiTolerance(device.getMaxEmiTolerance());
                spec.setMaxVibrationTolerance(device.getMaxVibrationTolerance());
                spec.setReplacementCost(device.getReplacementCost());
                spec.setRepairCost(device.getRepairCost());
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
    
    // ==================== ОСНОВНАЯ ДИНАМИЧЕСКАЯ СИМУЛЯЦИЯ ====================
    
    private SimulationResultData runDynamicSimulation(SimulationContext ctx) {
    
        List<TimelinePoint> timeline = new ArrayList<>();
        List<CriticalEvent> events = new ArrayList<>();
        Map<String, DeviceState> deviceStates = new HashMap<>();
        Map<String, CableState> cableStates = new HashMap<>();
        
        // Инициализация состояний
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
        
        // Хранилище текущих значений факторов (для динамики)
        Map<String, Double> currentFactorValues = new HashMap<>();
        Map<String, Long> lastUpdateTime = new HashMap<>();
        
        // Симуляция по времени
        for (int t = 0; t <= ctx.getDurationSeconds(); t += ctx.getStepSeconds()) {
            
            // Обновляем значения всех факторов с учетом динамики
            updateFactorValues(ctx, currentFactorValues, lastUpdateTime, t, events);
            
            // ============ ГЕНЕРИРУЕМ СОБЫТИЯ ДЛЯ ФАКТОРОВ (ДОБАВЛЕНО) ============
            for (SchemaNode node : ctx.getAllNodes()) {
                if (node.getNodeType() == SchemaNode.NodeType.FACTOR && node.getIsEnabled()) {
                    String factorType = node.getFactorType();
                    Double currentValue = currentFactorValues.getOrDefault(factorType, node.getFactorValue());
                    generateFactorEvents(node, factorType, currentValue, t, events);
                }
            }
            
            Map<String, DeviceMetric> deviceMetrics = new HashMap<>();
            Map<String, SimulationResponseDto.CableMetric> cableMetrics = new HashMap<>();
            Map<String, SimulationResponseDto.FactorValue> factorValuesForResponse = new HashMap<>();
            double totalLatency = 0;
            double maxPacketLoss = 0;
            double totalThroughput = 0;
            int activeAlerts = 0;
            int activeCritical = 0;
            
            for (String nodeId : ctx.getPath()) {
                ElementSpecs specs = ctx.getElementSpecs().get(nodeId);
                if (specs == null) continue;
                
                // Получаем ТОЛЬКО факторы, связанные с этим конкретным элементом
                List<FactorImpact> impacts = ctx.getFactorImpacts().getOrDefault(nodeId, new ArrayList<>());
                
                if (specs.getNodeType() == SchemaNode.NodeType.DEVICE) {
                    DeviceState state = deviceStates.get(nodeId);
                    DeviceMetric metric = calculateDeviceMetrics(specs, impacts, currentFactorValues, t, state, events);
                    deviceMetrics.put(nodeId, metric);
                    totalLatency += metric.getLatencyMs();
                    maxPacketLoss = Math.max(maxPacketLoss, metric.getPacketLossPercent());
                    totalThroughput += metric.getThroughputMbps();
                    
                    if (state != null) {
                        state.setLastLatency(metric.getLatencyMs());
                        state.setLastPacketLoss(metric.getPacketLossPercent());
                        state.setLastThroughput(metric.getThroughputMbps());
                    }
                    
                } else if (specs.getNodeType() == SchemaNode.NodeType.CABLE) {
                    CableState state = cableStates.get(nodeId);
                    CableMetricDto metric = calculateCableMetricsDto(specs, impacts, currentFactorValues, t, state, events);
                    
                    SimulationResponseDto.CableMetric cableMetric = SimulationResponseDto.CableMetric.builder()
                        .cableId(metric.getCableId())
                        .cableName(metric.getCableName())
                        .packetLossPercent(metric.getPacketLossPercent())
                        .throughputMbps(metric.getThroughputMbps())
                        .attenuationDb(metric.getAttenuationDb())
                        .bitErrorRate(metric.getBitErrorRate())
                        .status(metric.getStatus())
                        .degradationCause(metric.getDegradationCause())
                        .build();
                        
                    cableMetrics.put(nodeId, cableMetric);
                    totalLatency += metric.getLatencyMs();
                    maxPacketLoss = Math.max(maxPacketLoss, metric.getPacketLossPercent());
                    totalThroughput += metric.getThroughputMbps();
                    
                    if (state != null) {
                        state.setLastLatency(metric.getLatencyMs());
                        state.setLastPacketLoss(metric.getPacketLossPercent());
                        state.setLastThroughput(metric.getThroughputMbps());
                        state.setDegraded(metric.getPacketLossPercent() > 20);
                        state.setFailed(metric.getPacketLossPercent() > 80);
                    }
                }
            }
            
            // Собираем значения факторов для таймлайна (с порогами)
            for (SchemaNode node : ctx.getAllNodes()) {
                if (node.getNodeType() == SchemaNode.NodeType.FACTOR && node.getIsEnabled()) {
                    String factorType = node.getFactorType();
                    double currentValue = currentFactorValues.getOrDefault(factorType, node.getFactorValue());
                    String severity = getSeverityForFactorWithThresholds(currentValue, 
                        node.getWarningThreshold(), node.getCriticalThreshold(), node.getFailureThreshold());
                    
                    SimulationResponseDto.FactorValue fv = SimulationResponseDto.FactorValue.builder()
                        .factorType(factorType)
                        .currentValue(currentValue)
                        .warningThreshold(node.getWarningThreshold())
                        .criticalThreshold(node.getCriticalThreshold())
                        .failureThreshold(node.getFailureThreshold())
                        .severity(severity)
                        .build();
                    factorValuesForResponse.put(factorType, fv);
                    
                    if ("WARNING".equals(severity)) activeAlerts++;
                    if ("CRITICAL".equals(severity) || "FAILURE".equals(severity)) activeCritical++;
                }
            }
            
            timeline.add(TimelinePoint.builder()
                .timestamp(t)
                .avgLatencyMs(totalLatency / ctx.getPath().size())
                .packetLossPercent(maxPacketLoss)
                .devices(deviceMetrics)
                .cables(cableMetrics)
                .factorValues(factorValuesForResponse)
                .totalThroughputMbps(totalThroughput)
                .activeAlertsCount(activeAlerts)
                .activeCriticalCount(activeCritical)
                .build());
        }
        
        SimulationResultData resultData = new SimulationResultData();
        resultData.setTimeline(timeline);
        resultData.setEvents(events);
        resultData.setDeviceStates(deviceStates);
        resultData.setCableStates(cableStates);
        resultData.setCurrentFactorValues(currentFactorValues);
        resultData.setElementSpecs(ctx.getElementSpecs());  // ============ ДОБАВЛЕНО ============
        
        return resultData;
    }

    /**
     * Обновление значений факторов с учетом динамики изменения
     */
    private void updateFactorValues(SimulationContext ctx, Map<String, Double> currentValues,
                                     Map<String, Long> lastUpdateTime, int currentTime,
                                     List<CriticalEvent> events) {
        
        for (SchemaNode node : ctx.getAllNodes()) {
            if (node.getNodeType() == SchemaNode.NodeType.FACTOR && node.getIsEnabled()) {
                String factorId = node.getId();
                String factorType = node.getFactorType();
                Double baseValue = node.getFactorValue() != null ? node.getFactorValue() : 0.0;
                Double changeRate = node.getChangeRatePerSecond() != null ? node.getChangeRatePerSecond() : 0.0;
                String pattern = node.getValueChangePattern() != null ? node.getValueChangePattern() : "NONE";
                Double minVal = node.getMinValue();
                Double maxVal = node.getMaxValue();
                Double frequency = node.getFrequencyHz();
                Integer startTime = node.getStartTimeSeconds() != null ? node.getStartTimeSeconds() : 0;
                Integer duration = node.getDurationSeconds();
                
                // Проверка временного окна действия фактора
                if (currentTime < startTime) continue;
                if (duration != null && currentTime > startTime + duration) continue;
                
                Double currentValue = baseValue;
                long elapsedMillis = lastUpdateTime.getOrDefault(factorId, (long) startTime * 1000);
                double deltaSeconds = (currentTime * 1000 - elapsedMillis) / 1000.0;
                
                switch (pattern) {
                    case "LINEAR":
                        currentValue = baseValue + changeRate * currentTime;
                        break;
                    case "SINE":
                        double freq = frequency != null ? frequency : 1.0;
                        currentValue = baseValue + changeRate * Math.sin(2 * Math.PI * freq * currentTime);
                        break;
                    case "STEP":
                        // Ступенчатое изменение: каждые changeRate секунд значение удваивается
                        int steps = (int) (currentTime / Math.max(0.1, changeRate));
                        currentValue = baseValue * (steps + 1);
                        break;
                    case "RANDOM":
                        Random rand = new Random();
                        currentValue = baseValue + (rand.nextDouble() - 0.5) * changeRate;
                        break;
                    default: // NONE
                        currentValue = baseValue;
                }
                
                // Применяем ограничения min/max
                if (minVal != null) currentValue = Math.max(minVal, currentValue);
                if (maxVal != null) currentValue = Math.min(maxVal, currentValue);
                
                currentValues.put(factorType, currentValue);
                lastUpdateTime.put(factorId, (long) currentTime * 1000);
                
                // Генерация событий при превышении порогов
                generateFactorEvents(node, factorType, currentValue, currentTime, events);
            }
        }
        
        // Значения по умолчанию, если факторы не заданы
        currentValues.putIfAbsent("TEMPERATURE", 25.0);
        currentValues.putIfAbsent("EMI", 20.0);
        currentValues.putIfAbsent("VIBRATION", 10.0);
        currentValues.putIfAbsent("DUST", 5.0);
    }
    
    /**
     * Расчет метрик устройства с учетом всех факторов и динамики
     */
    private DeviceMetric calculateDeviceMetrics(ElementSpecs specs, List<FactorImpact> impacts,
                                                Map<String, Double> globalFactors, int time,
                                                DeviceState state, List<CriticalEvent> events) {
        
        double latency = specs.getBaseLatencyMs();
        double packetLoss = 0.0;
        double throughput = specs.getMaxThroughputMbps();
        
        // Значения по умолчанию (если нет связанных факторов)
        double currentTemp = 25.0;
        double currentEmi = 20.0;
        double currentVibration = 10.0;
        double currentDust = 5.0;
        
        // ============ УЧИТЫВАЕМ ТОЛЬКО СВЯЗАННЫЕ ФАКТОРЫ ============
        for (FactorImpact impact : impacts) {
            double effectiveValue = calculateEffectiveValue(impact, globalFactors, 0);
            
            switch (impact.getFactorType().toUpperCase()) {
                case "TEMPERATURE":
                    currentTemp = effectiveValue;
                    double tempImpact = effectiveValue * specs.getTempCoefficient();
                    
                    // Проверка порогов
                    if (impact.getWarningThreshold() != null && tempImpact > impact.getWarningThreshold()) {
                        generateThresholdEvent(specs, "TEMPERATURE", tempImpact, impact.getWarningThreshold(),
                            impact.getCriticalThreshold(), impact.getFailureThreshold(), time, events);
                    }
                    if (tempImpact > 40) {
                        latency *= (1 + (tempImpact - 40) * 0.03);
                        packetLoss += (tempImpact - 40) * 1.5;
                    }
                    if (impact.getFailureThreshold() != null && tempImpact > impact.getFailureThreshold() && state != null) {
                        state.setFailed(true);
                        packetLoss = 100;
                    }
                    break;
                    
                case "EMI":
                    currentEmi = effectiveValue;
                    double emiImpact = effectiveValue * specs.getEmiCoefficient();
                    
                    if (impact.getWarningThreshold() != null && emiImpact > impact.getWarningThreshold()) {
                        generateThresholdEvent(specs, "EMI", emiImpact, impact.getWarningThreshold(),
                            impact.getCriticalThreshold(), impact.getFailureThreshold(), time, events);
                    }
                    if (emiImpact > 30) {
                        latency *= (1 + (emiImpact - 30) * 0.02);
                        packetLoss += (emiImpact - 30) * 2.0;
                    }
                    if (impact.getFailureThreshold() != null && emiImpact > impact.getFailureThreshold()) {
                        packetLoss = 100;
                    }
                    break;
                    
                case "VIBRATION":
                    currentVibration = effectiveValue;
                    double vibImpact = effectiveValue * specs.getVibrationCoefficient();
                    
                    if (impact.getWarningThreshold() != null && vibImpact > impact.getWarningThreshold()) {
                        generateThresholdEvent(specs, "VIBRATION", vibImpact, impact.getWarningThreshold(),
                            impact.getCriticalThreshold(), impact.getFailureThreshold(), time, events);
                    }
                    if (vibImpact > 50) {
                        packetLoss += (vibImpact - 50) * 1.0;
                        latency += Math.random() * (vibImpact - 50) * 0.1;
                    }
                    break;
                    
                case "DUST":
                    currentDust = effectiveValue;
                    double dustImpact = effectiveValue * specs.getDustCoefficient();
                    
                    if (impact.getWarningThreshold() != null && dustImpact > impact.getWarningThreshold()) {
                        generateThresholdEvent(specs, "DUST", dustImpact, impact.getWarningThreshold(),
                            impact.getCriticalThreshold(), impact.getFailureThreshold(), time, events);
                    }
                    if (dustImpact > 30) {
                        throughput *= (1 - dustImpact / 100);
                        packetLoss += dustImpact * 0.5;
                    }
                    break;
            }
        }
        
        packetLoss = Math.min(100, packetLoss);
        throughput = throughput * (1 - packetLoss / 100);
        
        String status = packetLoss > 80 ? "FAILED" : (packetLoss > 20 ? "DEGRADED" : "OPERATIONAL");
        
        return DeviceMetric.builder()
            .latencyMs(Math.round(latency * 10) / 10.0)
            .packetLossPercent(Math.round(packetLoss * 10) / 10.0)
            .throughputMbps((double) Math.round(throughput))
            .temperature(currentTemp)
            .emiLevel(currentEmi)
            .vibrationLevel(currentVibration)
            .dustLevel(currentDust)
            .currentUtilizationPercent(throughput / specs.getMaxThroughputMbps() * 100)
            .status(status)
            .build();
    }
    
    /**
     * Расчет метрик кабеля (DTO версия)
     */
    private CableMetricDto calculateCableMetricsDto(ElementSpecs specs, List<FactorImpact> impacts,
                                                     Map<String, Double> globalFactors, int time,
                                                     CableState state, List<CriticalEvent> events) {
        
        double latency = specs.getCableLengthM() / 200000.0 * 1000;
        double packetLoss = 0.0;
        double ber = 0.0;
        double attenuation = specs.getAttenuationDbPerKm() * (specs.getCableLengthM() / 1000.0);
        String degradationCause = null;
        
        for (FactorImpact impact : impacts) {
            double effectiveValue = calculateEffectiveValue(impact, globalFactors, 0);
            
            switch (impact.getFactorType().toUpperCase()) {
                case "TEMPERATURE":
                    if (effectiveValue > 50) {
                        attenuation *= (1 + (effectiveValue - 50) * 0.05);
                        packetLoss += (effectiveValue - 50) * 0.5;
                        degradationCause = "Перегрев кабеля";
                    }
                    if (impact.getFailureThreshold() != null && effectiveValue > impact.getFailureThreshold() && state != null) {
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
                        degradationCause = "Электромагнитные помехи";
                    }
                    break;
                    
                case "VIBRATION":
                    if (effectiveValue > 60) {
                        packetLoss += (effectiveValue - 60) * 1.5;
                        latency += effectiveValue * 0.05;
                        degradationCause = "Вибрация";
                    }
                    break;
            }
        }
        
        if (specs.getCableLengthM() > 100) {
            packetLoss += (specs.getCableLengthM() - 100) * 0.1;
            degradationCause = "Превышение длины кабеля";
        }
        
        packetLoss = Math.min(100, packetLoss);
        double throughput = specs.getBandwidthMbps() * (1 - packetLoss / 100);
        
        String status = packetLoss > 80 ? "FAILED" : (packetLoss > 20 ? "DEGRADED" : "OPERATIONAL");
        
        return CableMetricDto.builder()
            .cableId(specs.getNodeId())
            .cableName(specs.getNodeName())
            .packetLossPercent(Math.round(packetLoss * 10) / 10.0)
            .throughputMbps((double) Math.round(throughput))
            .attenuationDb(Math.round(attenuation * 10) / 10.0)
            .bitErrorRate(ber)
            .status(status)
            .degradationCause(degradationCause)
            .build();
    }
    
    /**
     * Расчет эффективного значения фактора с учетом расстояния и радиуса
     */
    private double calculateEffectiveValue(FactorImpact impact, Map<String, Double> globalFactors, double defaultValue) {
        double baseValue = impact.getBaseValue();
        double distance = impact.getDistance();
        double radius = impact.getRadius();
        double attenuation = impact.getAttenuation();
        
        double effectiveValue = baseValue;
        
        // Учет затухания по расстоянию
        if (distance > 0 && radius > 0) {
            String falloffType = impact.getFalloffType();
            double exponent = impact.getFalloffExponent();
            
            switch (falloffType) {
                case "INVERSE_SQUARE":
                    double normalizedDistance = Math.max(0.1, distance / radius);
                    effectiveValue = baseValue / Math.pow(normalizedDistance, exponent);
                    break;
                case "LINEAR":
                    effectiveValue = baseValue * Math.max(0, 1 - (distance / radius));
                    break;
                case "STEP":
                    effectiveValue = distance <= radius ? baseValue : 0;
                    break;
                default:
                    effectiveValue = baseValue;
            }
        }
        
        effectiveValue = Math.max(0, effectiveValue);
        effectiveValue *= attenuation;
        
        return effectiveValue;
    }
    
    /**
     * Генерация событий при превышении порогов
     */
    private void generateThresholdEvent(ElementSpecs specs, String factorType, double currentValue,
                                        double warningThreshold, Double criticalThreshold,
                                        Double failureThreshold, int time, List<CriticalEvent> events) {
        
        String severity;
        String message;
        
        if (failureThreshold != null && currentValue > failureThreshold) {
            severity = "FAILURE";
            message = String.format("%s достиг критического уровня %.1f (порог отказа: %.1f)", 
                factorType, currentValue, failureThreshold);
        } else if (criticalThreshold != null && currentValue > criticalThreshold) {
            severity = "CRITICAL";
            message = String.format("%s достиг критического уровня %.1f (порог: %.1f)", 
                factorType, currentValue, criticalThreshold);
        } else {
            severity = "WARNING";
            message = String.format("%s достиг %.1f (порог: %.1f)", factorType, currentValue, warningThreshold);
        }
        
        // Избегаем дублирования событий (одно событие на порог)
        final String finalMessage = message;
        final String finalSeverity = severity;
        
        boolean eventExists = events.stream().anyMatch(e -> 
            e.getDeviceId().equals(specs.getNodeId()) && 
            e.getType().equals("THRESHOLD_EXCEEDED") &&
            e.getSeverity().equals(finalSeverity));
        
        if (!eventExists) {
            events.add(CriticalEvent.builder()
                .timestamp(time)
                .type("THRESHOLD_EXCEEDED")
                .deviceId(specs.getNodeId())
                .deviceName(specs.getNodeName())
                .message(finalMessage)
                .severity(finalSeverity)
                .factorType(factorType)
                .factorValue(currentValue)
                .threshold(warningThreshold)
                .recommendation(generateRecommendationForFactor(factorType, finalSeverity))
                .build());
        }
    }
    
    /**
     * Генерация событий для факторов
     */
    private void generateFactorEvents(SchemaNode node, String factorType, double currentValue,
                                    int time, List<CriticalEvent> events) {
        
        Double warning = node.getWarningThreshold();
        Double critical = node.getCriticalThreshold();
        Double failure = node.getFailureThreshold();
        
        String severity = null;
        String message = null;
        
        if (failure != null && currentValue > failure) {
            severity = "FAILURE";
            message = String.format("Фактор '%s' достиг уровня отказа: %.1f %s", 
                node.getName(), currentValue, node.getFactorUnit());
        } else if (critical != null && currentValue > critical) {
            severity = "CRITICAL";
            message = String.format("Фактор '%s' достиг критического уровня: %.1f %s", 
                node.getName(), currentValue, node.getFactorUnit());
        } else if (warning != null && currentValue > warning) {
            severity = "WARNING";
            message = String.format("Фактор '%s' превысил предупреждающий уровень: %.1f %s", 
                node.getName(), currentValue, node.getFactorUnit());
        }
        
        if (severity != null && message != null) {
            final String finalSeverity = severity;
            final String finalMessage = message;
            
            boolean eventExists = events.stream().anyMatch(e -> 
                e.getDeviceId().equals(node.getId()) && 
                e.getType().equals("FACTOR_" + finalSeverity));
            
            if (!eventExists) {
                events.add(CriticalEvent.builder()
                    .timestamp(time)
                    .type("FACTOR_" + finalSeverity)
                    .deviceId(node.getId())
                    .deviceName(node.getName())
                    .message(finalMessage)
                    .severity(finalSeverity)
                    .factorType(factorType)
                    .factorValue(currentValue)
                    .build());
            }
        }
    }
    
    private String getSeverityForFactor(String factorType, double value) {
        // Упрощенная логика — можно расширить
        if (value > 150) return "FAILURE";
        if (value > 100) return "CRITICAL";
        if (value > 70) return "WARNING";
        return "NORMAL";
    }
    
    private String generateRecommendationForFactor(String factorType, String severity) {
        switch (factorType) {
            case "TEMPERATURE":
                return "Установите дополнительное охлаждение или переместите устройство";
            case "EMI":
                return "Усильте экранирование или увеличьте расстояние до источника помех";
            case "VIBRATION":
                return "Используйте виброгасящие прокладки или перенесите оборудование";
            case "DUST":
                return "Установите фильтры вентиляции или используйте герметичный корпус";
            default:
                return "Проведите дополнительную диагностику";
        }
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
    
    // ==================== СОХРАНЕНИЕ РЕЗУЛЬТАТОВ ====================
    
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
        double maxPacketLoss = resultData.getTimeline().stream()
            .mapToDouble(TimelinePoint::getPacketLossPercent)
            .max().orElse(0);
        
        String grade = calculateGradeWithFactors(avgPacketLoss, resultData.getEvents().size());
        int score = calculateScore(avgPacketLoss, resultData.getEvents().size());
        
        int devicesFailed = (int) resultData.getDeviceStates().values().stream()
            .filter(DeviceState::isFailed).count();
        int cablesFailed = (int) resultData.getCableStates().values().stream()
            .filter(CableState::isFailed).count();
        
        List<String> bottlenecks = findBottlenecks(resultData.getTimeline(), resultData.getEvents());
        
        // ============ ЭКОНОМИЧЕСКИЙ РАСЧЁТ (ИСПРАВЛЕН) ============
        double totalReplacementCost = 0;
        double totalRepairCost = 0;
        Map<String, Double> deviceLosses = new HashMap<>();
        Map<String, Double> cableLosses = new HashMap<>();
        
        // Используем resultData.getElementSpecs() который теперь сохранён
        Map<String, ElementSpecs> elementSpecs = resultData.getElementSpecs();
        
        for (DeviceState state : resultData.getDeviceStates().values()) {
            ElementSpecs specs = elementSpecs.get(state.getNodeId());
            if (specs != null) {
                if (state.isFailed()) {
                    double cost = specs.getReplacementCost() != null ? specs.getReplacementCost() : 0;
                    totalReplacementCost += cost;
                    deviceLosses.put(state.getNodeName(), cost);
                } else if (state.getLastPacketLoss() > 20) {
                    double cost = specs.getRepairCost() != null ? specs.getRepairCost() : 0;
                    totalRepairCost += cost;
                    deviceLosses.put(state.getNodeName(), cost);
                }
            }
        }
        
        for (CableState state : resultData.getCableStates().values()) {
            if (state.isFailed()) {
                // Для кабелей можно добавить стоимость замены позже
                cableLosses.put(state.getNodeName(), 0.0);
            }
        }
        
        double totalEconomicLoss = totalReplacementCost + totalRepairCost;
        
        EconomicImpactDto economicImpact = EconomicImpactDto.builder()
            .totalReplacementCost(totalReplacementCost)
            .totalRepairCost(totalRepairCost)
            .estimatedDowntimeCost((double) devicesFailed * 3600 * 1000) // Упрощённая оценка
            .totalLoss(totalEconomicLoss)
            .deviceLosses(deviceLosses)
            .cableLosses(cableLosses)
            .build();
        
        Summary summary = Summary.builder()
            .maxLatencyMs(maxLatency)
            .avgLatencyMs(avgLatency)
            .packetLossPercent(avgPacketLoss)
            .throughputMbps(calculateAverageThroughputFromTimeline(resultData.getTimeline()))
            .devicesFailed(devicesFailed)
            .cablesFailed(cablesFailed)
            .bottlenecks(bottlenecks)
            .recommendation(buildRecommendation(resultData))
            .totalReplacementCost(totalReplacementCost)
            .totalRepairCost(totalRepairCost)
            .totalDowntimeSeconds((double) devicesFailed * 3600)
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
        result.setMaxPacketLoss(maxPacketLoss);
        result.setMaxLatencyMs(maxLatency);
        result.setDevicesFailedCount(devicesFailed);
        result.setCablesFailedCount(cablesFailed);
        result.setTotalEconomicLoss(totalEconomicLoss);
        
        try {
            result.setSummary(objectMapper.writeValueAsString(summary));
            result.setTimeline(objectMapper.writeValueAsString(resultData.getTimeline()));
            result.setEvents(objectMapper.writeValueAsString(resultData.getEvents()));
            result.setEconomicImpact(objectMapper.writeValueAsString(economicImpact));
            
        } catch (Exception e) {
            log.error("Failed to serialize simulation results", e);
        }
        
        return simulationResultRepository.save(result);
    }

    private String getSeverityForFactorWithThresholds(double currentValue, 
                                                        Double warningThreshold,
                                                        Double criticalThreshold,
                                                        Double failureThreshold) {
        if (failureThreshold != null && currentValue >= failureThreshold) return "FAILURE";
        if (criticalThreshold != null && currentValue >= criticalThreshold) return "CRITICAL";
        if (warningThreshold != null && currentValue >= warningThreshold) return "WARNING";
        return "NORMAL";
    }
    
    private String buildRecommendation(SimulationResultData resultData) {
        List<String> recommendations = new ArrayList<>();
        
        // Анализ по устройствам
        for (DeviceState state : resultData.getDeviceStates().values()) {
            if (state.getLastPacketLoss() > 80) {
                recommendations.add(String.format(
                    "⚠️ Устройство '%s' вышло из строя (потери: %.1f%%). Требуется замена!",
                    state.getNodeName(), state.getLastPacketLoss()
                ));
            } else if (state.getLastPacketLoss() > 20) {
                recommendations.add(String.format(
                    "⚠️ Устройство '%s' деградировано (потери: %.1f%%). Проверьте охлаждение и экранирование.",
                    state.getNodeName(), state.getLastPacketLoss()
                ));
            }
        }
        
        // Анализ по кабелям
        for (CableState state : resultData.getCableStates().values()) {
            if (state.getLastPacketLoss() > 80) {
                recommendations.add(String.format(
                    "🔌 Кабель '%s' вышел из строя. Причина: %s. Замените кабель!",
                    state.getNodeName(), state.getProblemCause() != null ? state.getProblemCause() : "неизвестна"
                ));
            } else if (state.getLastPacketLoss() > 20) {
                recommendations.add(String.format(
                    "🔌 Кабель '%s' деградирован (потери: %.1f%%). Причина: %s.",
                    state.getNodeName(), state.getLastPacketLoss(), 
                    state.getProblemCause() != null ? state.getProblemCause() : "воздействие факторов"
                ));
            }
        }
        
        // Анализ факторов
        for (Map.Entry<String, Double> entry : resultData.getCurrentFactorValues().entrySet()) {
            String factorType = entry.getKey();
            Double value = entry.getValue();
            if ("TEMPERATURE".equals(factorType) && value > 70) {
                recommendations.add("🌡️ Критическая температура! Установите дополнительное охлаждение.");
            } else if ("EMI".equals(factorType) && value > 70) {
                recommendations.add("⚡ Высокий уровень электромагнитных помех! Усильте экранирование.");
            } else if ("VIBRATION".equals(factorType) && value > 80) {
                recommendations.add("📳 Критическая вибрация! Используйте виброгасящие прокладки.");
            } else if ("DUST".equals(factorType) && value > 40) {
                recommendations.add("🏭 Высокая запылённость! Установите фильтры вентиляции.");
            }
        }
        
        if (recommendations.isEmpty()) {
            recommendations.add("✅ Сеть работает в нормальном режиме. Поддерживайте текущую конфигурацию.");
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
            .filter(e -> "CRITICAL".equals(e.getSeverity()) || "FAILURE".equals(e.getSeverity()))
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
        if (avgPacketLoss > 50 || eventsCount > 10) return "F";
        if (avgPacketLoss > 30 || eventsCount > 5) return "D";
        if (avgPacketLoss > 15 || eventsCount > 2) return "C";
        if (avgPacketLoss > 5 || eventsCount > 0) return "B";
        return "A";
    }
    
    private int calculateScore(double avgPacketLoss, int eventsCount) {
        int score = 100;
        score -= avgPacketLoss * 1.2;
        score -= eventsCount * 5;
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
        private Map<String, Double> currentFactorValues = new HashMap<>();
        private Map<String, ElementSpecs> elementSpecs = new HashMap<>();
        
        // Getters and Setters
        public List<TimelinePoint> getTimeline() { return timeline; }
        public void setTimeline(List<TimelinePoint> timeline) { this.timeline = timeline; }
        public List<CriticalEvent> getEvents() { return events; }
        public void setEvents(List<CriticalEvent> events) { this.events = events; }
        public Map<String, DeviceState> getDeviceStates() { return deviceStates; }
        public void setDeviceStates(Map<String, DeviceState> deviceStates) { this.deviceStates = deviceStates; }
        public Map<String, CableState> getCableStates() { return cableStates; }
        public void setCableStates(Map<String, CableState> cableStates) { this.cableStates = cableStates; }
        public Map<String, Double> getCurrentFactorValues() { return currentFactorValues; }
        public void setCurrentFactorValues(Map<String, Double> currentFactorValues) { this.currentFactorValues = currentFactorValues; }
        public Map<String, ElementSpecs> getElementSpecs() { return elementSpecs; }
        public void setElementSpecs(Map<String, ElementSpecs> elementSpecs) { this.elementSpecs = elementSpecs; }
    }
    
    static class FactorImpact {
        private String factorId;
        private String factorType;
        private Double baseValue;
        private Double distance;
        private Double attenuation;
        private Double radius;
        // Динамические параметры
        private Double changeRatePerSecond;
        private Double minValue;
        private Double maxValue;
        private String valueChangePattern;
        private Double frequencyHz;
        private Integer startTimeSeconds;
        private Integer durationSeconds;
        private String falloffType;
        private Double falloffExponent;
        private Double warningThreshold;
        private Double criticalThreshold;
        private Double failureThreshold;
        private Integer priority;
        
        // Getters and Setters
        public String getFactorId() { return factorId; }
        public void setFactorId(String factorId) { this.factorId = factorId; }
        public String getFactorType() { return factorType; }
        public void setFactorType(String factorType) { this.factorType = factorType; }
        public Double getBaseValue() { return baseValue; }
        public void setBaseValue(Double baseValue) { this.baseValue = baseValue; }
        public Double getDistance() { return distance; }
        public void setDistance(Double distance) { this.distance = distance; }
        public Double getAttenuation() { return attenuation; }
        public void setAttenuation(Double attenuation) { this.attenuation = attenuation; }
        public Double getRadius() { return radius; }
        public void setRadius(Double radius) { this.radius = radius; }
        public Double getChangeRatePerSecond() { return changeRatePerSecond; }
        public void setChangeRatePerSecond(Double changeRatePerSecond) { this.changeRatePerSecond = changeRatePerSecond; }
        public Double getMinValue() { return minValue; }
        public void setMinValue(Double minValue) { this.minValue = minValue; }
        public Double getMaxValue() { return maxValue; }
        public void setMaxValue(Double maxValue) { this.maxValue = maxValue; }
        public String getValueChangePattern() { return valueChangePattern; }
        public void setValueChangePattern(String valueChangePattern) { this.valueChangePattern = valueChangePattern; }
        public Double getFrequencyHz() { return frequencyHz; }
        public void setFrequencyHz(Double frequencyHz) { this.frequencyHz = frequencyHz; }
        public Integer getStartTimeSeconds() { return startTimeSeconds; }
        public void setStartTimeSeconds(Integer startTimeSeconds) { this.startTimeSeconds = startTimeSeconds; }
        public Integer getDurationSeconds() { return durationSeconds; }
        public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }
        public String getFalloffType() { return falloffType; }
        public void setFalloffType(String falloffType) { this.falloffType = falloffType; }
        public Double getFalloffExponent() { return falloffExponent; }
        public void setFalloffExponent(Double falloffExponent) { this.falloffExponent = falloffExponent; }
        public Double getWarningThreshold() { return warningThreshold; }
        public void setWarningThreshold(Double warningThreshold) { this.warningThreshold = warningThreshold; }
        public Double getCriticalThreshold() { return criticalThreshold; }
        public void setCriticalThreshold(Double criticalThreshold) { this.criticalThreshold = criticalThreshold; }
        public Double getFailureThreshold() { return failureThreshold; }
        public void setFailureThreshold(Double failureThreshold) { this.failureThreshold = failureThreshold; }
        public Integer getPriority() { return priority; }
        public void setPriority(Integer priority) { this.priority = priority; }
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
        private Double maxOperatingTemp;
        private Double minOperatingTemp;
        private Double maxEmiTolerance;
        private Double maxVibrationTolerance;
        private Double replacementCost;
        private Double repairCost;
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
        public Double getMaxOperatingTemp() { return maxOperatingTemp; }
        public void setMaxOperatingTemp(Double maxOperatingTemp) { this.maxOperatingTemp = maxOperatingTemp; }
        public Double getMinOperatingTemp() { return minOperatingTemp; }
        public void setMinOperatingTemp(Double minOperatingTemp) { this.minOperatingTemp = minOperatingTemp; }
        public Double getMaxEmiTolerance() { return maxEmiTolerance; }
        public void setMaxEmiTolerance(Double maxEmiTolerance) { this.maxEmiTolerance = maxEmiTolerance; }
        public Double getMaxVibrationTolerance() { return maxVibrationTolerance; }
        public void setMaxVibrationTolerance(Double maxVibrationTolerance) { this.maxVibrationTolerance = maxVibrationTolerance; }
        public Double getReplacementCost() { return replacementCost; }
        public void setReplacementCost(Double replacementCost) { this.replacementCost = replacementCost; }
        public Double getRepairCost() { return repairCost; }
        public void setRepairCost(Double repairCost) { this.repairCost = repairCost; }
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
    static class CableMetricDto {
        private String cableId;
        private String cableName;
        private double latencyMs;
        private double packetLossPercent;
        private double throughputMbps;
        private double bitErrorRate;
        private double attenuationDb;
        private String status;
        private String degradationCause;
        
        // Getters and Setters
        public String getCableId() { return cableId; }
        public void setCableId(String cableId) { this.cableId = cableId; }
        public String getCableName() { return cableName; }
        public void setCableName(String cableName) { this.cableName = cableName; }
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
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getDegradationCause() { return degradationCause; }
        public void setDegradationCause(String degradationCause) { this.degradationCause = degradationCause; }
    }
    
    @lombok.Builder
    static class FactorValueDto {
        private String factorType;
        private Double currentValue;
        private String severity;
        
        public String getFactorType() { return factorType; }
        public void setFactorType(String factorType) { this.factorType = factorType; }
        public Double getCurrentValue() { return currentValue; }
        public void setCurrentValue(Double currentValue) { this.currentValue = currentValue; }
        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }
    }

    @lombok.Builder
    static class EconomicImpactDto {
        private Double totalReplacementCost;
        private Double totalRepairCost;
        private Double estimatedDowntimeCost;
        private Double totalLoss;
        private Map<String, Double> deviceLosses;
        private Map<String, Double> cableLosses;
        
        // Getters and Setters
        public Double getTotalReplacementCost() { return totalReplacementCost; }
        public void setTotalReplacementCost(Double totalReplacementCost) { this.totalReplacementCost = totalReplacementCost; }
        public Double getTotalRepairCost() { return totalRepairCost; }
        public void setTotalRepairCost(Double totalRepairCost) { this.totalRepairCost = totalRepairCost; }
        public Double getEstimatedDowntimeCost() { return estimatedDowntimeCost; }
        public void setEstimatedDowntimeCost(Double estimatedDowntimeCost) { this.estimatedDowntimeCost = estimatedDowntimeCost; }
        public Double getTotalLoss() { return totalLoss; }
        public void setTotalLoss(Double totalLoss) { this.totalLoss = totalLoss; }
        public Map<String, Double> getDeviceLosses() { return deviceLosses; }
        public void setDeviceLosses(Map<String, Double> deviceLosses) { this.deviceLosses = deviceLosses; }
        public Map<String, Double> getCableLosses() { return cableLosses; }
        public void setCableLosses(Map<String, Double> cableLosses) { this.cableLosses = cableLosses; }
    }
}
