package com.doppelganger.network_digital_twin.dto;

public class AuthResponseDto {
    private String token;
    private String userId;
    private String email;
    private String fullName;
    private String role;
    
    public AuthResponseDto(String token, String userId, String email, String fullName, String role) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
    }
    
    // Getters
    public String getToken() { return token; }
    public String getUserId() { return userId; }
    public String getEmail() { return email; }
    public String getFullName() { return fullName; }
    public String getRole() { return role; }
}
