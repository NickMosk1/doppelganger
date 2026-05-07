package com.doppelganger.network_digital_twin.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "cables", indexes = {
    @Index(name = "idx_cable_type", columnList = "type"),
    @Index(name = "idx_cable_manufacturer", columnList = "manufacturer")
})
@Data
public class Cable extends BaseEntity {
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private CableType type;
    
    @Column(length = 50)
    private String manufacturer;
    
    @Column(length = 50)
    private String model;
    
    // Физические характеристики
    private Double maxLengthM;           // максимальная длина в метрах
    private Double attenuationDbPerKm;   // затухание дБ/км
    private Double propagationSpeed;     // скорость распространения (% от скорости света)
    
    // Электрические/оптические характеристики
    private Double impedanceOhms;        // импеданс в Омах (для меди)
    private Double coreDiameterUm;       // диаметр жилы/сердцевины в микронах
    
    // Промышленная устойчивость (1-10, чем выше, тем лучше)
    private Integer immunityRating;      // устойчивость к помехам
    private Integer temperatureRating;   // рабочий диапазон температур
    private Integer shieldingType;       // тип экранирования (0-3)
    
    // Стоимость
    private Double pricePerMeter;        // цена за метр в рублях
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private Boolean isActive = true;

    @Column(nullable = false)
    private Boolean isCustom = false;  // false - системный кабель, true - созданный пользователем

    // Добавьте геттер и сеттер
    public Boolean getIsCustom() {
        return isCustom;
    }

    public void setIsCustom(Boolean isCustom) {
        this.isCustom = isCustom;
    }
    
    public enum CableType {
        COPPER("Медь (UTP/FTP)"),
        FIBER("Оптика (SM/MM)"),
        TWISTED_PAIR("Витая пара"),
        COAXIAL("Коаксиальный"),
        SHIELDED("Экранированный"),
        INDUSTRIAL("Промышленный");
        
        private final String russianName;
        
        CableType(String russianName) {
            this.russianName = russianName;
        }
        
        public String getRussianName() {
            return russianName;
        }
    }
    
    public enum ShieldingType {
        NONE(0, "Без экрана"),
        FOIL(1, "Фольга"),
        BRAID(2, "Оплетка"),
        DUAL(3, "Двойной экран");
        
        private final int code;
        private final String name;
        
        ShieldingType(int code, String name) {
            this.code = code;
            this.name = name;
        }
        
        public int getCode() { return code; }
        public String getName() { return name; }
        
        public static ShieldingType fromCode(int code) {
            for (ShieldingType type : values()) {
                if (type.code == code) return type;
            }
            return NONE;
        }
    }
}
