// backend/src/main/java/com/doppelganger/network_digital_twin/service/FactorService.java
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
    
    @Transactional
    public FactorNode createFactor(FactorNode factor) {
        log.info("Creating factor: {}", factor.getName());
        
        if (factor.getIsActive() == null) factor.setIsActive(true);
        if (factor.getFactorRadius() == null) factor.setFactorRadius(10.0);
        
        return factorNodeRepository.save(factor);
    }
    
    @Transactional
    public FactorNode createFactorInSchema(String schemaId, FactorNode factor) {
        log.info("Creating factor in schema: {}", schemaId);
        // Временно устанавливаем schemaId через отдельный метод
        // В реальности нужно передавать schema через сервис схем
        factor.setSchema(null); // TODO: Загрузить Schema по ID
        return createFactor(factor);
    }
    
    @Transactional
    public FactorNode updateFactor(String id, FactorNode updatedFactor) {
        log.info("Updating factor: {}", id);
        
        FactorNode factor = getFactorById(id);
        
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
        
        return factorNodeRepository.save(factor);
    }
    
    @Transactional
    public void deleteFactor(String id) {
        log.info("Deleting factor: {}", id);
        factorNodeRepository.deleteById(id);
    }
}
