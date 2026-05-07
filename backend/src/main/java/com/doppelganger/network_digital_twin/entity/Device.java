package com.doppelganger.network_digital_twin.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "devices", indexes = {
    @Index(name = "idx_device_type", columnList = "type"),
    @Index(name = "idx_device_manufacturer", columnList = "manufacturer")
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

    // Аппаратные характеристики
    private Integer portCount;
    private Integer cpuPower;        // MHz
    private Integer ramMb;           // MB

    // Сетевые параметры
    private Double baseLatencyMs;    // базовая задержка в миллисекундах
    private Integer maxThroughputMbps; // максимальная пропускная способность в Мбит/с

    // Промышленные коэффициенты (чувствительность к факторам)
    // 1.0 = стандартная чувствительность, >1.0 = более чувствительный
    private Double tempCoefficient;     // чувствительность к температуре
    private Double emiCoefficient;      // чувствительность к электромагнитным помехам
    private Double vibrationCoefficient; // чувствительность к вибрации
    private Double dustCoefficient;     // чувствительность к пыли

    @Column(columnDefinition = "TEXT")
    private String description;

    private String iconUrl;  // иконка для фронта

    private Boolean isActive = true;

    @Column(nullable = false)
    private Boolean isCustom = false;

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
