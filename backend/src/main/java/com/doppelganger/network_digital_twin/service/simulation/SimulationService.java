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
import com.fasterxml.jackson.core.type.TypeReference;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class SimulationService {

    // ============ РЕАЛИСТИЧНЫЕ ПОРОГИ ДЛЯ УСТРОЙСТВ ============
    private static final double NORMAL_OPERATING_TEMP = 25.0;
    private static final double WARNING_TEMP = 40.0;      // Начинаются проблемы
    private static final double CRITICAL_TEMP = 55.0;     // Серьезная деградация
    private static final double FAILURE_TEMP = 70.0;      // Отказ оборудования

    private static final double NORMAL_EMI = 20.0;
    private static final double WARNING_EMI = 40.0;       // Начинаются ошибки
    private static final double CRITICAL_EMI = 60.0;      // Много ошибок
    private static final double FAILURE_EMI = 80.0;       // Полный отказ

    private static final double NORMAL_VIBRATION = 10.0;
    private static final double WARNING_VIBRATION = 30.0;  // Разбалтывание контактов
    private static final double CRITICAL_VIBRATION = 50.0; // Обрывы соединений
    private static final double FAILURE_VIBRATION = 70.0;  // Механическое разрушение

    private static final double NORMAL_DUST = 5.0;
    private static final double WARNING_DUST = 15.0;       // Перегрев, проблемы с охлаждением
    private static final double CRITICAL_DUST = 30.0;      // Замыкания, отказ вентиляторов
    private static final double FAILURE_DUST = 50.0;       // Полный отказ

    // ============ РЕАЛИСТИЧНЫЕ КОЭФФИЦИЕНТЫ ВЛИЯНИЯ ============
    private static final double TEMP_LATENCY_FACTOR = 0.15;      // +15% задержки на 10°C выше нормы
    private static final double TEMP_LOSS_FACTOR = 2.5;          // +2.5% потерь на 10°C выше нормы
    private static final double EMI_LOSS_FACTOR = 3.0;           // +3% потерь на 10 dBm выше нормы
    private static final double VIBRATION_LOSS_FACTOR = 2.0;     // +2% потерь на 10 Hz выше нормы
    private static final double DUST_LOSS_FACTOR = 1.5;          // +1.5% потерь на 10 mg/m³ выше нормы
    
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
        
        // Находим все FACTOR узлы в схеме (только те, что на канвасе и активны)
        Map<String, SchemaNode> factorNodes = nodes.stream()
            .filter(n -> n.getNodeType() == SchemaNode.NodeType.FACTOR && n.getIsEnabled())
            .collect(Collectors.toMap(SchemaNode::getId, n -> n));
        
        log.info("=== BUILDING FACTOR IMPACTS ===");
        log.info("Found {} factor nodes in schema", factorNodes.size());
        
        // Логируем все найденные факторы для отладки
        for (Map.Entry<String, SchemaNode> entry : factorNodes.entrySet()) {
            log.debug("  Factor: id={}, type={}, value={}", 
                entry.getKey(), entry.getValue().getFactorType(), entry.getValue().getFactorValue());
        }
        
        int factorConnectionsCount = 0;
        
        for (Connection conn : connections) {
            // Обрабатываем только FACTOR_ELEMENT связи
            if (conn.getConnectionType() == Connection.ConnectionType.FACTOR_ELEMENT) {
                factorConnectionsCount++;
                String elementId = conn.getTargetNode().getId();
                String factorNodeId = conn.getSourceNode().getId();
                
                log.debug("Processing FACTOR_ELEMENT connection: factorId={}, elementId={}", factorNodeId, elementId);
                
                SchemaNode factorNode = factorNodes.get(factorNodeId);
                
                if (factorNode != null) {
                    FactorImpact impact = new FactorImpact();
                    impact.setFactorId(factorNodeId);
                    impact.setFactorType(factorNode.getFactorType());
                    impact.setBaseValue(factorNode.getFactorValue() != null ? factorNode.getFactorValue() : 0.0);
                    impact.setDistance(conn.getDistance() != null ? conn.getDistance() : 0.0);
                    impact.setAttenuation(conn.getAttenuation() != null ? conn.getAttenuation() : 1.0);
                    impact.setRadius(factorNode.getFactorRadius() != null ? factorNode.getFactorRadius() : 10.0);
                    
                    // Динамические параметры из SchemaNode
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
                    
                    // Пороги из SchemaNode
                    impact.setWarningThreshold(factorNode.getWarningThreshold());
                    impact.setCriticalThreshold(factorNode.getCriticalThreshold());
                    impact.setFailureThreshold(factorNode.getFailureThreshold());
                    
                    impacts.computeIfAbsent(elementId, k -> new ArrayList<>()).add(impact);
                    
                    log.debug("  Factor {} affects element {}: value={}, distance={}", 
                        factorNode.getFactorType(), elementId, impact.getBaseValue(), impact.getDistance());
                } else {
                    log.warn("Factor node not found for id: {} (factor may be disabled or not exist)", factorNodeId);
                }
            }
        }
        
        log.info("Total FACTOR_ELEMENT connections: {}", factorConnectionsCount);
        log.info("Total elements affected by factors: {}", impacts.size());
        
        // Логируем итоговое влияние
        for (Map.Entry<String, List<FactorImpact>> entry : impacts.entrySet()) {
            log.debug("  Element {} is affected by {} factors", entry.getKey(), entry.getValue().size());
        }
        
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
                
                // НОВЫЕ ПОЛЯ
                spec.setIpRating(device.getIpRating());
                spec.setHasRedundantPower(device.getHasRedundantPower());
            }
            
            if (node.getNodeType() == SchemaNode.NodeType.CABLE) {
                spec.setCableLengthM(node.getCableLengthM() != null ? node.getCableLengthM() : 10.0);
                spec.setCableType(node.getCableType());
                spec.setBandwidthMbps(node.getBandwidthMbps() != null ? node.getBandwidthMbps() : 1000.0);
                spec.setImmunityRating(5); // Значение по умолчанию
                spec.setShieldingType(0);  // Значение по умолчанию
                spec.setAttenuationDbPerKm(0.5);
                
                // НОВЫЕ ПОЛЯ ДЛЯ КАБЕЛЕЙ
                if (node.getCableType() != null) {
                    spec.setCableType(node.getCableType());
                }
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

                    generateDeviceEvents(nodeId, specs, metric, t, events);
                    
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
     * Учитываются ТОЛЬКО активные факторы, которые есть на канвасе
     * НЕТ значений по умолчанию - если фактор не добавлен на канвас, его воздействия нет
     */
    private void updateFactorValues(SimulationContext ctx, Map<String, Double> currentValues,
                                    Map<String, Long> lastUpdateTime, int currentTime,
                                    List<CriticalEvent> events) {
        
        // Собираем все активные факторы из схемы
        List<SchemaNode> activeFactors = ctx.getAllNodes().stream()
            .filter(n -> n.getNodeType() == SchemaNode.NodeType.FACTOR && n.getIsEnabled())
            .collect(Collectors.toList());
        
        if (activeFactors.isEmpty()) {
            log.debug("No active factors found in schema at time {}", currentTime);
            // Нет факторов - currentValues остается пустым
            // В calculateDeviceMetrics будут использоваться базовые значения (25°C, 20 dBm и т.д.)
            return;
        }
        
        log.debug("Updating {} factors at time {} seconds", activeFactors.size(), currentTime);
        
        for (SchemaNode node : activeFactors) {
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
            if (currentTime < startTime) {
                log.debug("Factor {} ({}) not started yet (start at {}s)", 
                    node.getName(), factorType, startTime);
                continue;
            }
            if (duration != null && currentTime > startTime + duration) {
                log.debug("Factor {} ({}) has finished (duration {}s)", 
                    node.getName(), factorType, duration);
                continue;
            }
            
            Double currentValue = baseValue;
            double elapsedTime = currentTime - startTime;
            
            switch (pattern) {
                case "LINEAR":
                    // Линейное изменение: value = base + rate * time
                    currentValue = baseValue + changeRate * elapsedTime;
                    log.debug("  LINEAR: {} = {} + {} * {}", currentValue, baseValue, changeRate, elapsedTime);
                    break;
                    
                case "SINE":
                    // Синусоидальное изменение
                    double freq = frequency != null ? frequency : 1.0;
                    currentValue = baseValue + changeRate * Math.sin(2 * Math.PI * freq * elapsedTime);
                    log.debug("  SINE: {} = {} + {} * sin(2π * {} * {})", 
                        currentValue, baseValue, changeRate, freq, elapsedTime);
                    break;
                    
                case "STEP":
                    // Ступенчатое изменение: каждые changeRate секунд +10%
                    double stepInterval = Math.max(5.0, changeRate);
                    int steps = (int) (elapsedTime / stepInterval);
                    currentValue = baseValue + steps * baseValue * 0.1;
                    log.debug("  STEP: {} = {} + {} * {} * 0.1", 
                        currentValue, baseValue, steps, baseValue);
                    break;
                    
                case "RANDOM":
                    // Случайное блуждание
                    double randomDelta = (ThreadLocalRandom.current().nextDouble() - 0.5) * changeRate;
                    Double previousValue = currentValues.get(factorType);
                    if (previousValue != null) {
                        currentValue = previousValue + randomDelta;
                    } else {
                        currentValue = baseValue + randomDelta;
                    }
                    log.debug("  RANDOM: {} = previous + {}", currentValue, randomDelta);
                    break;
                    
                default: // "NONE"
                    currentValue = baseValue;
                    log.debug("  NONE: {} (no change)", currentValue);
                    break;
            }
            
            // Применяем ограничения min/max
            if (minVal != null && currentValue < minVal) {
                log.debug("  Applying min limit: {} -> {}", currentValue, minVal);
                currentValue = minVal;
            }
            if (maxVal != null && currentValue > maxVal) {
                log.debug("  Applying max limit: {} -> {}", currentValue, maxVal);
                currentValue = maxVal;
            }
            
            // Сохраняем текущее значение
            Double oldValue = currentValues.get(factorType);
            currentValues.put(factorType, currentValue);
            lastUpdateTime.put(factorId, (long) currentTime * 1000);
            
            // Логируем изменение
            if (oldValue != null && Math.abs(oldValue - currentValue) > 0.01) {
                log.info("Factor {} ({}) changed: {:.2f} -> {:.2f} (Δ={:+.2f})", 
                    node.getName(), factorType, oldValue, currentValue, currentValue - oldValue);
            }
            
            // Генерируем события для факторов с реалистичными порогами
            generateRealisticFactorEvents(node, factorType, currentValue, currentTime, events);
        }
        
        // ❌ НЕТ значений по умолчанию!
        // Если фактор не добавлен на канвас, его НЕ будет в currentValues
        // В calculateDeviceMetrics будут использоваться базовые значения:
        // - TEMPERATURE: 25°C (NORMAL_OPERATING_TEMP)
        // - EMI: 20 dBm (NORMAL_EMI)
        // - VIBRATION: 10 Hz (NORMAL_VIBRATION)
        // - DUST: 5 mg/m³ (NORMAL_DUST)
    }

    private void generateRealisticFactorEvents(SchemaNode node, String factorType, double currentValue,
                                            int time, List<CriticalEvent> events) {
        
        Double warning = node.getWarningThreshold();
        Double critical = node.getCriticalThreshold();
        Double failure = node.getFailureThreshold();
        
        String severity = null;
        String message = null;
        
        // Используем реалистичные пороги если не заданы
        if (warning == null) {
            switch (factorType) {
                case "TEMPERATURE": warning = WARNING_TEMP; critical = CRITICAL_TEMP; failure = FAILURE_TEMP; break;
                case "EMI": warning = WARNING_EMI; critical = CRITICAL_EMI; failure = FAILURE_EMI; break;
                case "VIBRATION": warning = WARNING_VIBRATION; critical = CRITICAL_VIBRATION; failure = FAILURE_VIBRATION; break;
                case "DUST": warning = WARNING_DUST; critical = CRITICAL_DUST; failure = FAILURE_DUST; break;
            }
        }
        
        if (failure != null && currentValue > failure) {
            severity = "FAILURE";
            message = String.format("⚠️ КРИТИЧЕСКИЙ УРОВЕНЬ! %s достиг %.1f (порог отказа: %.1f)", 
                node.getName(), currentValue, failure);
        } else if (critical != null && currentValue > critical) {
            severity = "CRITICAL";
            message = String.format("🔴 КРИТИЧЕСКИЙ УРОВЕНЬ! %s достиг %.1f (порог: %.1f)", 
                node.getName(), currentValue, critical);
        } else if (warning != null && currentValue > warning) {
            severity = "WARNING";
            message = String.format("⚠️ ПРЕДУПРЕЖДЕНИЕ! %s достиг %.1f (порог: %.1f)", 
                node.getName(), currentValue, warning);
        }
        
        if (severity != null && message != null) {
            String eventType = "FACTOR_" + severity;
            boolean eventExists = events.stream().anyMatch(e -> 
                e.getDeviceId().equals(node.getId()) && 
                e.getType().equals(eventType));
            
            if (!eventExists) {
                events.add(CriticalEvent.builder()
                    .timestamp(time)
                    .type(eventType)
                    .deviceId(node.getId())
                    .deviceName(node.getName())
                    .message(message)
                    .severity(severity)
                    .factorType(factorType)
                    .factorValue(currentValue)
                    .recommendation(generateFactorRecommendation(factorType, severity, currentValue))
                    .build());
            }
        }
    }

    private String generateFactorRecommendation(String factorType, String severity, double currentValue) {
        switch (factorType) {
            case "TEMPERATURE":
                if ("FAILURE".equals(severity)) {
                    return "НЕМЕДЛЕННО! Отключите оборудование и установите промышленную систему охлаждения";
                } else if ("CRITICAL".equals(severity)) {
                    return "Срочно установите дополнительное охлаждение или переместите оборудование";
                } else {
                    return "Проверьте систему вентиляции и охлаждения";
                }
                
            case "EMI":
                if ("FAILURE".equals(severity)) {
                    return "НЕМЕДЛЕННО! Замените кабели на экранированные, установите ферритовые кольца";
                } else if ("CRITICAL".equals(severity)) {
                    return "Усильте экранирование, увеличьте расстояние до источников помех";
                } else {
                    return "Используйте экранированные кабели, проверьте заземление";
                }
                
            case "VIBRATION":
                if ("FAILURE".equals(severity)) {
                    return "НЕМЕДЛЕННО! Установите виброгасящие платформы, закрепите оборудование";
                } else if ("CRITICAL".equals(severity)) {
                    return "Используйте виброгасящие прокладки, перенесите оборудование";
                } else {
                    return "Проверьте крепления, используйте амортизаторы";
                }
                
            case "DUST":
                if ("FAILURE".equals(severity)) {
                    return "НЕМЕДЛЕННО! Очистите оборудование, установите фильтры вентиляции";
                } else if ("CRITICAL".equals(severity)) {
                    return "Установите герметичные шкафы с фильтрацией воздуха";
                } else {
                    return "Проведите очистку, установите противопылевые фильтры";
                }
                
            default:
                return "Проведите дополнительную диагностику";
        }
    }

    private String generateCableRecommendation(ElementSpecs specs) {
        List<String> recommendations = new ArrayList<>();
        
        // Рекомендации на основе типа кабеля
        if ("FIBER".equals(specs.getCableType())) {
            recommendations.add("Используйте оптический кабель с armored защитой");
            recommendations.add("Проверьте радиус изгиба (не менее 30мм)");
        } else if ("TWISTED_PAIR".equals(specs.getCableType())) {
            if (specs.getShieldingType() == null || specs.getShieldingType() == 0) {
                recommendations.add("Замените неэкранированный кабель (UTP) на экранированный (FTP/SFTP)");
            }
            recommendations.add("Увеличьте расстояние до силовых кабелей (минимум 30см)");
        } else if ("INDUSTRIAL".equals(specs.getCableType())) {
            recommendations.add("Проверьте целостность промышленной оболочки кабеля");
            recommendations.add("Убедитесь в надежности герметизации соединений");
        }
        
        // Рекомендации по длине
        if (specs.getCableLengthM() != null && specs.getCableLengthM() > 100) {
            recommendations.add("Уменьшите длину кабеля или установите промежуточный коммутатор");
            recommendations.add("Рассмотрите использование оптического кабеля для больших расстояний");
        }
        
        // Рекомендации по экранированию
        if (specs.getShieldingType() != null && specs.getShieldingType() == 0) {
            recommendations.add("Используйте кабель с двойным экранированием (S/FTP)");
            recommendations.add("Проверьте качество заземления экрана");
        }
        
        if (recommendations.isEmpty()) {
            recommendations.add("Проведите диагностику кабельной трассы");
            recommendations.add("Проверьте качество соединений и контактов");
        }
        
        return String.join("; ", recommendations);
    }

    /**
     * Генерация событий для устройств (с защитой от дублирования)
     */
    private void generateDeviceEvents(String nodeId, ElementSpecs specs, DeviceMetric metric,
                                    int time, List<CriticalEvent> events) {
        
        // Проверяем, было ли уже событие FAILURE для этого устройства
        boolean hasFailureEvent = events.stream().anyMatch(e -> 
            "DEVICE_FAILURE".equals(e.getType()) && 
            nodeId.equals(e.getDeviceId())
        );
        
        // Генерируем FAILURE только один раз
        if (!hasFailureEvent && metric.getPacketLossPercent() > 80) {
            events.add(CriticalEvent.builder()
                .timestamp(time)
                .type("DEVICE_FAILURE")
                .deviceId(nodeId)
                .deviceName(specs.getNodeName())
                .message(String.format("Устройство '%s' вышло из строя (потери пакетов: %.1f%%)", 
                    specs.getNodeName(), metric.getPacketLossPercent()))
                .severity("CRITICAL")
                .affectedElementType("DEVICE")
                .recommendation("Замените устройство на более устойчивое к промышленным факторам")
                .estimatedCost(specs.getReplacementCost() != null ? specs.getReplacementCost() : 0)
                .build());
        }
        
        // HIGH_LATENCY можно генерировать несколько раз, но с интервалом
        boolean recentLatencyEvent = events.stream().anyMatch(e -> 
            "HIGH_LATENCY".equals(e.getType()) && 
            nodeId.equals(e.getDeviceId()) &&
            (time - e.getTimestamp()) < 30  // не чаще чем раз в 30 секунд
        );
        
        if (!recentLatencyEvent && metric.getLatencyMs() > 200) {
            events.add(CriticalEvent.builder()
                .timestamp(time)
                .type("HIGH_LATENCY")
                .deviceId(nodeId)
                .deviceName(specs.getNodeName())
                .message(String.format("Задержка на устройстве '%s' достигла %.1f мс", 
                    specs.getNodeName(), metric.getLatencyMs()))
                .severity("WARNING")
                .affectedElementType("DEVICE")
                .recommendation("Проверьте качество соединений и загруженность сети")
                .build());
        }
    }

    /**
     * Расчет метрик устройства с учетом только связанных факторов
     * Нет глобальных факторов - только те, что имеют FACTOR_ELEMENT связь с устройством
     */
    private DeviceMetric calculateDeviceMetrics(ElementSpecs specs, List<FactorImpact> impacts,
                                                Map<String, Double> globalFactors, int time,
                                                DeviceState state, List<CriticalEvent> events) {
        
        double latency = specs.getBaseLatencyMs();
        double packetLoss = 0.0;
        double throughput = specs.getMaxThroughputMbps();
        String degradationCause = null;
        
        // Базовые нормальные значения (когда нет влияющих факторов)
        double currentTemp = NORMAL_OPERATING_TEMP;   // 25°C
        double currentEmi = NORMAL_EMI;               // 20 dBm
        double currentVibration = NORMAL_VIBRATION;   // 10 Hz
        double currentDust = NORMAL_DUST;             // 5 mg/m³
        
        // ============ ПРИМЕНЯЕМ ТОЛЬКО СВЯЗАННЫЕ ФАКТОРЫ ============
        // impacts содержит только факторы, которые имеют FACTOR_ELEMENT связь с этим устройством
        for (FactorImpact impact : impacts) {
            double effectiveValue = calculateEffectiveValue(impact, globalFactors, 0);
            
            switch (impact.getFactorType().toUpperCase()) {
                case "TEMPERATURE":
                    currentTemp = effectiveValue;
                    log.debug("Device {}: Temperature factor applied: {}°C", specs.getNodeName(), currentTemp);
                    break;
                case "EMI":
                    currentEmi = effectiveValue;
                    log.debug("Device {}: EMI factor applied: {} dBm", specs.getNodeName(), currentEmi);
                    break;
                case "VIBRATION":
                    currentVibration = effectiveValue;
                    log.debug("Device {}: Vibration factor applied: {} Hz", specs.getNodeName(), currentVibration);
                    break;
                case "DUST":
                    currentDust = effectiveValue;
                    log.debug("Device {}: Dust factor applied: {} mg/m³", specs.getNodeName(), currentDust);
                    break;
            }
        }
        
        // Применяем индивидуальные коэффициенты устройства
        double effectiveTemp = currentTemp * specs.getTempCoefficient();
        double effectiveEmi = currentEmi * specs.getEmiCoefficient();
        double effectiveVibration = currentVibration * specs.getVibrationCoefficient();
        double effectiveDust = currentDust * specs.getDustCoefficient();
        
        // ============ ВЛИЯНИЕ ТЕМПЕРАТУРЫ ============
        if (effectiveTemp > NORMAL_OPERATING_TEMP) {
            double excessTemp = effectiveTemp - NORMAL_OPERATING_TEMP;
            
            // Задержка растет с температурой
            latency *= (1 + (excessTemp / 10.0) * TEMP_LATENCY_FACTOR);
            
            // Потери пакетов растут экспоненциально при превышении порогов
            if (effectiveTemp > WARNING_TEMP) {
                double tempExcess = effectiveTemp - WARNING_TEMP;
                packetLoss += Math.pow(tempExcess / 10.0, 1.5) * TEMP_LOSS_FACTOR;
                if (degradationCause == null) {
                    degradationCause = "Перегрев (" + String.format("%.1f", effectiveTemp) + "°C)";
                } else {
                    degradationCause += ", перегрев";
                }
            }
            
            // Проверка на отказ
            if (effectiveTemp >= FAILURE_TEMP) {
                packetLoss = 100;
                latency = 1000;
                degradationCause = "Критический перегрев - устройство отказало";
                if (state != null && !state.isFailed()) {
                    state.setFailed(true);
                    events.add(createDeviceFailureEvent(specs, effectiveTemp, time));
                }
            }
            // Проверка на критические события
            else if (effectiveTemp >= CRITICAL_TEMP && !hasCriticalTempEvent(events, specs.getNodeId())) {
                events.add(createCriticalTempEvent(specs, effectiveTemp, time));
            }
        }
        
        // ============ ВЛИЯНИЕ ЭЛЕКТРОМАГНИТНЫХ ПОМЕХ ============
        if (effectiveEmi > NORMAL_EMI) {
            double excessEmi = effectiveEmi - NORMAL_EMI;
            
            if (effectiveEmi > WARNING_EMI) {
                double emiExcess = effectiveEmi - WARNING_EMI;
                packetLoss += Math.pow(emiExcess / 10.0, 1.3) * EMI_LOSS_FACTOR;
                if (degradationCause == null) {
                    degradationCause = "Электромагнитные помехи (" + String.format("%.1f", effectiveEmi) + " dBm)";
                } else {
                    degradationCause += ", электромагнитные помехи";
                }
            }
            
            // Отказ от EMI
            if (effectiveEmi >= FAILURE_EMI) {
                packetLoss = 100;
                latency = 1000;
                degradationCause = "Критический уровень EMI - устройство отказало";
                if (state != null && !state.isFailed()) {
                    state.setFailed(true);
                    events.add(createDeviceFailureEvent(specs, effectiveEmi, time));
                }
            }
        }
        
        // ============ ВЛИЯНИЕ ВИБРАЦИИ ============
        if (effectiveVibration > NORMAL_VIBRATION) {
            double excessVib = effectiveVibration - NORMAL_VIBRATION;
            
            if (effectiveVibration > WARNING_VIBRATION) {
                double vibExcess = effectiveVibration - WARNING_VIBRATION;
                packetLoss += Math.pow(vibExcess / 10.0, 1.2) * VIBRATION_LOSS_FACTOR;
                // Добавляем случайный джиттер от вибрации
                latency += Math.random() * vibExcess * 0.5;
                if (degradationCause == null) {
                    degradationCause = "Вибрация (" + String.format("%.1f", effectiveVibration) + " Hz)";
                } else {
                    degradationCause += ", вибрация";
                }
            }
            
            // Отказ от вибрации
            if (effectiveVibration >= FAILURE_VIBRATION) {
                packetLoss = 100;
                latency = 1000;
                degradationCause = "Критическая вибрация - устройство разрушено";
                if (state != null && !state.isFailed()) {
                    state.setFailed(true);
                    events.add(createDeviceFailureEvent(specs, effectiveVibration, time));
                }
            }
        }
        
        // ============ ВЛИЯНИЕ ПЫЛИ ============
        if (effectiveDust > NORMAL_DUST) {
            double excessDust = effectiveDust - NORMAL_DUST;
            
            if (effectiveDust > WARNING_DUST) {
                double dustExcess = effectiveDust - WARNING_DUST;
                packetLoss += Math.pow(dustExcess / 10.0, 1.4) * DUST_LOSS_FACTOR;
                // Пыль снижает пропускную способность
                throughput *= (1 - dustExcess / 100.0);
                if (degradationCause == null) {
                    degradationCause = "Запылённость (" + String.format("%.1f", effectiveDust) + " mg/m³)";
                } else {
                    degradationCause += ", запылённость";
                }
            }
            
            // Отказ от пыли
            if (effectiveDust >= FAILURE_DUST) {
                packetLoss = 100;
                throughput = 0;
                degradationCause = "Критическая запылённость - устройство вышло из строя";
                if (state != null && !state.isFailed()) {
                    state.setFailed(true);
                    events.add(createDeviceFailureEvent(specs, effectiveDust, time));
                }
            }
        }
        
        // ============ ЗАГРУЗКА И ЗАДЕРЖКИ ОЧЕРЕДИ ============
        double currentThroughput = Math.min(specs.getMaxThroughputMbps(), throughput);
        double utilization = currentThroughput / specs.getMaxThroughputMbps();
        
        if (utilization > 0.7) {
            // Экспоненциальный рост задержки при высокой загрузке
            double queueDelay = Math.pow((utilization - 0.7) * 10, 2);
            latency += queueDelay;
            if (degradationCause == null) {
                degradationCause = "Высокая загрузка (" + String.format("%.1f", utilization * 100) + "%)";
            }
        }
        
        // Ограничиваем значения
        packetLoss = Math.min(100, packetLoss);
        throughput = throughput * (1 - packetLoss / 100);
        latency = Math.max(latency, specs.getBaseLatencyMs());
        
        // Определяем статус
        String status;
        if (packetLoss >= 80 || (state != null && state.isFailed())) {
            status = "FAILED";
        } else if (packetLoss >= 20 || effectiveTemp >= CRITICAL_TEMP) {
            status = "DEGRADED";
        } else {
            status = "OPERATIONAL";
        }
        
        double utilizationPercent = (throughput / specs.getMaxThroughputMbps()) * 100;
        
        return DeviceMetric.builder()
            .latencyMs(Math.round(latency * 10) / 10.0)
            .packetLossPercent(Math.round(packetLoss * 10) / 10.0)
            .throughputMbps((double) Math.round(throughput))
            .temperature(Math.round(effectiveTemp * 10) / 10.0)
            .emiLevel(Math.round(effectiveEmi * 10) / 10.0)
            .vibrationLevel(Math.round(effectiveVibration * 10) / 10.0)
            .dustLevel(Math.round(effectiveDust * 10) / 10.0)
            .currentUtilizationPercent(Math.round(utilizationPercent * 10) / 10.0)
            .status(status)
            .degradationCause(degradationCause)
            .build();
    }

    private String analyzeCableDegradationCause(ElementSpecs specs, CableMetricDto metric) {
        List<String> causes = new ArrayList<>();
        
        if (specs.getShieldingType() == 0 && metric.getBitErrorRate() > 0.001) {
            causes.add("отсутствует экранирование");
        } else if (specs.getShieldingType() == 0 && metric.getBitErrorRate() > 0) {
            causes.add("недостаточное экранирование");
        }
        
        if (specs.getCableLengthM() > 100) {
            causes.add(String.format("длина кабеля %.0fм превышает норму", specs.getCableLengthM()));
        }
        
        if (metric.getAttenuationDb() > 20) {
            causes.add("высокое затухание сигнала");
        }
        
        if (metric.getBitErrorRate() > 0.01) {
            causes.add("высокая частота битовых ошибок (BER)");
        }
        
        return causes.isEmpty() ? "воздействие внешних факторов" : String.join(", ", causes);
    }

    private CriticalEvent createCableDegradationEvent(ElementSpecs specs, double value, double packetLoss, int time) {
        String cause = specs.getCableType() != null && "FIBER".equals(specs.getCableType()) 
            ? "Перегрев оптического кабеля" 
            : "Перегрев кабеля";
        
        return CriticalEvent.builder()
            .timestamp(time)
            .type("CABLE_DEGRADATION")
            .deviceId(specs.getNodeId())
            .deviceName(specs.getNodeName())
            .message(String.format("Кабель '%s' деградирует: потери %.1f%%, %s", 
                specs.getNodeName(), packetLoss, cause))
            .severity("WARNING")
            .affectedElementType("CABLE")
            .recommendation(generateCableRecommendation(specs))
            .build();
    }

    private CriticalEvent createCableFailureEvent(ElementSpecs specs, double value, int time, String cause) {
        String failureCause = (cause != null && !cause.isEmpty()) 
            ? cause 
            : "критическое воздействие факторов";
        
        return CriticalEvent.builder()
            .timestamp(time)
            .type("CABLE_FAILURE")
            .deviceId(specs.getNodeId())
            .deviceName(specs.getNodeName())
            .message(String.format("Кабель '%s' вышел из строя. Причина: %s", 
                specs.getNodeName(), failureCause))
            .severity("CRITICAL")
            .affectedElementType("CABLE")
            .recommendation(generateCableRecommendation(specs))
            .estimatedCost(5000.0)
            .build();
    }
    
    /**
     * Расчет метрик кабеля с учетом всех факторов
     * С защитой от дублирования событий
     */
    private CableMetricDto calculateCableMetricsDto(ElementSpecs specs, List<FactorImpact> impacts,
                                                    Map<String, Double> globalFactors, int time,
                                                    CableState state, List<CriticalEvent> events) {
        
        // Базовая задержка кабеля (скорость света в кабеле ~0.65c)
        double propagationSpeedFactor = 0.65;
        double latency = (specs.getCableLengthM() / (300000.0 * propagationSpeedFactor)) * 1000;
        double packetLoss = 0.0;
        double ber = 1e-12; // Базовый BER (очень низкий)
        double attenuation = specs.getAttenuationDbPerKm() * (specs.getCableLengthM() / 1000.0);
        String degradationCause = null;
        
        // Получаем текущие значения факторов
        double currentTemp = globalFactors.getOrDefault("TEMPERATURE", NORMAL_OPERATING_TEMP);
        double currentEmi = globalFactors.getOrDefault("EMI", NORMAL_EMI);
        double currentVibration = globalFactors.getOrDefault("VIBRATION", NORMAL_VIBRATION);
        double currentDust = globalFactors.getOrDefault("DUST", NORMAL_DUST);
        
        // Учет экранирования кабеля
        double shieldingFactor = getShieldingFactor(specs.getShieldingType());
        double effectiveEmi = currentEmi / shieldingFactor;
        
        // ============ ВЛИЯНИЕ ТЕМПЕРАТУРЫ НА КАБЕЛЬ ============
        if (currentTemp > WARNING_TEMP) {
            double excessTemp = currentTemp - WARNING_TEMP;
            
            // Затухание растет с температурой
            attenuation *= (1 + excessTemp / 50.0);
            
            // Потери пакетов
            packetLoss += excessTemp * 0.5;
            
            // Для оптики - дополнительные потери
            if ("FIBER".equals(specs.getCableType())) {
                packetLoss += excessTemp * 1.0;
                degradationCause = "Перегрев оптического кабеля";
            } else {
                degradationCause = "Перегрев кабеля";
            }
            
            // Критическая температура для кабеля - создаем событие ТОЛЬКО ОДИН РАЗ
            if (currentTemp > 85) {
                packetLoss = 100;
                degradationCause = "Критический перегрев - кабель поврежден";
                if (state != null && !state.isFailed()) {
                    state.setFailed(true);
                    state.setProblemCause(degradationCause);
                    // Проверяем, не было ли уже события FAILURE для этого кабеля
                    if (!hasCableEvent(events, specs.getNodeId(), "CABLE_FAILURE")) {
                        events.add(createCableFailureEvent(specs, currentTemp, time, degradationCause));
                    }
                }
            } else if (currentTemp > 70 && packetLoss > 20) {
                // Деградация - создаем событие ТОЛЬКО ОДИН РАЗ
                if (!hasCableEvent(events, specs.getNodeId(), "CABLE_DEGRADATION")) {
                    events.add(createCableDegradationEvent(specs, currentTemp, packetLoss, time));
                }
            }
        }
        
        // ============ ВЛИЯНИЕ ЭЛЕКТРОМАГНИТНЫХ ПОМЕХ НА КАБЕЛЬ ============
        if (effectiveEmi > WARNING_EMI) {
            double excessEmi = effectiveEmi - WARNING_EMI;
            
            // Расчет BER на основе EMI
            double snr = Math.max(0, 30 - excessEmi);
            ber = Math.pow(10, -snr / 10);
            
            // Потери из-за BER
            double emiLoss = ber * 100;
            packetLoss += emiLoss;
            
            // Для неэкранированных кабелей - больше потерь
            if (specs.getShieldingType() == 0) {
                packetLoss += excessEmi * 1.5;
                if (degradationCause == null) {
                    degradationCause = "Отсутствует экранирование, высокий уровень EMI";
                } else {
                    degradationCause += ", отсутствует экранирование";
                }
            } else {
                if (degradationCause == null) {
                    degradationCause = "Электромагнитные помехи";
                } else {
                    degradationCause += ", электромагнитные помехи";
                }
            }
            
            // Критический уровень EMI - создаем событие ТОЛЬКО ОДИН РАЗ
            if (effectiveEmi > 100) {
                packetLoss = 100;
                degradationCause = "Критический уровень EMI - кабель вышел из строя";
                if (state != null && !state.isFailed()) {
                    state.setFailed(true);
                    state.setProblemCause(degradationCause);
                    if (!hasCableEvent(events, specs.getNodeId(), "CABLE_FAILURE")) {
                        events.add(createCableFailureEvent(specs, effectiveEmi, time, degradationCause));
                    }
                }
            } else if (packetLoss > 15 && !hasCableEvent(events, specs.getNodeId(), "CABLE_DEGRADATION")) {
                events.add(createCableDegradationEvent(specs, effectiveEmi, packetLoss, time));
            }
        }
        
        // ============ ВЛИЯНИЕ ВИБРАЦИИ НА КАБЕЛЬ ============
        if (currentVibration > WARNING_VIBRATION) {
            double excessVib = currentVibration - WARNING_VIBRATION;
            
            // Вибрация вызывает микротрещины и потерю контакта
            packetLoss += excessVib * 0.8;
            
            // Добавляем мерцание (временные потери)
            if (Math.random() < excessVib / 100.0) {
                packetLoss += 10;
            }
            
            if (degradationCause == null) {
                degradationCause = "Вибрация вызывает микроповреждения";
            } else {
                degradationCause += ", вибрация";
            }
            
            // Критическая вибрация - создаем событие ТОЛЬКО ОДИН РАЗ
            if (currentVibration > 100) {
                packetLoss = 100;
                degradationCause = "Критическая вибрация - кабель разрушен";
                if (state != null && !state.isFailed()) {
                    state.setFailed(true);
                    state.setProblemCause(degradationCause);
                    if (!hasCableEvent(events, specs.getNodeId(), "CABLE_FAILURE")) {
                        events.add(createCableFailureEvent(specs, currentVibration, time, degradationCause));
                    }
                }
            } else if (packetLoss > 20 && !hasCableEvent(events, specs.getNodeId(), "CABLE_DEGRADATION")) {
                events.add(createCableDegradationEvent(specs, currentVibration, packetLoss, time));
            }
        }
        
        // ============ ВЛИЯНИЕ ПЫЛИ НА КАБЕЛЬ ============
        if (currentDust > WARNING_DUST && "CONNECTOR".equals(specs.getCableType())) {
            double excessDust = currentDust - WARNING_DUST;
            
            // Пыль на коннекторах увеличивает затухание
            attenuation += excessDust * 0.1;
            packetLoss += excessDust * 0.5;
            
            if (degradationCause == null) {
                degradationCause = "Запылённость коннекторов";
            } else {
                degradationCause += ", запылённость коннекторов";
            }
        }
        
        // ============ ВЛИЯНИЕ ДЛИНЫ КАБЕЛЯ ============
        if (specs.getCableLengthM() > 100) {
            double excessLength = specs.getCableLengthM() - 100;
            packetLoss += excessLength * 0.1;
            attenuation += excessLength / 100 * 0.5;
            
            if (degradationCause == null) {
                degradationCause = "Превышение максимальной длины";
            } else {
                degradationCause += ", превышение длины";
            }
        }
        
        // Ограничиваем значения
        packetLoss = Math.min(100, packetLoss);
        double throughput = specs.getBandwidthMbps() * (1 - packetLoss / 100);
        ber = Math.min(0.1, ber);
        
        // Задержка повторных передач при высоких потерях
        if (packetLoss > 30) {
            latency *= (1 + packetLoss / 100);
        }
        
        // Определяем статус
        String status;
        if (packetLoss >= 80 || (state != null && state.isFailed())) {
            status = "FAILED";
        } else if (packetLoss >= 15) {
            status = "DEGRADED";
        } else {
            status = "OPERATIONAL";
        }
        
        // Сохраняем причину деградации в состояние кабеля
        if (degradationCause != null && state != null) {
            state.setProblemCause(degradationCause);
        }
        
        return CableMetricDto.builder()
            .cableId(specs.getNodeId())
            .cableName(specs.getNodeName())
            .latencyMs(Math.round(latency * 10) / 10.0)
            .packetLossPercent(Math.round(packetLoss * 10) / 10.0)
            .throughputMbps((double) Math.round(throughput))
            .bitErrorRate(ber)
            .attenuationDb(Math.round(attenuation * 10) / 10.0)
            .status(status)
            .degradationCause(degradationCause)
            .build();
    }

    /**
     * Вспомогательный метод для проверки существования события для кабеля
     */
    private boolean hasCableEvent(List<CriticalEvent> events, String cableId, String eventType) {
        return events.stream().anyMatch(e -> 
            eventType.equals(e.getType()) && 
            cableId.equals(e.getDeviceId())
        );
    }

    private boolean hasCriticalTempEvent(List<CriticalEvent> events, String deviceId) {
        return events.stream().anyMatch(e -> 
            "CRITICAL_TEMPERATURE".equals(e.getType()) && 
            deviceId.equals(e.getDeviceId())
        );
    }

    private boolean hasCableDegradationEvent(List<CriticalEvent> events, String cableId) {
        return events.stream().anyMatch(e -> 
            "CABLE_DEGRADATION".equals(e.getType()) && 
            cableId.equals(e.getDeviceId())
        );
    }

    private CriticalEvent createDeviceFailureEvent(ElementSpecs specs, double value, int time) {
        return CriticalEvent.builder()
            .timestamp(time)
            .type("DEVICE_FAILURE")
            .deviceId(specs.getNodeId())
            .deviceName(specs.getNodeName())
            .message(String.format("Устройство '%s' вышло из строя (воздействие факторов: %.1f)", 
                specs.getNodeName(), value))
            .severity("CRITICAL")
            .affectedElementType("DEVICE")
            .recommendation(generateDeviceFailureRecommendation(specs))
            .estimatedCost(specs.getReplacementCost())
            .build();
    }

    private CriticalEvent createCriticalTempEvent(ElementSpecs specs, double temp, int time) {
        return CriticalEvent.builder()
            .timestamp(time)
            .type("CRITICAL_TEMPERATURE")
            .deviceId(specs.getNodeId())
            .deviceName(specs.getNodeName())
            .message(String.format("Критическая температура на устройстве '%s': %.1f°C", 
                specs.getNodeName(), temp))
            .severity("CRITICAL")
            .affectedElementType("DEVICE")
            .recommendation("Немедленно установите дополнительное охлаждение!")
            .build();
    }

    private String generateDeviceFailureRecommendation(ElementSpecs specs) {
        List<String> recs = new ArrayList<>();
        recs.add("Замените устройство");
        
        if (specs.getMaxOperatingTemp() != null && specs.getMaxOperatingTemp() < 50) {
            recs.add("Используйте устройство с более широким температурным диапазоном (промышленное исполнение)");
        }
        if (specs.getIpRating() != null && specs.getIpRating().startsWith("IP2")) {
            recs.add("Установите устройство в защищенный шкаф с охлаждением");
        }
        if (!Boolean.TRUE.equals(specs.getHasRedundantPower())) {
            recs.add("Используйте устройство с резервным питанием");
        }
        
        return String.join(". ", recs);
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
        
        // ============ ЭКОНОМИЧЕСКИЙ РАСЧЁТ ============
        double totalReplacementCost = 0;
        double totalRepairCost = 0;
        Map<String, Double> deviceReplacements = new HashMap<>();
        Map<String, Double> deviceRepairs = new HashMap<>();
        Map<String, Double> cableLosses = new HashMap<>();
        
        Map<String, ElementSpecs> elementSpecs = resultData.getElementSpecs();
        
        log.info("=== STARTING ECONOMY CALCULATION ===");
        log.info("Total devices in state: {}", resultData.getDeviceStates().size());
        
        for (DeviceState state : resultData.getDeviceStates().values()) {
            ElementSpecs specs = elementSpecs.get(state.getNodeId());
            double packetLoss = state.getLastPacketLoss();
            
            log.info("--- Device: {} ---", state.getNodeName());
            log.info("  isFailed: {}", state.isFailed());
            log.info("  lastPacketLoss: {}%", packetLoss);
            log.info("  specs exists: {}", specs != null);
            
            if (specs != null) {
                log.info("  replacementCost from Device: {}", specs.getReplacementCost());
                log.info("  repairCost from Device: {}", specs.getRepairCost());
                
                // Используем packetLoss для определения, так как isFailed может не обновляться
                if (packetLoss >= 80) {
                    double cost = specs.getReplacementCost() != null ? specs.getReplacementCost() : 0;
                    log.info("  >>> ADDING REPLACEMENT COST: {} ₽ for {}", cost, state.getNodeName());
                    totalReplacementCost += cost;
                    deviceReplacements.put(state.getNodeName(), cost);
                } else if (packetLoss > 20) {
                    double cost = specs.getRepairCost() != null ? specs.getRepairCost() : 0;
                    log.info("  >>> ADDING REPAIR COST: {} ₽ for {}", cost, state.getNodeName());
                    totalRepairCost += cost;
                    deviceRepairs.put(state.getNodeName(), cost);
                } else {
                    log.info("  >>> NO COST ADDED (packetLoss <= 20)");
                }
            } else {
                log.warn("  No ElementSpecs found for device: {}", state.getNodeName());
            }
        }
        
        // Объединяем для обратной совместимости
        Map<String, Double> deviceLosses = new HashMap<>();
        deviceLosses.putAll(deviceReplacements);
        deviceLosses.putAll(deviceRepairs);
        
        log.info("=== CABLE ECONOMY ===");
        for (CableState state : resultData.getCableStates().values()) {
            log.info("Cable: {}, isFailed: {}, packetLoss: {}", 
                state.getNodeName(), state.isFailed(), state.getLastPacketLoss());
            
            if (state.isFailed()) {
                double cableCost = 5000.0;
                log.info("  >>> ADDING CABLE REPLACEMENT COST: {} ₽", cableCost);
                cableLosses.put(state.getNodeName(), cableCost);
                totalReplacementCost += cableCost;
            } else if (state.getLastPacketLoss() > 20) {
                double cableRepairCost = 1000.0;
                log.info("  >>> ADDING CABLE REPAIR COST: {} ₽", cableRepairCost);
                cableLosses.put(state.getNodeName(), cableRepairCost);
                totalRepairCost += cableRepairCost;
            }
        }
        
        double totalEconomicLoss = totalReplacementCost + totalRepairCost;
        
        log.info("=== ECONOMY SUMMARY ===");
        log.info("Total Replacement Cost: {} ₽", totalReplacementCost);
        log.info("Total Repair Cost: {} ₽", totalRepairCost);
        log.info("Total Economic Loss: {} ₽", totalEconomicLoss);
        log.info("Device Replacements: {}", deviceReplacements);
        log.info("Device Repairs: {}", deviceRepairs);
        
        // Формируем Summary
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
        
        // Создаём результат
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
        
        // ============ ПОДГОТОВКА ДАННЫХ ДЛЯ JSON ============
        Map<String, Object> economicImpactMap = new HashMap<>();
        List<Map<String, Object>> deviceDetailsList = new ArrayList<>();
        List<Map<String, Object>> cableDetailsList = new ArrayList<>();
        Map<String, Object> factorContributions = new HashMap<>();
        
        try {
            // Экономический отчёт
            economicImpactMap.put("totalReplacementCost", totalReplacementCost);
            economicImpactMap.put("totalRepairCost", totalRepairCost);
            economicImpactMap.put("totalLoss", totalEconomicLoss);
            economicImpactMap.put("deviceLosses", deviceLosses);
            economicImpactMap.put("cableLosses", cableLosses);
            economicImpactMap.put("estimatedDowntimeCost", (double) devicesFailed * 3600 * 1000);
            
            // Детали устройств
            for (DeviceState state : resultData.getDeviceStates().values()) {
                Map<String, Object> deviceDetail = new HashMap<>();
                deviceDetail.put("id", state.getNodeId());
                deviceDetail.put("name", state.getNodeName());
                deviceDetail.put("packetLoss", state.getLastPacketLoss());
                deviceDetail.put("failed", state.isFailed());
                deviceDetail.put("replacementCost", 
                    elementSpecs.containsKey(state.getNodeId()) && elementSpecs.get(state.getNodeId()).getReplacementCost() != null 
                        ? elementSpecs.get(state.getNodeId()).getReplacementCost() : 0);
                deviceDetail.put("repairCost", 
                    elementSpecs.containsKey(state.getNodeId()) && elementSpecs.get(state.getNodeId()).getRepairCost() != null 
                        ? elementSpecs.get(state.getNodeId()).getRepairCost() : 0);
                deviceDetailsList.add(deviceDetail);
            }
            
            // Детали кабелей
            for (CableState state : resultData.getCableStates().values()) {
                Map<String, Object> cableDetail = new HashMap<>();
                cableDetail.put("id", state.getNodeId());
                cableDetail.put("name", state.getNodeName());
                cableDetail.put("packetLoss", state.getLastPacketLoss());
                cableDetail.put("failed", state.isFailed());
                cableDetail.put("problemCause", state.getProblemCause() != null ? state.getProblemCause() : "");
                cableDetailsList.add(cableDetail);
            }
            
            // Вклад факторов
            for (Map.Entry<String, Double> entry : resultData.getCurrentFactorValues().entrySet()) {
                Map<String, Object> factorInfo = new HashMap<>();
                factorInfo.put("value", entry.getValue());
                factorInfo.put("severity", getSeverityForFactorWithThresholds(entry.getValue(), null, null, null));
                factorContributions.put(entry.getKey(), factorInfo);
            }
            
            // Сериализация
            result.setSummary(objectMapper.writeValueAsString(summary));
            result.setTimeline(objectMapper.writeValueAsString(resultData.getTimeline()));
            result.setEvents(objectMapper.writeValueAsString(resultData.getEvents()));
            result.setEconomicImpact(objectMapper.writeValueAsString(economicImpactMap));
            result.setDeviceDetails(objectMapper.writeValueAsString(deviceDetailsList));
            result.setCableDetails(objectMapper.writeValueAsString(cableDetailsList));
            result.setFactorContributions(objectMapper.writeValueAsString(factorContributions));
            
            log.info("=== SAVING SIMULATION RESULT ===");
            log.info("EconomicImpact JSON: totalReplacementCost={}, totalRepairCost={}, totalLoss={}", 
                totalReplacementCost, totalRepairCost, totalEconomicLoss);
            log.info("DeviceDetails size: {}", deviceDetailsList.size());
            log.info("CableDetails size: {}", cableDetailsList.size());
            log.info("FactorContributions size: {}", factorContributions.size());
            
        } catch (Exception e) {
            log.error("Failed to serialize simulation results", e);
        }
        
        SimulationResult saved = simulationResultRepository.save(result);
        log.info("Saved result ID: {}, Grade: {}, TotalEconomicLoss: {}", 
            saved.getId(), saved.getGrade(), saved.getTotalEconomicLoss());
        
        return saved;
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

    private void generateCableEvents(String nodeId, ElementSpecs specs, CableMetricDto metric,
                                    int time, List<CriticalEvent> events) {
        
        // Проверяем, было ли уже событие DEGRADATION для этого кабеля
        boolean hasDegradationEvent = events.stream().anyMatch(e -> 
            "CABLE_DEGRADATION".equals(e.getType()) && 
            nodeId.equals(e.getDeviceId())
        );
        
        if (!hasDegradationEvent && metric.getPacketLossPercent() > 50) {
            String cause = analyzeCableDegradationCause(specs, metric);
            String recommendation = generateCableRecommendation(specs, metric, cause);
            
            events.add(CriticalEvent.builder()
                .timestamp(time)
                .type("CABLE_DEGRADATION")
                .deviceId(nodeId)
                .deviceName(specs.getNodeName())
                .message(String.format("Кабель '%s' деградировал: %s. Потери: %.1f%%, BER: %.6f", 
                    specs.getNodeName(), cause, metric.getPacketLossPercent(), metric.getBitErrorRate()))
                .severity(metric.getPacketLossPercent() > 80 ? "CRITICAL" : "WARNING")
                .recommendation(recommendation)
                .affectedElementType("CABLE")
                .build());
        }
    }

    private String generateCableRecommendation(ElementSpecs specs, CableMetricDto metric, String cause) {
        List<String> recommendations = new ArrayList<>();
        
        if (cause.contains("отсутствует экранирование") || cause.contains("недостаточное экранирование")) {
            recommendations.add("Замените кабель на экранированный (FTP/SFTP)");
            recommendations.add("Проложите кабель в металлическом кабель-канале");
        }
        
        if (cause.contains("превышение длины")) {
            recommendations.add("Уменьшите длину кабеля или установите промежуточный коммутатор");
            recommendations.add("Рассмотрите использование оптического кабеля для больших расстояний");
        }
        
        if (cause.contains("высокое затухание")) {
            recommendations.add("Используйте кабель с меньшим затуханием (например, с более толстой жилой)");
            recommendations.add("Добавьте ретрансляторы или медиаконвертеры");
        }
        
        if (metric.getBitErrorRate() > 0.01) {
            recommendations.add("Проверьте качество соединений и контактов");
            recommendations.add("Увеличьте расстояние до источников электромагнитных помех");
        }
        
        if (cause.contains("перегрев")) {
            recommendations.add("Увеличьте расстояние до источников тепла");
            recommendations.add("Используйте кабель с более высоким температурным рейтингом");
        }
        
        if (recommendations.isEmpty()) {
            return "Проведите диагностику кабельной трассы и проверьте качество соединений";
        }
        
        return String.join("; ", recommendations);
    }
    
    private String buildRecommendation(SimulationResultData resultData) {
        List<String> recommendations = new ArrayList<>();
        
        // Анализ по устройствам
        for (DeviceState state : resultData.getDeviceStates().values()) {
            if (state.getLastPacketLoss() > 80) {
                recommendations.add(String.format(
                    "Устройство '%s' вышло из строя (потери: %.1f%%). Требуется замена!",
                    state.getNodeName(), state.getLastPacketLoss()
                ));
            } else if (state.getLastPacketLoss() > 20) {
                recommendations.add(String.format(
                    "Устройство '%s' деградировано (потери: %.1f%%). Проверьте охлаждение и экранирование.",
                    state.getNodeName(), state.getLastPacketLoss()
                ));
            }
        }
        
        // Анализ по кабелям
        for (CableState state : resultData.getCableStates().values()) {
            if (state.getLastPacketLoss() > 80) {
                recommendations.add(String.format(
                    "Кабель '%s' вышел из строя. Причина: %s. Замените кабель!",
                    state.getNodeName(), state.getProblemCause() != null ? state.getProblemCause() : "неизвестна"
                ));
            } else if (state.getLastPacketLoss() > 20) {
                recommendations.add(String.format(
                    "Кабель '%s' деградирован (потери: %.1f%%). Причина: %s.",
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
                recommendations.add("Критическая температура! Установите дополнительное охлаждение.");
            } else if ("EMI".equals(factorType) && value > 70) {
                recommendations.add("Высокий уровень электромагнитных помех! Усильте экранирование.");
            } else if ("VIBRATION".equals(factorType) && value > 80) {
                recommendations.add("Критическая вибрация! Используйте виброгасящие прокладки.");
            } else if ("DUST".equals(factorType) && value > 40) {
                recommendations.add("Высокая запылённость! Установите фильтры вентиляции.");
            }
        }
        
        if (recommendations.isEmpty()) {
            recommendations.add("Сеть работает в нормальном режиме. Поддерживайте текущую конфигурацию.");
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
                // ============ ДОБАВИТЬ НОВЫЕ ПОЛЯ ============
                .economicImpact(result.getEconomicImpact() != null 
                    ? objectMapper.readValue(result.getEconomicImpact(), EconomicImpact.class)
                    : null)
                .deviceDetails(result.getDeviceDetails() != null 
                    ? objectMapper.readValue(result.getDeviceDetails(), new TypeReference<List<DeviceDetail>>() {})
                    : null)
                .cableDetails(result.getCableDetails() != null 
                    ? objectMapper.readValue(result.getCableDetails(), new TypeReference<List<CableDetail>>() {})
                    : null)
                .factorContributions(result.getFactorContributions() != null 
                    ? objectMapper.readValue(result.getFactorContributions(), new TypeReference<Map<String, FactorContribution>>() {})
                    : null)
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
                .grade(result.getGrade())
                .score(result.getScore())
                .createdAt(result.getCreatedAt().toString())
                .summary(summary)
                .timeline(objectMapper.readValue(result.getTimeline(),
                    new TypeReference<List<TimelinePoint>>() {}))
                .events(objectMapper.readValue(result.getEvents(),
                    new TypeReference<List<CriticalEvent>>() {}))
                // ============ ДОБАВИТЬ НОВЫЕ ПОЛЯ ============
                .economicImpact(result.getEconomicImpact() != null 
                    ? objectMapper.readValue(result.getEconomicImpact(), EconomicImpact.class)
                    : null)
                .deviceDetails(result.getDeviceDetails() != null 
                    ? objectMapper.readValue(result.getDeviceDetails(), new TypeReference<List<DeviceDetail>>() {})
                    : null)
                .cableDetails(result.getCableDetails() != null 
                    ? objectMapper.readValue(result.getCableDetails(), new TypeReference<List<CableDetail>>() {})
                    : null)
                .factorContributions(result.getFactorContributions() != null 
                    ? objectMapper.readValue(result.getFactorContributions(), new TypeReference<Map<String, FactorContribution>>() {})
                    : null)
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
        private String ipRating;           // Добавить
        private Boolean hasRedundantPower; // Добавить

        // Геттеры и сеттеры для новых полей
        public String getIpRating() { return ipRating; }
        public void setIpRating(String ipRating) { this.ipRating = ipRating; }

        public Boolean getHasRedundantPower() { return hasRedundantPower; }
        public void setHasRedundantPower(Boolean hasRedundantPower) { this.hasRedundantPower = hasRedundantPower; }

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
