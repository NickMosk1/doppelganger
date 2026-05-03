package com.doppelganger.network_digital_twin.exception;

public class SecurityException extends RuntimeException {
    
    public SecurityException(String message) {
        super(message);
    }
    
    public SecurityException(String message, Throwable cause) {
        super(message, cause);
    }
}
