package com.doppelganger.network_digital_twin.controller;

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

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DeviceController {
    
    private final DeviceService deviceService;
    
    // GET /api/devices - получить все устройства
    @GetMapping
    public ResponseEntity<List<Device>> getAllDevices() {
        return ResponseEntity.ok(deviceService.getAllDevices());
    }
    
    // GET /api/devices/active - получить только активные
    @GetMapping("/active")
    public ResponseEntity<List<Device>> getActiveDevices() {
        return ResponseEntity.ok(deviceService.getActiveDevices());
    }
    
    // GET /api/devices/industrial - промышленно-стойкие устройства
    @GetMapping("/industrial")
    public ResponseEntity<List<Device>> getIndustrialDevices() {
        return ResponseEntity.ok(deviceService.getIndustrialGradeDevices());
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
    public ResponseEntity<Device> getDeviceById(@PathVariable String id) {
        return ResponseEntity.ok(deviceService.getDeviceById(id));
    }
    
    // GET /api/devices/type/{type} - устройства по типу
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Device>> getDevicesByType(@PathVariable DeviceType type) {
        return ResponseEntity.ok(deviceService.getDevicesByType(type));
    }
    
    // GET /api/devices/manufacturer/{manufacturer} - по производителю
    @GetMapping("/manufacturer/{manufacturer}")
    public ResponseEntity<List<Device>> getDevicesByManufacturer(@PathVariable String manufacturer) {
        return ResponseEntity.ok(deviceService.getDevicesByManufacturer(manufacturer));
    }
    
    // GET /api/devices/search?name=... - поиск по имени
    @GetMapping("/search")
    public ResponseEntity<List<Device>> searchDevices(@RequestParam String name) {
        return ResponseEntity.ok(deviceService.searchDevicesByName(name));
    }
    
    // POST /api/devices - создать устройство
    @PostMapping
    public ResponseEntity<Device> createDevice(@Valid @RequestBody Device device) {
        Device created = deviceService.createDevice(device);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    // PUT /api/devices/{id} - обновить устройство
    @PutMapping("/{id}")
    public ResponseEntity<Device> updateDevice(@PathVariable String id, @Valid @RequestBody Device device) {
        return ResponseEntity.ok(deviceService.updateDevice(id, device));
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
