package com.doppelganger.network_digital_twin.repository;

import com.doppelganger.network_digital_twin.entity.Cable;
import com.doppelganger.network_digital_twin.entity.Cable.CableType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CableRepository extends JpaRepository<Cable, String> {
    
    // Поиск по типу кабеля
    List<Cable> findByType(CableType type);
    
    // Поиск по производителю
    List<Cable> findByManufacturer(String manufacturer);
    
    // Поиск активных кабелей
    List<Cable> findByIsActiveTrue();
    
    // Кабели с экранированием
    List<Cable> findByShieldingTypeGreaterThan(Integer minShielding);
    
    // Кабели с высокой помехоустойчивостью
    List<Cable> findByImmunityRatingGreaterThanEqual(Integer minRating);
    
    // Кабели для промышленных условий
    @Query("SELECT c FROM Cable c WHERE c.immunityRating >= :minImmunity AND c.temperatureRating >= :minTemp")
    List<Cable> findIndustrialCables(@Param("minImmunity") Integer minImmunity, 
                                      @Param("minTemp") Integer minTemp);
    
    // Поиск по цене (дешевле указанной)
    List<Cable> findByPricePerMeterLessThan(Double maxPrice);
    
    // Поиск по максимальной длине
    List<Cable> findByMaxLengthMGreaterThanEqual(Double minLength);
    
    // Кабели с низким затуханием
    List<Cable> findByAttenuationDbPerKmLessThan(Double maxAttenuation);
    
    // Проверка существования
    boolean existsByName(String name);
}
