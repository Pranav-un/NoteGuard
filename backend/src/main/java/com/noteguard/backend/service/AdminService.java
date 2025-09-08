package com.noteguard.backend.service;

import com.noteguard.backend.model.Note;
import com.noteguard.backend.model.User;
import com.noteguard.backend.repository.NoteRepository;
import com.noteguard.backend.repository.UserRepository;
import com.noteguard.backend.util.EncryptionUtil;
import com.noteguard.backend.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    private static final Logger logger = LoggerFactory.getLogger(AdminService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private EncryptionUtil encryptionUtil;

    /**
     * Get all users in the system (Admin only)
     * @return List of all users
     */
    public List<User> getAllUsers() {
        try {
            logger.info("Admin: Retrieving all users");
            List<User> users = userRepository.findAll();
            logger.info("Admin: Retrieved {} users", users.size());
            return users;
        } catch (Exception e) {
            logger.error("Admin: Error retrieving users: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve users: " + e.getMessage());
        }
    }

    /**
     * Get all notes in the system with decrypted content (Admin only)
     * @return List of all notes with decrypted content
     */
    public List<Note> getAllNotes() {
        try {
            logger.info("Admin: Retrieving all notes");
            List<Note> notes = noteRepository.findAll();
            
            // Decrypt content for all notes for admin view
            for (Note note : notes) {
                try {
                    if (note.getTitle() != null) {
                        note.setTitle(encryptionUtil.decrypt(note.getTitle()));
                    }
                    if (note.getContent() != null) {
                        note.setContent(encryptionUtil.decrypt(note.getContent()));
                    }
                } catch (Exception decryptException) {
                    logger.warn("Admin: Failed to decrypt note ID {}: {}", note.getId(), decryptException.getMessage());
                    // Keep encrypted content if decryption fails
                }
            }
            
            logger.info("Admin: Retrieved {} notes", notes.size());
            return notes;
        } catch (Exception e) {
            logger.error("Admin: Error retrieving notes: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve notes: " + e.getMessage());
        }
    }

    /**
     * Delete a user by ID (Admin only)
     * This will also delete all associated notes due to foreign key constraints
     * @param userId The ID of the user to delete
     */
    @Transactional
    public void deleteUser(Long userId) {
        try {
            logger.info("Admin: Attempting to delete user with ID: {}", userId);
            
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

            // Check if trying to delete an admin user
            if ("ADMIN".equals(user.getRole())) {
                logger.warn("Admin: Attempted to delete admin user: {}", user.getUsername());
                throw new AccessDeniedException("Cannot delete admin users");
            }

            // Get count of user's notes before deletion for logging
            long noteCount = noteRepository.countByUser(user);
            
            // Delete user (notes will be deleted automatically due to foreign key cascade)
            userRepository.delete(user);
            
            logger.info("Admin: Successfully deleted user '{}' (ID: {}) and {} associated notes", 
                       user.getUsername(), userId, noteCount);
            
        } catch (ResourceNotFoundException | AccessDeniedException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Admin: Error deleting user ID {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to delete user: " + e.getMessage());
        }
    }

    /**
     * Delete a note by ID (Admin only)
     * @param noteId The ID of the note to delete
     */
    @Transactional
    public void deleteNote(Long noteId) {
        try {
            logger.info("Admin: Attempting to delete note with ID: {}", noteId);
            
            Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with ID: " + noteId));

            // Log note details before deletion (without decrypting for security)
            String username = note.getUser() != null ? note.getUser().getUsername() : "unknown";
            logger.info("Admin: Deleting note ID {} belonging to user '{}'", noteId, username);
            
            noteRepository.delete(note);
            
            logger.info("Admin: Successfully deleted note ID {}", noteId);
            
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Admin: Error deleting note ID {}: {}", noteId, e.getMessage(), e);
            throw new RuntimeException("Failed to delete note: " + e.getMessage());
        }
    }

    /**
     * Get user statistics
     * @return UserStats object with user counts
     */
    public UserStats getUserStats() {
        try {
            long totalUsers = userRepository.count();
            long adminUsers = userRepository.countByRole("ADMIN");
            long regularUsers = totalUsers - adminUsers;
            
            return new UserStats(totalUsers, adminUsers, regularUsers);
        } catch (Exception e) {
            logger.error("Admin: Error getting user statistics: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get user statistics: " + e.getMessage());
        }
    }

    /**
     * Get note statistics
     * @return NoteStats object with note counts
     */
    public NoteStats getNoteStats() {
        try {
            long totalNotes = noteRepository.count();
            long notesWithShares = noteRepository.countByShareTokenIsNotNull();
            long expiredNotes = noteRepository.countExpiredNotes(java.time.LocalDateTime.now());
            
            return new NoteStats(totalNotes, notesWithShares, expiredNotes);
        } catch (Exception e) {
            logger.error("Admin: Error getting note statistics: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get note statistics: " + e.getMessage());
        }
    }

    // Inner classes for statistics
    public static class UserStats {
        private final long totalUsers;
        private final long adminUsers;
        private final long regularUsers;

        public UserStats(long totalUsers, long adminUsers, long regularUsers) {
            this.totalUsers = totalUsers;
            this.adminUsers = adminUsers;
            this.regularUsers = regularUsers;
        }

        public long getTotalUsers() {
            return totalUsers;
        }

        public long getAdminUsers() {
            return adminUsers;
        }

        public long getRegularUsers() {
            return regularUsers;
        }
    }

    public static class NoteStats {
        private final long totalNotes;
        private final long notesWithShares;
        private final long expiredNotes;

        public NoteStats(long totalNotes, long notesWithShares, long expiredNotes) {
            this.totalNotes = totalNotes;
            this.notesWithShares = notesWithShares;
            this.expiredNotes = expiredNotes;
        }

        public long getTotalNotes() {
            return totalNotes;
        }

        public long getNotesWithShares() {
            return notesWithShares;
        }

        public long getExpiredNotes() {
            return expiredNotes;
        }
    }
}
