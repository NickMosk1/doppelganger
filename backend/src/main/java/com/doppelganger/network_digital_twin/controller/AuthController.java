package com.doppelganger.network_digital_twin.controller;

import com.doppelganger.network_digital_twin.dto.AuthRequestDto;
import com.doppelganger.network_digital_twin.dto.AuthResponseDto;
import com.doppelganger.network_digital_twin.dto.RegisterRequestDto;
import com.doppelganger.network_digital_twin.entity.User;
import com.doppelganger.network_digital_twin.repository.UserRepository;
import com.doppelganger.network_digital_twin.service.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    
    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService,
                          AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register(@RequestBody RegisterRequestDto request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole(User.Role.ADMIN);
        user.setIsActive(true);
        
        user = userRepository.save(user);
        
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        
        return ResponseEntity.ok(new AuthResponseDto(
            token, user.getId(), user.getEmail(), user.getFullName(), user.getRole().name()
        ));
    }
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@RequestBody AuthRequestDto request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        
        return ResponseEntity.ok(new AuthResponseDto(
            token, user.getId(), user.getEmail(), user.getFullName(), user.getRole().name()
        ));
    }
    
    @GetMapping("/me")
    public ResponseEntity<AuthResponseDto> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        String userId = jwtService.extractUserId(token);
        String email = jwtService.extractEmail(token);
        String role = jwtService.extractRole(token);
        
        User user = userRepository.findById(userId).orElse(null);
        
        return ResponseEntity.ok(new AuthResponseDto(
            token, userId, email, user != null ? user.getFullName() : "", role
        ));
    }
}
