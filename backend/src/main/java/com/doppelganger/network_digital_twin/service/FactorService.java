package com.doppelganger.network_digital_twin.service;

import com.doppelganger.network_digital_twin.entity.FactorNode;
import com.doppelganger.network_digital_twin.exception.ResourceNotFoundException;
import com.doppelganger.network_digital_twin.repository.FactorNodeRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Slf4j
@Transactional(readOnly = true)
public class FactorService {
    
    private final FactorNodeRepository factorNodeRepository;
    
    public FactorService(FactorNodeRepository factorNodeRepository) {
        this.factorNodeRepository = factorNodeRepository;
    }
    
    public List<FactorNode> getAllFactors() {
        log.debug("Fetching all factors");
        return factorNodeRepository.findAll();
    }
    
    public List<FactorNode> getFactorsBySchema(String schemaId) {
        log.debug("Fetching factors by schema: {}", schemaId);
        return factorNodeRepository.findBySchemaId(schemaId);
    }
    
    public FactorNode getFactorById(String id) {
        log.debug("Fetching factor by id: {}", id);
        return factorNodeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Factor not found: " + id));
    }
    
    public List<FactorNode> getFactorsByType(String type) {
        log.debug("Fetching factors by type: {}", type);
        return factorNodeRepository.findByFactorType(type);
    }
    
    public List<FactorNode> getActiveFactors() {
        log.debug("Fetching active factors");
        return factorNodeRepository.findByIsActiveTrue();
    }
    
    public List<FactorNode> getFactorsByPriority(Integer minPriority) {
        log.debug("Fetching factors with priority >= {}", minPriority);
        return factorNodeRepository.findByPriorityGreaterThanEqual(minPriority);
    }
    
    @Transactional
    public FactorNode createFactor(FactorNode factor) {
        log.info("Creating factor: {}", factor.getName());
        
        // Установка значений по умолчанию
        if (factor.getIsActive() == null) factor.setIsActive(true);
        if (factor.getFactorRadius() == null) factor.setFactorRadius(10.0);
        if (factor.getChangeRatePerSecond() == null) factor.setChangeRatePerSecond(0.0);
        if (factor.getValueChangePattern() == null) factor.setValueChangePattern("NONE");
        if (factor.getFalloffType() == null) factor.setFalloffType("NONE");
        if (factor.getFalloffExponent() == null) factor.setFalloffExponent(2.0);
        if (factor.getPriority() == null) factor.setPriority(5);
        
        return factorNodeRepository.save(factor);
    }
    
    @Transactional
    public FactorNode createFactorInSchema(String schemaId, FactorNode factor) {
        log.info("Creating factor in schema: {}", schemaId);
        // TODO: Загрузить Schema по ID и установить
        return createFactor(factor);
    }
    
    @Transactional
    public FactorNode updateFactor(String id, FactorNode updatedFactor) {
        log.info("Updating factor: {}", id);
        
        FactorNode factor = getFactorById(id);
        
        // Основные поля
        if (updatedFactor.getName() != null) factor.setName(updatedFactor.getName());
        if (updatedFactor.getCustomName() != null) factor.setCustomName(updatedFactor.getCustomName());
        if (updatedFactor.getFactorType() != null) factor.setFactorType(updatedFactor.getFactorType());
        if (updatedFactor.getFactorValue() != null) factor.setFactorValue(updatedFactor.getFactorValue());
        if (updatedFactor.getFactorUnit() != null) factor.setFactorUnit(updatedFactor.getFactorUnit());
        if (updatedFactor.getFactorRadius() != null) factor.setFactorRadius(updatedFactor.getFactorRadius());
        if (updatedFactor.getPositionX() != null) factor.setPositionX(updatedFactor.getPositionX());
        if (updatedFactor.getPositionY() != null) factor.setPositionY(updatedFactor.getPositionY());
        if (updatedFactor.getIsActive() != null) factor.setIsActive(updatedFactor.getIsActive());
        if (updatedFactor.getDescription() != null) factor.setDescription(updatedFactor.getDescription());
        
        // Динамические поля
        if (updatedFactor.getChangeRatePerSecond() != null) factor.setChangeRatePerSecond(updatedFactor.getChangeRatePerSecond());
        if (updatedFactor.getMinValue() != null) factor.setMinValue(updatedFactor.getMinValue());
        if (updatedFactor.getMaxValue() != null) factor.setMaxValue(updatedFactor.getMaxValue());
        if (updatedFactor.getValueChangePattern() != null) factor.setValueChangePattern(updatedFactor.getValueChangePattern());
        if (updatedFactor.getFrequencyHz() != null) factor.setFrequencyHz(updatedFactor.getFrequencyHz());
        
        // Временные характеристики
        if (updatedFactor.getStartTimeSeconds() != null) factor.setStartTimeSeconds(updatedFactor.getStartTimeSeconds());
        if (updatedFactor.getDurationSeconds() != null) factor.setDurationSeconds(updatedFactor.getDurationSeconds());
        
        // Пространственное распределение
        if (updatedFactor.getFalloffType() != null) factor.setFalloffType(updatedFactor.getFalloffType());
        if (updatedFactor.getFalloffExponent() != null) factor.setFalloffExponent(updatedFactor.getFalloffExponent());
        
        // Пороги
        if (updatedFactor.getWarningThreshold() != null) factor.setWarningThreshold(updatedFactor.getWarningThreshold());
        if (updatedFactor.getCriticalThreshold() != null) factor.setCriticalThreshold(updatedFactor.getCriticalThreshold());
        if (updatedFactor.getFailureThreshold() != null) factor.setFailureThreshold(updatedFactor.getFailureThreshold());
        
        // Приоритет
        if (updatedFactor.getPriority() != null) factor.setPriority(updatedFactor.getPriority());
        
        return factorNodeRepository.save(factor);
    }
    
    @Transactional
    public void deleteFactor(String id) {
        log.info("Deleting factor: {}", id);
        factorNodeRepository.deleteById(id);
    }

    public List<FactorNode> getDynamicFactors() {
        log.debug("Fetching dynamic factors (non-NONE pattern)");
        return factorNodeRepository.findByValueChangePatternNot("NONE");
    }
}