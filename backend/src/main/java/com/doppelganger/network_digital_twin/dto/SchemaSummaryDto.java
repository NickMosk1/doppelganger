// backend/src/main/java/com/doppelganger/network_digital_twin/dto/SchemaSummaryDto.java

package com.doppelganger.network_digital_twin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchemaSummaryDto {
    private String id;
    private String name;
    private String description;
    private Integer depth;
    private Boolean isPublic;
    private Integer usageCount;
    private String createdAt;
    private String updatedAt;
    private Long devicesCount;
    private Long cablesCount;
    private Long connectionsCount;
}
