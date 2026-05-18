package com.doppelganger.network_digital_twin.service.simulation;

import lombok.Data;

@Data
public class DeviceState {
    private String nodeId;
    private String nodeName;
    private double lastLatency;
    private double lastPacketLoss;
    private double lastThroughput;
    private boolean failed;
    
    public DeviceState(String nodeId, String nodeName) {
        this.nodeId = nodeId;
        this.nodeName = nodeName;
        this.failed = false;
    }
    
    public void setIsFailed(boolean failed) {
        this.failed = failed;
    }
    
    public boolean isFailed() {
        return failed;
    }
}