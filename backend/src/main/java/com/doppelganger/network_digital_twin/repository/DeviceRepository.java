package com.doppelganger.network_digital_twin.repository;

import com.doppelganger.network_digital_twin.entity.Device;
import com.doppelganger.network_digital_twin.entity.Device.DeviceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceRepository extends JpaRepository<Device, String> {

    // Поиск по типу устройства
    List<Device> findByType(DeviceType type);

    // Поиск по производителю
    List<Device> findByManufacturer(String manufacturer);

    // Поиск по имени (частичное совпадение)
    List<Device> findByNameContainingIgnoreCase(String name);

    // Поиск активных устройств
    List<Device> findByIsActiveTrue();

    // Поиск устройств с задержкой меньше указанной
    List<Device> findByBaseLatencyMsLessThan(Double maxLatency);

    // Поиск устройств с пропускной способностью больше указанной
    List<Device> findByMaxThroughputMbpsGreaterThan(Integer minThroughput);

    // ============ НОВЫЕ МЕТОДЫ ============
    
    // Поиск устройств с макс. рабочей температурой выше указанной
    List<Device> findByMaxOperatingTempGreaterThanEqual(Double minTemp);
    
    // Поиск устройств с устойчивостью к ЭМИ выше указанной
    List<Device> findByMaxEmiToleranceGreaterThanEqual(Double minEmiTolerance);
    
    // Поиск устройств по необходимости охлаждения
    List<Device> findByNeedsCooling(Boolean needsCooling);
    
    // Поиск устройств по IP защите
    List<Device> findByIpRating(String ipRating);
    
    // Поиск устройств с резервным питанием
    List<Device> findByHasRedundantPowerTrue();
    
    // Кастомный запрос: поиск устройств, подходящих для промышленных условий
    @Query("SELECT d FROM Device d WHERE d.tempCoefficient < :maxTempCoeff AND d.emiCoefficient < :maxEmiCoeff")
    List<Device> findIndustrialGradeDevices(@Param("maxTempCoeff") Double maxTempCoeff,
                                             @Param("maxEmiCoeff") Double maxEmiCoeff);

    // Подсчет устройств по типу
    @Query("SELECT d.type, COUNT(d) FROM Device d GROUP BY d.type")
    List<Object[]> countDevicesByType();

    // Проверка существования устройства с таким именем
    boolean existsByName(String name);

    // Поиск по умолчанию
    Optional<Device> findByName(String name);
}
