package com.noteguard.backend.util;

import com.noteguard.backend.model.Role;
import com.noteguard.backend.model.User;
import com.noteguard.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Utility class to create a new admin user on application startup
 * This will delete any existing admin users and create a fresh one
 * DISABLED: Only run when needed
 */
// @Component - DISABLED
@RequiredArgsConstructor
public class AdminUserCreator implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Delete existing admin users
        System.out.println("Deleting existing admin users...");
        userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.ADMIN)
                .forEach(userRepository::delete);

        // Create new admin user
        String adminUsername = "admin";
        String adminPassword = "Admin@123456"; // Strong password
        String adminEmail = "admin@noteguard.com";

        System.out.println("Creating new admin user...");
        User adminUser = User.builder()
                .username(adminUsername)
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .role(Role.ADMIN)
                .build();

        userRepository.save(adminUser);

        System.out.println("========================================");
        System.out.println("NEW ADMIN USER CREATED SUCCESSFULLY!");
        System.out.println("========================================");
        System.out.println("Username: " + adminUsername);
        System.out.println("Email: " + adminEmail);
        System.out.println("Password: " + adminPassword);
        System.out.println("========================================");
        System.out.println("Please save these credentials safely!");
        System.out.println("========================================");
    }
}
