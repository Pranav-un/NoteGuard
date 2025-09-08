package com.noteguard.backend.controller;

import com.noteguard.backend.dto.AuthResponse;
import com.noteguard.backend.dto.ApiResponse;
import com.noteguard.backend.dto.LoginRequest;
import com.noteguard.backend.dto.RegisterRequest;
import com.noteguard.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(new ApiResponse<>("User registered successfully", response, true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                new ApiResponse<AuthResponse>(e.getMessage(), null, false)
            );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            System.out.println("Login request received: " + request.getEmailOrUsername());
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(new ApiResponse<>("Login successful", response, true));
        } catch (RuntimeException e) {
            System.out.println("Login error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(
                new ApiResponse<AuthResponse>(e.getMessage(), null, false)
            );
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Auth service is running!");
    }

    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<java.util.Map<String, Boolean>>> validateToken() {
        // If this endpoint is reached, the JWT filter already validated the token
        java.util.Map<String, Boolean> response = new java.util.HashMap<>();
        response.put("valid", true);
        return ResponseEntity.ok(new ApiResponse<>("Token is valid", response, true));
    }
}
