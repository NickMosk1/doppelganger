package com.doppelganger.network_digital_twin.controller;

import com.doppelganger.network_digital_twin.dto.DeviceDto;
import com.doppelganger.network_digital_twin.entity.Device;
import com.doppelganger.network_digital_twin.entity.Device.DeviceType;
import com.doppelganger.network_digital_twin.service.DeviceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DeviceController {
    
    private final DeviceService deviceService;
    
    // GET /api/devices - получить все устройства (возвращаем DTO)
    @GetMapping
    public ResponseEntity<List<DeviceDto>> getAllDevices() {
        List<DeviceDto> devices = deviceService.getAllDevices().stream()
            .map(DeviceDto::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(devices);
    }
    
    // GET /api/devices/active - получить только активные
    @GetMapping("/active")
    public ResponseEntity<List<DeviceDto>> getActiveDevices() {
        List<DeviceDto> devices = deviceService.getActiveDevices().stream()
            .map(DeviceDto::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(devices);
    }
    
    // GET /api/devices/industrial - промышленно-стойкие устройства
    @GetMapping("/industrial")
    public ResponseEntity<List<DeviceDto>> getIndustrialDevices() {
        List<DeviceDto> devices = deviceService.getIndustrialGradeDevices().stream()
            .map(DeviceDto::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(devices);
    }
    
    // GET /api/devices/types - все типы устройств
    @GetMapping("/types")
    public ResponseEntity<Map<String, String>> getDeviceTypes() {
        return ResponseEntity.ok(Map.of(
            "ROUTER", DeviceType.ROUTER.getRussianName(),
            "SWITCH", DeviceType.SWITCH.getRussianName(),
            "PLC", DeviceType.PLC.getRussianName(),
            "SERVER", DeviceType.SERVER.getRussianName(),
            "WORKSTATION", DeviceType.WORKSTATION.getRussianName(),
            "FIREWALL", DeviceType.FIREWALL.getRussianName(),
            "ACCESS_POINT", DeviceType.ACCESS_POINT.getRussianName(),
            "CUSTOM", DeviceType.CUSTOM.getRussianName()
        ));
    }
    
    // GET /api/devices/statistics - статистика по типам
    @GetMapping("/statistics")
    public ResponseEntity<List<Object[]>> getStatistics() {
        return ResponseEntity.ok(deviceService.getDeviceTypeStatistics());
    }
    
    // GET /api/devices/{id} - получить устройство по ID
    @GetMapping("/{id}")
    public ResponseEntity<DeviceDto> getDeviceById(@PathVariable String id) {
        Device device = deviceService.getDeviceById(id);
        return ResponseEntity.ok(DeviceDto.fromEntity(device));
    }
    
    // GET /api/devices/type/{type} - устройства по типу
    @GetMapping("/type/{type}")
    public ResponseEntity<List<DeviceDto>> getDevicesByType(@PathVariable DeviceType type) {
        List<DeviceDto> devices = deviceService.getDevicesByType(type).stream()
            .map(DeviceDto::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(devices);
    }
    
    // GET /api/devices/manufacturer/{manufacturer} - по производителю
    @GetMapping("/manufacturer/{manufacturer}")
    public ResponseEntity<List<DeviceDto>> getDevicesByManufacturer(@PathVariable String manufacturer) {
        List<DeviceDto> devices = deviceService.getDevicesByManufacturer(manufacturer).stream()
            .map(DeviceDto::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(devices);
    }
    
    // GET /api/devices/search?name=... - поиск по имени
    @GetMapping("/search")
    public ResponseEntity<List<DeviceDto>> searchDevices(@RequestParam String name) {
        List<DeviceDto> devices = deviceService.searchDevicesByName(name).stream()
            .map(DeviceDto::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(devices);
    }
    
    // ============ НОВЫЕ ЭНДПОИНТЫ ДЛЯ ФИЛЬТРАЦИИ ============
    
    // GET /api/devices/high-temp - устройства, устойчивые к высоким температурам
    @GetMapping("/high-temp")
    public ResponseEntity<List<DeviceDto>> getHighTempDevices() {
        List<DeviceDto> devices = deviceService.getDevicesByMaxOperatingTemp(50.0).stream()
            .map(DeviceDto::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(devices);
    }
    
    // GET /api/devices/high-emi - устройства, устойчивые к ЭМИ
    @GetMapping("/high-emi")
    public ResponseEntity<List<DeviceDto>> getHighEmiDevices() {
        List<DeviceDto> devices = deviceService.getDevicesByMaxEmiTolerance(60.0).stream()
            .map(DeviceDto::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(devices);
    }
    
    // GET /api/devices/with-cooling - устройства, требующие охлаждения
    @GetMapping("/with-cooling")
    public ResponseEntity<List<DeviceDto>> getDevicesWithCooling() {
        List<DeviceDto> devices = deviceService.getDevicesByNeedsCooling(true).stream()
            .map(DeviceDto::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(devices);
    }
    
    // GET /api/devices/ip/{ipRating} - устройства с IP защитой
    @GetMapping("/ip/{ipRating}")
    public ResponseEntity<List<DeviceDto>> getDevicesByIpRating(@PathVariable String ipRating) {
        List<DeviceDto> devices = deviceService.getDevicesByIpRating(ipRating).stream()
            .map(DeviceDto::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(devices);
    }
    
    // GET /api/devices/high-reliability - устройства с высокой надежностью (MTBF > 50000)
    @GetMapping("/high-reliability")
    public ResponseEntity<List<DeviceDto>> getHighReliabilityDevices() {
        List<DeviceDto> devices = deviceService.getAllDevices().stream()
            .filter(d -> d.getMtbfHours() != null && d.getMtbfHours() > 50000)
            .map(DeviceDto::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(devices);
    }
    
    // GET /api/devices/low-cost-repair - устройства с дешевым ремонтом
    @GetMapping("/low-cost-repair")
    public ResponseEntity<List<DeviceDto>> getLowCostRepairDevices() {
        List<DeviceDto> devices = deviceService.getAllDevices().stream()
            .filter(d -> d.getRepairCost() != null && d.getRepairCost() < 5000)
            .map(DeviceDto::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(devices);
    }
    
    // ============ CRUD ОПЕРАЦИИ ============
    
    // POST /api/devices - создать устройство
    @PostMapping
    public ResponseEntity<DeviceDto> createDevice(@Valid @RequestBody Device device) {
        Device created = deviceService.createDevice(device);
        return ResponseEntity.status(HttpStatus.CREATED).body(DeviceDto.fromEntity(created));
    }
    
    // PUT /api/devices/{id} - обновить устройство
    @PutMapping("/{id}")
    public ResponseEntity<DeviceDto> updateDevice(@PathVariable String id, @Valid @RequestBody Device device) {
        Device updated = deviceService.updateDevice(id, device);
        return ResponseEntity.ok(DeviceDto.fromEntity(updated));
    }
    
    // DELETE /api/devices/{id} - удалить устройство
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDevice(@PathVariable String id) {
        deviceService.deleteDevice(id);
        return ResponseEntity.noContent().build();
    }
    
    // PATCH /api/devices/{id}/deactivate - деактивировать (мягкое удаление)
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateDevice(@PathVariable String id) {
        deviceService.deactivateDevice(id);
        return ResponseEntity.noContent().build();
    }
}
