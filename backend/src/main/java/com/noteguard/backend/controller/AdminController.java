package com.noteguard.backend.controller;

import com.noteguard.backend.model.Note;
import com.noteguard.backend.model.User;
import com.noteguard.backend.service.AdminService;
import com.noteguard.backend.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    /**
     * Get all users in the system
     * Only accessible to ADMIN role
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers(Authentication authentication) {
        try {
            List<User> users = adminService.getAllUsers();
            return ResponseEntity.ok(new ApiResponse<>("Users retrieved successfully", users, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>("Failed to retrieve users: " + e.getMessage(), null, false));
        }
    }

    /**
     * Get all notes in the system with decrypted content
     * Only accessible to ADMIN role
     */
    @GetMapping("/notes")
    public ResponseEntity<ApiResponse<List<Note>>> getAllNotes(Authentication authentication) {
        try {
            List<Note> notes = adminService.getAllNotes();
            return ResponseEntity.ok(new ApiResponse<>("Notes retrieved successfully", notes, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>("Failed to retrieve notes: " + e.getMessage(), null, false));
        }
    }

    /**
     * Delete a user by ID
     * Only accessible to ADMIN role
     * Note: This will also delete all associated notes
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id, Authentication authentication) {
        try {
            adminService.deleteUser(id);
            return ResponseEntity.ok(new ApiResponse<>("User deleted successfully", null, true));
        } catch (Exception e) {
            HttpStatus status;
            if (e.getMessage().contains("not found")) {
                status = HttpStatus.NOT_FOUND;
            } else if (e.getMessage().contains("Cannot delete admin")) {
                status = HttpStatus.FORBIDDEN;
            } else {
                status = HttpStatus.INTERNAL_SERVER_ERROR;
            }
            
            return ResponseEntity.status(status)
                .body(new ApiResponse<>(e.getMessage(), null, false));
        }
    }

    /**
     * Delete a note by ID
     * Only accessible to ADMIN role
     */
    @DeleteMapping("/notes/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNote(@PathVariable Long id, Authentication authentication) {
        try {
            adminService.deleteNote(id);
            return ResponseEntity.ok(new ApiResponse<>("Note deleted successfully", null, true));
        } catch (Exception e) {
            HttpStatus status = e.getMessage().contains("not found") ? 
                HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR;
            
            return ResponseEntity.status(status)
                .body(new ApiResponse<>(e.getMessage(), null, false));
        }
    }

    /**
     * Get user statistics
     * Only accessible to ADMIN role
     */
    @GetMapping("/stats/users")
    public ResponseEntity<ApiResponse<AdminService.UserStats>> getUserStats(Authentication authentication) {
        try {
            AdminService.UserStats stats = adminService.getUserStats();
            return ResponseEntity.ok(new ApiResponse<>("User statistics retrieved successfully", stats, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>("Failed to retrieve user statistics: " + e.getMessage(), null, false));
        }
    }

    /**
     * Get note statistics
     * Only accessible to ADMIN role
     */
    @GetMapping("/stats/notes")
    public ResponseEntity<ApiResponse<AdminService.NoteStats>> getNoteStats(Authentication authentication) {
        try {
            AdminService.NoteStats stats = adminService.getNoteStats();
            return ResponseEntity.ok(new ApiResponse<>("Note statistics retrieved successfully", stats, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>("Failed to retrieve note statistics: " + e.getMessage(), null, false));
        }
    }

    /**
     * Get admin dashboard overview
     * Combines user and note statistics
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboard>> getDashboard(Authentication authentication) {
        try {
            AdminService.UserStats userStats = adminService.getUserStats();
            AdminService.NoteStats noteStats = adminService.getNoteStats();
            
            AdminDashboard dashboard = new AdminDashboard(userStats, noteStats);
            return ResponseEntity.ok(new ApiResponse<>("Admin dashboard data retrieved successfully", dashboard, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>("Failed to retrieve dashboard data: " + e.getMessage(), null, false));
        }
    }

    // Inner class for dashboard data
    public static class AdminDashboard {
        private final AdminService.UserStats userStats;
        private final AdminService.NoteStats noteStats;

        public AdminDashboard(AdminService.UserStats userStats, AdminService.NoteStats noteStats) {
            this.userStats = userStats;
            this.noteStats = noteStats;
        }

        public AdminService.UserStats getUserStats() {
            return userStats;
        }

        public AdminService.NoteStats getNoteStats() {
            return noteStats;
        }
    }
}
