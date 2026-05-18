package com.doppelganger.network_digital_twin.service.simulation;

import lombok.Data;

@Data
public class FactorImpact {
    private String factorId;
    private String factorType;      // TEMPERATURE, EMI, VIBRATION, DUST
    private Double factorValue;     // текущее значение фактора
    private Double distance;        // расстояние от фактора до элемента (метры)
    private Double attenuation;     // коэффициент ослабления от связи
    private Double radius;          // радиус влияния фактора
}