package com.doppelganger.network_digital_twin.service;

import com.doppelganger.network_digital_twin.entity.Device;
import com.doppelganger.network_digital_twin.entity.Device.DeviceType;
import com.doppelganger.network_digital_twin.exception.ResourceNotFoundException;
import com.doppelganger.network_digital_twin.repository.DeviceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class DeviceService {
    
    private static final Logger log = LoggerFactory.getLogger(DeviceService.class);
    
    private final DeviceRepository deviceRepository;
    
    public DeviceService(DeviceRepository deviceRepository) {
        this.deviceRepository = deviceRepository;
    }
    
    public List<Device> getAllDevices() {
        log.debug("Fetching all devices");
        return deviceRepository.findAll();
    }
    
    public List<Device> getActiveDevices() {
        log.debug("Fetching active devices");
        return deviceRepository.findByIsActiveTrue();
    }
    
    public Device getDeviceById(String id) {
        log.debug("Fetching device with id: {}", id);
        return deviceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Device not found with id: " + id));
    }
    
    public Device getDeviceByName(String name) {
        log.debug("Fetching device with name: {}", name);
        return deviceRepository.findByName(name)
            .orElseThrow(() -> new ResourceNotFoundException("Device not found with name: " + name));
    }
    
    public List<Device> getDevicesByType(DeviceType type) {
        log.debug("Fetching devices by type: {}", type);
        return deviceRepository.findByType(type);
    }
    
    public List<Device> getDevicesByManufacturer(String manufacturer) {
        log.debug("Fetching devices by manufacturer: {}", manufacturer);
        return deviceRepository.findByManufacturer(manufacturer);
    }
    
    public List<Device> searchDevicesByName(String name) {
        log.debug("Searching devices by name: {}", name);
        return deviceRepository.findByNameContainingIgnoreCase(name);
    }
    
    public List<Device> getDevicesByMaxOperatingTemp(Double minTemp) {
        log.debug("Fetching devices with max operating temp >= {}", minTemp);
        return deviceRepository.findByMaxOperatingTempGreaterThanEqual(minTemp);
    }
    
    public List<Device> getDevicesByMaxEmiTolerance(Double minEmiTolerance) {
        log.debug("Fetching devices with max emi tolerance >= {}", minEmiTolerance);
        return deviceRepository.findByMaxEmiToleranceGreaterThanEqual(minEmiTolerance);
    }
    
    public List<Device> getDevicesByNeedsCooling(Boolean needsCooling) {
        log.debug("Fetching devices with needsCooling = {}", needsCooling);
        return deviceRepository.findByNeedsCooling(needsCooling);
    }
    
    public List<Device> getDevicesByIpRating(String ipRating) {
        log.debug("Fetching devices with ipRating = {}", ipRating);
        return deviceRepository.findByIpRating(ipRating);
    }
    
    @Transactional
    public Device createDevice(Device device) {
        log.info("Creating new device: {}", device.getName());
        
        if (deviceRepository.existsByName(device.getName())) {
            throw new IllegalArgumentException("Device with name '" + device.getName() + "' already exists");
        }
        
        // Установка значений по умолчанию
        if (device.getTempCoefficient() == null) device.setTempCoefficient(1.0);
        if (device.getEmiCoefficient() == null) device.setEmiCoefficient(1.0);
        if (device.getVibrationCoefficient() == null) device.setVibrationCoefficient(1.0);
        if (device.getDustCoefficient() == null) device.setDustCoefficient(1.0);
        if (device.getIsActive() == null) device.setIsActive(true);
        
        // Значения по умолчанию для допустимых диапазонов
        if (device.getMaxOperatingTemp() == null) device.setMaxOperatingTemp(70.0);
        if (device.getMinOperatingTemp() == null) device.setMinOperatingTemp(0.0);
        if (device.getMaxEmiTolerance() == null) device.setMaxEmiTolerance(80.0);
        if (device.getMaxVibrationTolerance() == null) device.setMaxVibrationTolerance(100.0);
        
        // Значения по умолчанию для экономических показателей
        if (device.getReplacementCost() == null) device.setReplacementCost(0.0);
        if (device.getRepairCost() == null) device.setRepairCost(0.0);
        
        // Значения по умолчанию для защиты
        if (device.getNeedsCooling() == null) device.setNeedsCooling(false);
        if (device.getHasRedundantPower() == null) device.setHasRedundantPower(false);
        if (device.getIpRating() == null) device.setIpRating("IP20");
        if (device.getOperatingHumidityMax() == null) device.setOperatingHumidityMax(85);
        
        return deviceRepository.save(device);
    }
    
    @Transactional
    public Device updateDevice(String id, Device updatedDevice) {
        log.info("Updating device with id: {}", id);
        
        Device existingDevice = getDeviceById(id);
        
        existingDevice.setName(updatedDevice.getName());
        existingDevice.setType(updatedDevice.getType());
        existingDevice.setManufacturer(updatedDevice.getManufacturer());
        existingDevice.setModel(updatedDevice.getModel());
        existingDevice.setPortCount(updatedDevice.getPortCount());
        existingDevice.setCpuPower(updatedDevice.getCpuPower());
        existingDevice.setRamMb(updatedDevice.getRamMb());
        existingDevice.setBaseLatencyMs(updatedDevice.getBaseLatencyMs());
        existingDevice.setMaxThroughputMbps(updatedDevice.getMaxThroughputMbps());
        existingDevice.setTempCoefficient(updatedDevice.getTempCoefficient());
        existingDevice.setEmiCoefficient(updatedDevice.getEmiCoefficient());
        existingDevice.setVibrationCoefficient(updatedDevice.getVibrationCoefficient());
        existingDevice.setDustCoefficient(updatedDevice.getDustCoefficient());
        
        // Допустимые диапазоны
        existingDevice.setMaxOperatingTemp(updatedDevice.getMaxOperatingTemp());
        existingDevice.setMinOperatingTemp(updatedDevice.getMinOperatingTemp());
        existingDevice.setMaxEmiTolerance(updatedDevice.getMaxEmiTolerance());
        existingDevice.setMaxVibrationTolerance(updatedDevice.getMaxVibrationTolerance());
        
        // Надежность
        existingDevice.setMtbfHours(updatedDevice.getMtbfHours());
        existingDevice.setMttrMinutes(updatedDevice.getMttrMinutes());
        existingDevice.setWarmUpTimeSeconds(updatedDevice.getWarmUpTimeSeconds());
        
        // Экономические показатели
        existingDevice.setReplacementCost(updatedDevice.getReplacementCost());
        existingDevice.setRepairCost(updatedDevice.getRepairCost());
        
        // Энергопотребление и защита
        existingDevice.setPowerConsumptionWatts(updatedDevice.getPowerConsumptionWatts());
        existingDevice.setHeatGenerationWatts(updatedDevice.getHeatGenerationWatts());
        existingDevice.setIpRating(updatedDevice.getIpRating());
        existingDevice.setOperatingHumidityMax(updatedDevice.getOperatingHumidityMax());
        existingDevice.setNeedsCooling(updatedDevice.getNeedsCooling());
        existingDevice.setHasRedundantPower(updatedDevice.getHasRedundantPower());
        
        existingDevice.setDescription(updatedDevice.getDescription());
        existingDevice.setIconUrl(updatedDevice.getIconUrl());
        existingDevice.setIsActive(updatedDevice.getIsActive());
        
        return deviceRepository.save(existingDevice);
    }
    
    @Transactional
    public void deactivateDevice(String id) {
        log.info("Deactivating device with id: {}", id);
        Device device = getDeviceById(id);
        device.setIsActive(false);
        deviceRepository.save(device);
    }
    
    @Transactional
    public void deleteDevice(String id) {
        log.info("Deleting device with id: {}", id);
        Device device = getDeviceById(id);
        deviceRepository.delete(device);
    }
    
    public List<Device> getIndustrialGradeDevices() {
        log.debug("Fetching industrial grade devices (tempCoeff < 1.5, emiCoeff < 1.5)");
        return deviceRepository.findIndustrialGradeDevices(1.5, 1.5);
    }
    
    public List<Object[]> getDeviceTypeStatistics() {
        log.debug("Fetching device type statistics");
        return deviceRepository.countDevicesByType();
    }
    
    public List<Device> getAllDevicesWithoutDefault() {
        return deviceRepository.findAll();
    }
}
