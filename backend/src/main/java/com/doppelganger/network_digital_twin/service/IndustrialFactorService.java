package com.doppelganger.network_digital_twin.service;

import com.doppelganger.network_digital_twin.entity.IndustrialFactor;
import com.doppelganger.network_digital_twin.exception.ResourceNotFoundException;
import com.doppelganger.network_digital_twin.repository.IndustrialFactorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class IndustrialFactorService {
    
    private static final Logger log = LoggerFactory.getLogger(IndustrialFactorService.class);
    
    private final IndustrialFactorRepository industrialFactorRepository;
    
    public IndustrialFactorService(IndustrialFactorRepository industrialFactorRepository) {
        this.industrialFactorRepository = industrialFactorRepository;
    }
    
    public List<IndustrialFactor> getAllFactors() {
        log.debug("Fetching all industrial factors");
        return industrialFactorRepository.findAll();
    }
    
    public IndustrialFactor getFactorById(String id) {
        log.debug("Fetching factor with id: {}", id);
        return industrialFactorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Factor not found: " + id));
    }
    
    public IndustrialFactor getFactorByName(String name) {
        log.debug("Fetching factor by name: {}", name);
        return industrialFactorRepository.findByName(name)
            .orElseThrow(() -> new ResourceNotFoundException("Factor not found: " + name));
    }
    
    @Transactional
    public IndustrialFactor updateFactorValue(String id, Double newValue) {
        log.info("Updating factor {} to {}", id, newValue);
        
        IndustrialFactor factor = getFactorById(id);
        
        // Проверяем ограничения min/max
        if (factor.getMinValue() != null && newValue < factor.getMinValue()) {
            throw new IllegalArgumentException("Value " + newValue + " is below minimum " + factor.getMinValue());
        }
        if (factor.getMaxValue() != null && newValue > factor.getMaxValue()) {
            throw new IllegalArgumentException("Value " + newValue + " exceeds maximum " + factor.getMaxValue());
        }
        
        factor.setValue(newValue);
        return industrialFactorRepository.save(factor);
    }
    
    @Transactional
    public void createDefaultFactors() {
        if (industrialFactorRepository.count() == 0) {
            log.info("Creating default industrial factors");
            
            // Температура
            IndustrialFactor temperature = new IndustrialFactor();
            temperature.setName("temperature");
            temperature.setType("TEMPERATURE");
            temperature.setValue(25.0);
            temperature.setMinValue(-20.0);
            temperature.setMaxValue(80.0);
            temperature.setUnit("°C");
            temperature.setDescription("Температура в цеху");
            industrialFactorRepository.save(temperature);
            
            // Электромагнитные помехи
            IndustrialFactor emi = new IndustrialFactor();
            emi.setName("emi");
            emi.setType("EMI");
            emi.setValue(20.0);
            emi.setMinValue(0.0);
            emi.setMaxValue(100.0);
            emi.setUnit("dBm");
            emi.setDescription("Уровень электромагнитных помех");
            industrialFactorRepository.save(emi);
            
            // Вибрация
            IndustrialFactor vibration = new IndustrialFactor();
            vibration.setName("vibration");
            vibration.setType("VIBRATION");
            vibration.setValue(10.0);
            vibration.setMinValue(0.0);
            vibration.setMaxValue(120.0);
            vibration.setUnit("Hz");
            vibration.setDescription("Уровень вибрации оборудования");
            industrialFactorRepository.save(vibration);
            
            // Запыленность
            IndustrialFactor dust = new IndustrialFactor();
            dust.setName("dust");
            dust.setType("DUST");
            dust.setValue(10.0);
            dust.setMinValue(0.0);
            dust.setMaxValue(100.0);
            dust.setUnit("mg/m³");
            dust.setDescription("Концентрация пыли в воздухе");
            industrialFactorRepository.save(dust);
            
            log.info("Created 4 default industrial factors");
        }
    }
}
