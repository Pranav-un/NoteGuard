package com.noteguard.backend.controller;

import com.noteguard.backend.model.Note;
import com.noteguard.backend.service.NoteService;
import com.noteguard.backend.service.CleanupService;
import com.noteguard.backend.dto.ApiResponse;
import com.noteguard.backend.dto.ShareTokenResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "*")
public class NoteController {

    @Autowired
    private NoteService noteService;

    @Autowired
    private CleanupService cleanupService;

    /**
     * Create a new note
     * Only authenticated users can create notes
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Note>> createNote(@Valid @RequestBody Note note, Authentication authentication) {
        try {
            String username = authentication.getName();
            Note createdNote = noteService.createNote(note, username);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>("Note created successfully", createdNote, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>("Failed to create note: " + e.getMessage(), null, false));
        }
    }

    /**
     * Create a new note with expiration time
     * Only authenticated users can create notes
     */
    @PostMapping("/with-expiration")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Note>> createNoteWithExpiration(@Valid @RequestBody Note note,
                                                                      @RequestParam int expirationHours,
                                                                      Authentication authentication) {
        try {
            String username = authentication.getName();
            java.time.LocalDateTime expirationTime = java.time.LocalDateTime.now().plusHours(expirationHours);
            Note createdNote = noteService.createNote(note, username, expirationTime);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>("Note created with expiration successfully", createdNote, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>("Failed to create note with expiration: " + e.getMessage(), null, false));
        }
    }

    /**
     * Get a note by ID
     * Only the owner or admin can access the note
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Note>> getNoteById(@PathVariable Long id, Authentication authentication) {
        try {
            String username = authentication.getName();
            Note note = noteService.getNoteById(id, username);
            
            return ResponseEntity.ok(new ApiResponse<>("Note retrieved successfully", note, true));
        } catch (Exception e) {
            HttpStatus status = e.getMessage().contains("Access denied") ? 
                HttpStatus.FORBIDDEN : HttpStatus.NOT_FOUND;
            
            return ResponseEntity.status(status)
                .body(new ApiResponse<>(e.getMessage(), null, false));
        }
    }

    /**
     * Get all notes for the current user
     * Only authenticated users can access their own notes
     */
    @GetMapping("/user")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<Note>>> getUserNotes(Authentication authentication) {
        try {
            String username = authentication.getName();
            List<Note> notes = noteService.getNotesByUser(username);
            
            return ResponseEntity.ok(new ApiResponse<>("Notes retrieved successfully", notes, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>("Failed to retrieve notes: " + e.getMessage(), null, false));
        }
    }

    /**
     * Update a note by ID
     * Only the owner or admin can update the note
     */
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Note>> updateNote(@PathVariable Long id, 
                                                       @Valid @RequestBody Note note, 
                                                       Authentication authentication) {
        try {
            String username = authentication.getName();
            Note updatedNote = noteService.updateNote(id, note, username);
            
            return ResponseEntity.ok(new ApiResponse<>("Note updated successfully", updatedNote, true));
        } catch (Exception e) {
            HttpStatus status;
            if (e.getMessage().contains("Access denied")) {
                status = HttpStatus.FORBIDDEN;
            } else if (e.getMessage().contains("not found")) {
                status = HttpStatus.NOT_FOUND;
            } else {
                status = HttpStatus.BAD_REQUEST;
            }
            
            return ResponseEntity.status(status)
                .body(new ApiResponse<>(e.getMessage(), null, false));
        }
    }

    /**
     * Delete a note by ID
     * Only the owner or admin can delete the note
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteNote(@PathVariable Long id, Authentication authentication) {
        try {
            String username = authentication.getName();
            noteService.deleteNote(id, username);
            
            return ResponseEntity.ok(new ApiResponse<>("Note deleted successfully", null, true));
        } catch (Exception e) {
            HttpStatus status;
            if (e.getMessage().contains("Access denied")) {
                status = HttpStatus.FORBIDDEN;
            } else if (e.getMessage().contains("not found")) {
                status = HttpStatus.NOT_FOUND;
            } else {
                status = HttpStatus.INTERNAL_SERVER_ERROR;
            }
            
            return ResponseEntity.status(status)
                .body(new ApiResponse<>(e.getMessage(), null, false));
        }
    }

    /**
     * Generate a share token for a note
     * Only the owner can generate share links
     */
    @PostMapping("/{id}/share")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ShareTokenResponse>> generateShareToken(@PathVariable Long id,
                                                                              @RequestParam(defaultValue = "24") int expirationHours,
                                                                              Authentication authentication) {
        try {
            String username = authentication.getName();
            String shareToken = noteService.generateShareToken(id, username, expirationHours);
            
            // Create share URL
            String shareUrl = "/api/notes/share/" + shareToken;
            
            ShareTokenResponse response = new ShareTokenResponse(
                shareToken,
                shareUrl,
                java.time.LocalDateTime.now().plusHours(expirationHours)
            );
            
            return ResponseEntity.ok(new ApiResponse<>("Share token generated successfully", response, true));
        } catch (Exception e) {
            HttpStatus status;
            if (e.getMessage().contains("Access denied")) {
                status = HttpStatus.FORBIDDEN;
            } else if (e.getMessage().contains("not found")) {
                status = HttpStatus.NOT_FOUND;
            } else {
                status = HttpStatus.BAD_REQUEST;
            }
            
            return ResponseEntity.status(status)
                .body(new ApiResponse<>(e.getMessage(), null, false));
        }
    }

    /**
     * Get a note by share token
     * Public endpoint - no authentication required
     */
    @GetMapping("/share/{token}")
    public ResponseEntity<ApiResponse<Note>> getNoteByShareToken(@PathVariable String token) {
        try {
            Note note = noteService.getNoteByShareToken(token);
            
            return ResponseEntity.ok(new ApiResponse<>("Shared note retrieved successfully", note, true));
        } catch (Exception e) {
            HttpStatus status = e.getMessage().contains("not found") || e.getMessage().contains("expired") ? 
                HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR;
            
            return ResponseEntity.status(status)
                .body(new ApiResponse<>(e.getMessage(), null, false));
        }
    }

    /**
     * Revoke a share token for a note
     * Only the owner can revoke share links
     */
    @DeleteMapping("/{id}/share")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> revokeShareToken(@PathVariable Long id, Authentication authentication) {
        try {
            String username = authentication.getName();
            noteService.revokeShareToken(id, username);
            
            return ResponseEntity.ok(new ApiResponse<>("Share token revoked successfully", null, true));
        } catch (Exception e) {
            HttpStatus status;
            if (e.getMessage().contains("Access denied")) {
                status = HttpStatus.FORBIDDEN;
            } else if (e.getMessage().contains("not found")) {
                status = HttpStatus.NOT_FOUND;
            } else {
                status = HttpStatus.INTERNAL_SERVER_ERROR;
            }
            
            return ResponseEntity.status(status)
                .body(new ApiResponse<>(e.getMessage(), null, false));
        }
    }

    /**
     * Manual cleanup of expired notes (Admin only)
     * Triggers immediate cleanup of expired notes and share tokens
     */
    @PostMapping("/admin/cleanup")
    @PreAuthorize("isAuthenticated() and hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> manualCleanup(Authentication authentication) {
        try {
            cleanupService.performManualCleanup();
            return ResponseEntity.ok(new ApiResponse<>("Manual cleanup completed successfully", "Cleanup executed", true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>("Failed to perform cleanup: " + e.getMessage(), null, false));
        }
    }

    /**
     * Get cleanup statistics
     * Shows count of notes expiring in the next specified hours
     */
    @GetMapping("/admin/cleanup/stats")
    @PreAuthorize("isAuthenticated() and hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CleanupStats>> getCleanupStats(@RequestParam(defaultValue = "24") int hours,
                                                                     Authentication authentication) {
        try {
            long expiringCount = cleanupService.getNotesExpiringInHours(hours);
            CleanupStats stats = new CleanupStats(expiringCount, hours);
            return ResponseEntity.ok(new ApiResponse<>("Cleanup statistics retrieved", stats, true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>("Failed to get cleanup statistics: " + e.getMessage(), null, false));
        }
    }

    // Inner class for cleanup statistics
    public static class CleanupStats {
        private final long notesExpiringCount;
        private final int hoursAhead;

        public CleanupStats(long notesExpiringCount, int hoursAhead) {
            this.notesExpiringCount = notesExpiringCount;
            this.hoursAhead = hoursAhead;
        }

        public long getNotesExpiringCount() {
            return notesExpiringCount;
        }

        public int getHoursAhead() {
            return hoursAhead;
        }
    }
}
