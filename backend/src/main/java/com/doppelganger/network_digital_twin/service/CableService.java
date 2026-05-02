package com.doppelganger.network_digital_twin.service;

import com.doppelganger.network_digital_twin.entity.Cable;
import com.doppelganger.network_digital_twin.entity.Cable.CableType;
import com.doppelganger.network_digital_twin.exception.ResourceNotFoundException;
import com.doppelganger.network_digital_twin.repository.CableRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class CableService {
    
    private static final Logger log = LoggerFactory.getLogger(CableService.class);
    
    private final CableRepository cableRepository;
    
    public CableService(CableRepository cableRepository) {
        this.cableRepository = cableRepository;
    }
    
    public List<Cable> getAllCables() {
        log.debug("Fetching all cables");
        return cableRepository.findAll();
    }
    
    public List<Cable> getActiveCables() {
        log.debug("Fetching active cables");
        return cableRepository.findByIsActiveTrue();
    }
    
    public Cable getCableById(String id) {
        log.debug("Fetching cable with id: {}", id);
        return cableRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Cable not found with id: " + id));
    }
    
    public List<Cable> getCablesByType(CableType type) {
        log.debug("Fetching cables by type: {}", type);
        return cableRepository.findByType(type);
    }
    
    public List<Cable> getIndustrialCables() {
        log.debug("Fetching industrial cables (immunity >= 7, temp >= 70)");
        return cableRepository.findIndustrialCables(7, 70);
    }
    
    public List<Cable> getShieldedCables() {
        log.debug("Fetching shielded cables");
        return cableRepository.findByShieldingTypeGreaterThan(0);
    }
    
    public List<Cable> searchCablesByPrice(Double maxPrice) {
        log.debug("Searching cables with price < {}", maxPrice);
        return cableRepository.findByPricePerMeterLessThan(maxPrice);
    }
    
    @Transactional
    public Cable createCable(Cable cable) {
        log.info("Creating new cable: {}", cable.getName());
        
        if (cableRepository.existsByName(cable.getName())) {
            throw new IllegalArgumentException("Cable with name '" + cable.getName() + "' already exists");
        }
        
        if (cable.getIsActive() == null) cable.setIsActive(true);
        if (cable.getPropagationSpeed() == null) cable.setPropagationSpeed(0.65);
        if (cable.getImmunityRating() == null) cable.setImmunityRating(5);
        if (cable.getTemperatureRating() == null) cable.setTemperatureRating(60);
        if (cable.getShieldingType() == null) cable.setShieldingType(0);
        
        return cableRepository.save(cable);
    }
    
    @Transactional
    public Cable updateCable(String id, Cable updatedCable) {
        log.info("Updating cable with id: {}", id);
        
        Cable existingCable = getCableById(id);
        
        existingCable.setName(updatedCable.getName());
        existingCable.setType(updatedCable.getType());
        existingCable.setManufacturer(updatedCable.getManufacturer());
        existingCable.setModel(updatedCable.getModel());
        existingCable.setMaxLengthM(updatedCable.getMaxLengthM());
        existingCable.setAttenuationDbPerKm(updatedCable.getAttenuationDbPerKm());
        existingCable.setPropagationSpeed(updatedCable.getPropagationSpeed());
        existingCable.setImpedanceOhms(updatedCable.getImpedanceOhms());
        existingCable.setCoreDiameterUm(updatedCable.getCoreDiameterUm());
        existingCable.setImmunityRating(updatedCable.getImmunityRating());
        existingCable.setTemperatureRating(updatedCable.getTemperatureRating());
        existingCable.setShieldingType(updatedCable.getShieldingType());
        existingCable.setPricePerMeter(updatedCable.getPricePerMeter());
        existingCable.setDescription(updatedCable.getDescription());
        existingCable.setIsActive(updatedCable.getIsActive());
        
        return cableRepository.save(existingCable);
    }
    
    @Transactional
    public void deactivateCable(String id) {
        log.info("Deactivating cable with id: {}", id);
        Cable cable = getCableById(id);
        cable.setIsActive(false);
        cableRepository.save(cable);
    }
    
    @Transactional
    public void deleteCable(String id) {
        log.info("Deleting cable with id: {}", id);
        Cable cable = getCableById(id);
        cableRepository.delete(cable);
    }
    
    public List<Cable> getAllCablesWithoutDefault() {
        return cableRepository.findAll();
    }
}
