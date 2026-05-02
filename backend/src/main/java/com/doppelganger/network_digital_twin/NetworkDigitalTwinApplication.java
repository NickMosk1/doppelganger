package com.doppelganger.network_digital_twin;

import com.doppelganger.network_digital_twin.service.IndustrialFactorService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class NetworkDigitalTwinApplication implements CommandLineRunner {
    
    private final IndustrialFactorService factorService;
    
    public NetworkDigitalTwinApplication(IndustrialFactorService factorService) {
        this.factorService = factorService;
    }
    
    public static void main(String[] args) {
        SpringApplication.run(NetworkDigitalTwinApplication.class, args);
    }
    
    @Override
    public void run(String... args) {
        // Создаем стандартные промышленные факторы
        factorService.createDefaultFactors();
        System.out.println("Application started successfully!");
    }
}
