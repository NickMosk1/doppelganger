package com.doppelganger.network_digital_twin.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "devices", indexes = {
    @Index(name = "idx_device_type", columnList = "type"),
    @Index(name = "idx_device_manufacturer", columnList = "manufacturer"),
    @Index(name = "idx_device_ip_rating", columnList = "ip_rating")
})
@Data
public class Device extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private DeviceType type;

    @Column(length = 50)
    private String manufacturer;

    @Column(length = 50)
    private String model;

    // ============ Аппаратные характеристики ============
    private Integer portCount;
    private Integer cpuPower;        // MHz
    private Integer ramMb;           // MB

    // ============ Сетевые параметры ============
    private Double baseLatencyMs;    // базовая задержка в миллисекундах
    private Integer maxThroughputMbps; // максимальная пропускная способность в Мбит/с

    // ============ Промышленные коэффициенты (чувствительность к факторам) ============
    // 1.0 = стандартная чувствительность, >1.0 = более чувствительный
    private Double tempCoefficient;     // чувствительность к температуре
    private Double emiCoefficient;      // чувствительность к электромагнитным помехам
    private Double vibrationCoefficient; // чувствительность к вибрации
    private Double dustCoefficient;     // чувствительность к пыли

    // ============ Допустимые диапазоны (критические точки) ============
    @Column(name = "max_operating_temp")
    private Double maxOperatingTemp;     // Максимальная рабочая температура (°C)
    
    @Column(name = "min_operating_temp")
    private Double minOperatingTemp;     // Минимальная рабочая температура (°C)
    
    @Column(name = "max_emi_tolerance")
    private Double maxEmiTolerance;      // Максимальный уровень ЭМИ (dBm)
    
    @Column(name = "max_vibration_tolerance")
    private Double maxVibrationTolerance; // Максимальный уровень вибрации (Hz)

    // ============ Надежность и восстановление ============
    @Column(name = "mtbf_hours")
    private Integer mtbfHours;           // Среднее время между отказами (часы)
    
    @Column(name = "mttr_minutes")
    private Integer mttrMinutes;         // Среднее время восстановления (минуты)
    
    @Column(name = "warm_up_time_seconds")
    private Integer warmUpTimeSeconds;   // Время выхода на рабочий режим (секунды)

    // ============ Экономические показатели ============
    @Column(name = "replacement_cost")
    private Double replacementCost;      // Стоимость замены устройства (руб)
    
    @Column(name = "repair_cost")
    private Double repairCost;           // Стоимость ремонта устройства (руб)

    // ============ Энергопотребление и защита ============
    @Column(name = "power_consumption_watts")
    private Integer powerConsumptionWatts; // Энергопотребление (Ватт)
    
    @Column(name = "heat_generation_watts")
    private Integer heatGenerationWatts;   // Тепловыделение (Ватт)
    
    @Column(name = "ip_rating", length = 10)
    private String ipRating;              // IP защита (например "IP67")
    
    @Column(name = "operating_humidity_max")
    private Integer operatingHumidityMax;  // Максимальная рабочая влажность (%)
    
    @Column(name = "needs_cooling")
    private Boolean needsCooling;         // Требуется ли дополнительное охлаждение
    
    @Column(name = "has_redundant_power")
    private Boolean hasRedundantPower;    // Есть ли резервное питание

    // ============ Дополнительные ============
    @Column(columnDefinition = "TEXT")
    private String description;

    private String iconUrl;  // иконка для фронта

    private Boolean isActive = true;

    @Column(nullable = false)
    private Boolean isCustom = false;

    // ============ Геттеры и сеттеры для новых полей ============
    public Double getReplacementCost() { return replacementCost; }
    public void setReplacementCost(Double replacementCost) { this.replacementCost = replacementCost; }
    
    public Double getRepairCost() { return repairCost; }
    public void setRepairCost(Double repairCost) { this.repairCost = repairCost; }
    
    public Double getMaxOperatingTemp() { return maxOperatingTemp; }
    public void setMaxOperatingTemp(Double maxOperatingTemp) { this.maxOperatingTemp = maxOperatingTemp; }
    
    public Double getMinOperatingTemp() { return minOperatingTemp; }
    public void setMinOperatingTemp(Double minOperatingTemp) { this.minOperatingTemp = minOperatingTemp; }
    
    public Double getMaxEmiTolerance() { return maxEmiTolerance; }
    public void setMaxEmiTolerance(Double maxEmiTolerance) { this.maxEmiTolerance = maxEmiTolerance; }
    
    public Double getMaxVibrationTolerance() { return maxVibrationTolerance; }
    public void setMaxVibrationTolerance(Double maxVibrationTolerance) { this.maxVibrationTolerance = maxVibrationTolerance; }
    
    public Integer getMtbfHours() { return mtbfHours; }
    public void setMtbfHours(Integer mtbfHours) { this.mtbfHours = mtbfHours; }
    
    public Integer getMttrMinutes() { return mttrMinutes; }
    public void setMttrMinutes(Integer mttrMinutes) { this.mttrMinutes = mttrMinutes; }
    
    public Integer getWarmUpTimeSeconds() { return warmUpTimeSeconds; }
    public void setWarmUpTimeSeconds(Integer warmUpTimeSeconds) { this.warmUpTimeSeconds = warmUpTimeSeconds; }
    
    public Integer getPowerConsumptionWatts() { return powerConsumptionWatts; }
    public void setPowerConsumptionWatts(Integer powerConsumptionWatts) { this.powerConsumptionWatts = powerConsumptionWatts; }
    
    public Integer getHeatGenerationWatts() { return heatGenerationWatts; }
    public void setHeatGenerationWatts(Integer heatGenerationWatts) { this.heatGenerationWatts = heatGenerationWatts; }
    
    public String getIpRating() { return ipRating; }
    public void setIpRating(String ipRating) { this.ipRating = ipRating; }
    
    public Integer getOperatingHumidityMax() { return operatingHumidityMax; }
    public void setOperatingHumidityMax(Integer operatingHumidityMax) { this.operatingHumidityMax = operatingHumidityMax; }
    
    public Boolean getNeedsCooling() { return needsCooling; }
    public void setNeedsCooling(Boolean needsCooling) { this.needsCooling = needsCooling; }
    
    public Boolean getHasRedundantPower() { return hasRedundantPower; }
    public void setHasRedundantPower(Boolean hasRedundantPower) { this.hasRedundantPower = hasRedundantPower; }

    public Boolean getIsCustom() {
        return isCustom;
    }

    public void setIsCustom(Boolean isCustom) {
        this.isCustom = isCustom;
    }

    public enum DeviceType {
        ROUTER("Маршрутизатор"),
        SWITCH("Коммутатор"),
        PLC("Программируемый логический контроллер"),
        SERVER("Сервер"),
        WORKSTATION("Рабочая станция"),
        FIREWALL("Межсетевой экран"),
        ACCESS_POINT("Точка доступа"),
        CUSTOM("Пользовательское");

        private final String russianName;

        DeviceType(String russianName) {
            this.russianName = russianName;
        }

        public String getRussianName() {
            return russianName;
        }
    }
}
