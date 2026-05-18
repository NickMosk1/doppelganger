package com.doppelganger.network_digital_twin.service.simulation;

import lombok.Data;

@Data
public class CableState {
    private String nodeId;
    private String nodeName;
    private double lastLatency;
    private double lastPacketLoss;
    private double lastThroughput;
    private boolean degraded;
    private boolean failed;
    private boolean problemDetected;
    private String problemCause;
    private String recommendation;
    private boolean notified;
    
    public CableState(String nodeId, String nodeName) {
        this.nodeId = nodeId;
        this.nodeName = nodeName;
        this.degraded = false;
        this.failed = false;
        this.problemDetected = false;
        this.notified = false;
    }
    
    public void setIsDegraded(boolean degraded) {
        this.degraded = degraded;
    }
    
    public void setIsFailed(boolean failed) {
        this.failed = failed;
    }
    
    public boolean isNotified() {
        return notified;
    }
    
    public void setNotified(boolean notified) {
        this.notified = notified;
    }
}