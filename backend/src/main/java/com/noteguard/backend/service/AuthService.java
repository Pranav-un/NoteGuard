package com.noteguard.backend.service;

import com.noteguard.backend.dto.AuthResponse;
import com.noteguard.backend.dto.LoginRequest;
import com.noteguard.backend.dto.RegisterRequest;
import com.noteguard.backend.model.Role;
import com.noteguard.backend.model.User;
import com.noteguard.backend.repository.UserRepository;
import com.noteguard.backend.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }

        // Create new user
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        User savedUser = userRepository.save(user);

        // Generate JWT token
        String token = jwtUtils.generateTokenFromUsername(savedUser.getUsername());

        return new AuthResponse(token, savedUser.getId(), savedUser.getUsername(), 
                              savedUser.getEmail(), savedUser.getRole());
    }

    public AuthResponse login(LoginRequest request) {
        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmailOrUsername(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate JWT token
        String token = jwtUtils.generateToken(authentication);

        // Get user details
        User user = userRepository.findByUsername(request.getEmailOrUsername())
                .orElseGet(() -> userRepository.findByEmail(request.getEmailOrUsername())
                        .orElseThrow(() -> new RuntimeException("User not found!")));

        return new AuthResponse(token, user.getId(), user.getUsername(), 
                              user.getEmail(), user.getRole());
    }
}
