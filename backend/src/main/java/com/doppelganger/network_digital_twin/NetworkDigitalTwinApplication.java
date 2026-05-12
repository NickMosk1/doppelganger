package com.doppelganger.network_digital_twin;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class NetworkDigitalTwinApplication implements CommandLineRunner {
    
    public NetworkDigitalTwinApplication() {
    }
    
    public static void main(String[] args) {
        SpringApplication.run(NetworkDigitalTwinApplication.class, args);
    }
    
    @Override
    public void run(String... args) {
    }
}
