package com.doppelganger.network_digital_twin.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "cables", indexes = {
    @Index(name = "idx_cable_type", columnList = "type"),
    @Index(name = "idx_cable_manufacturer", columnList = "manufacturer"),
    @Index(name = "idx_cable_shielding", columnList = "shielding_type")
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
    
    // ============ Физические характеристики ============
    private Double maxLengthM;           // максимальная длина в метрах
    private Double attenuationDbPerKm;   // затухание дБ/км
    private Double propagationSpeed;     // скорость распространения (% от скорости света)
    
    // ============ Механические характеристики ============
    @Column(name = "bending_radius_mm")
    private Double bendingRadiusMm;       // минимальный радиус изгиба (мм)
    
    @Column(name = "tensile_strength_n")
    private Integer tensileStrengthN;     // прочность на разрыв (Ньютонов)
    
    @Column(name = "operating_tension_max_n")
    private Integer operatingTensionMaxN; // максимальное рабочее натяжение (Н)
    
    // ============ Электрические/оптические параметры ============
    private Double impedanceOhms;        // импеданс в Омах (для меди)
    private Double coreDiameterUm;       // диаметр жилы/сердцевины в микронах
    
    @Column(name = "capacitance_per_km_nf")
    private Double capacitancePerKmNf;   // емкость на км (нФ)
    
    @Column(name = "resistance_per_km_ohms")
    private Double resistancePerKmOhms;  // сопротивление на км (Ом)
    
    // ============ Частотные характеристики ============
    @Column(name = "max_frequency_mhz")
    private Integer maxFrequencyMhz;     // максимальная рабочая частота (МГц)
    
    @Column(name = "signal_to_noise_ratio_db")
    private Integer signalToNoiseRatioDb; // отношение сигнал/шум (дБ)
    
    // ============ Промышленная устойчивость ============
    @Column(name = "immunity_rating")
    private Integer immunityRating;      // устойчивость к помехам (1-10, чем выше, тем лучше)
    
    @Column(name = "temperature_rating")
    private Integer temperatureRating;   // рабочий диапазон температур
    
    @Column(name = "shielding_type")
    private Integer shieldingType;       // тип экранирования (0-3)
    
    @Column(name = "oil_resistance")
    private Boolean oilResistance;       // маслостойкость
    
    @Column(name = "uv_resistance")
    private Boolean uvResistance;        // устойчивость к УФ-излучению
    
    @Column(name = "chemical_resistance", columnDefinition = "TEXT")
    private String chemicalResistance;   // химическая стойкость (JSON или текст)
    
    // ============ Срок службы и деградация ============
    @Column(name = "expected_lifetime_years")
    private Integer expectedLifetimeYears; // ожидаемый срок службы (лет)
    
    @Column(name = "degradation_rate_per_year")
    private Double degradationRatePerYear; // скорость деградации в год (%)
    
    // ============ Стоимость ============
    @Column(name = "price_per_meter")
    private Double pricePerMeter;        // цена за метр в рублях
    
    // ============ Дополнительные ============
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private Boolean isActive = true;
    
    @Column(nullable = false)
    private Boolean isCustom = false;    // false - системный кабель, true - созданный пользователем

    // ============ Геттеры и сеттеры для новых полей ============
    public Double getBendingRadiusMm() { return bendingRadiusMm; }
    public void setBendingRadiusMm(Double bendingRadiusMm) { this.bendingRadiusMm = bendingRadiusMm; }
    
    public Integer getTensileStrengthN() { return tensileStrengthN; }
    public void setTensileStrengthN(Integer tensileStrengthN) { this.tensileStrengthN = tensileStrengthN; }
    
    public Integer getOperatingTensionMaxN() { return operatingTensionMaxN; }
    public void setOperatingTensionMaxN(Integer operatingTensionMaxN) { this.operatingTensionMaxN = operatingTensionMaxN; }
    
    public Double getCapacitancePerKmNf() { return capacitancePerKmNf; }
    public void setCapacitancePerKmNf(Double capacitancePerKmNf) { this.capacitancePerKmNf = capacitancePerKmNf; }
    
    public Double getResistancePerKmOhms() { return resistancePerKmOhms; }
    public void setResistancePerKmOhms(Double resistancePerKmOhms) { this.resistancePerKmOhms = resistancePerKmOhms; }
    
    public Integer getMaxFrequencyMhz() { return maxFrequencyMhz; }
    public void setMaxFrequencyMhz(Integer maxFrequencyMhz) { this.maxFrequencyMhz = maxFrequencyMhz; }
    
    public Integer getSignalToNoiseRatioDb() { return signalToNoiseRatioDb; }
    public void setSignalToNoiseRatioDb(Integer signalToNoiseRatioDb) { this.signalToNoiseRatioDb = signalToNoiseRatioDb; }
    
    public Boolean getOilResistance() { return oilResistance; }
    public void setOilResistance(Boolean oilResistance) { this.oilResistance = oilResistance; }
    
    public Boolean getUvResistance() { return uvResistance; }
    public void setUvResistance(Boolean uvResistance) { this.uvResistance = uvResistance; }
    
    public String getChemicalResistance() { return chemicalResistance; }
    public void setChemicalResistance(String chemicalResistance) { this.chemicalResistance = chemicalResistance; }
    
    public Integer getExpectedLifetimeYears() { return expectedLifetimeYears; }
    public void setExpectedLifetimeYears(Integer expectedLifetimeYears) { this.expectedLifetimeYears = expectedLifetimeYears; }
    
    public Double getDegradationRatePerYear() { return degradationRatePerYear; }
    public void setDegradationRatePerYear(Double degradationRatePerYear) { this.degradationRatePerYear = degradationRatePerYear; }
    
    public Boolean getIsCustom() { return isCustom; }
    public void setIsCustom(Boolean isCustom) { this.isCustom = isCustom; }

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
