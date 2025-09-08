package com.noteguard.backend.service;

import com.noteguard.backend.model.Note;
import com.noteguard.backend.model.User;
import com.noteguard.backend.repository.NoteRepository;
import com.noteguard.backend.repository.UserRepository;
import com.noteguard.backend.util.EncryptionUtil;
import com.noteguard.backend.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class NoteService {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EncryptionUtil encryptionUtil;

    /**
     * Creates a new note with encrypted content
     * @param note The note to create
     * @param username The username of the note owner
     * @return The created note with decrypted content for response
     */
    public Note createNote(Note note, String username) {
        return createNote(note, username, null);
    }

    /**
     * Creates a new note with encrypted content and optional expiration
     * @param note The note to create
     * @param username The username of the note owner
     * @param expirationTime Optional expiration time for the note
     * @return The created note with decrypted content for response
     */
    public Note createNote(Note note, String username, LocalDateTime expirationTime) {
        try {
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            // Encrypt the content before saving
            String encryptedContent = encryptionUtil.encrypt(note.getContent());
            String encryptedTitle = encryptionUtil.encrypt(note.getTitle());

            note.setTitle(encryptedTitle);
            note.setContent(encryptedContent);
            note.setUser(user);
            note.setOwnerId(user.getId()); // Set owner_id to the same user ID
            note.setCreatedAt(LocalDateTime.now());
            note.setUpdatedAt(LocalDateTime.now());
            
            // Set expiration time if provided
            if (expirationTime != null) {
                note.setExpirationTime(expirationTime);
            }

            Note savedNote = noteRepository.save(note);

            // Decrypt content for response
            savedNote.setTitle(note.getTitle().equals(encryptedTitle) ? 
                encryptionUtil.decrypt(savedNote.getTitle()) : savedNote.getTitle());
            savedNote.setContent(note.getContent().equals(encryptedContent) ? 
                encryptionUtil.decrypt(savedNote.getContent()) : savedNote.getContent());

            return savedNote;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create note: " + e.getMessage());
        }
    }

    /**
     * Check if a note is expired
     * @param note The note to check
     * @return true if the note is expired, false otherwise
     */
    private boolean isNoteExpired(Note note) {
        return note.getExpirationTime() != null && 
               LocalDateTime.now().isAfter(note.getExpirationTime());
    }

    /**
     * Fetches a note by ID and decrypts its content
     * @param noteId The ID of the note
     * @param username The username of the requesting user
     * @return The note with decrypted content
     */
    public Note getNoteById(Long noteId, String username) {
        try {
            Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));

            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            // Check if user owns the note or is admin
            if (!note.getUser().getId().equals(user.getId()) && !"ADMIN".equals(user.getRole())) {
                throw new AccessDeniedException("Access denied: You can only access your own notes");
            }

            // Check if note is expired
            if (isNoteExpired(note)) {
                throw new ResourceNotFoundException("Note has expired and is no longer available");
            }

            // Decrypt content for response
            try {
                note.setTitle(encryptionUtil.decrypt(note.getTitle()));
                note.setContent(encryptionUtil.decrypt(note.getContent()));
            } catch (Exception decryptException) {
                throw new RuntimeException("Failed to decrypt note content: " + decryptException.getMessage());
            }

            return note;
        } catch (Exception e) {
            if (e instanceof ResourceNotFoundException || e instanceof AccessDeniedException) {
                throw e;
            }
            throw new RuntimeException("Failed to fetch note: " + e.getMessage());
        }
    }

    /**
     * Fetches all notes for a specific user
     * @param username The username of the user
     * @return List of notes with decrypted content
     */
    public List<Note> getNotesByUser(String username) {
        try {
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            List<Note> notes = noteRepository.findByUserOrderByCreatedAtDesc(user);

            // Filter out expired notes and decrypt content for remaining notes
            List<Note> validNotes = new ArrayList<>();
            for (Note note : notes) {
                // Skip expired notes
                if (isNoteExpired(note)) {
                    continue;
                }
                
                try {
                    note.setTitle(encryptionUtil.decrypt(note.getTitle()));
                    note.setContent(encryptionUtil.decrypt(note.getContent()));
                    validNotes.add(note);
                } catch (Exception decryptException) {
                    throw new RuntimeException("Failed to decrypt note content: " + decryptException.getMessage());
                }
            }

            return validNotes;
        } catch (ResourceNotFoundException | AccessDeniedException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch user notes: " + e.getMessage());
        }
    }

    /**
     * Updates an existing note
     * @param noteId The ID of the note to update
     * @param updatedNote The updated note data
     * @param username The username of the requesting user
     * @return The updated note with decrypted content
     */
    public Note updateNote(Long noteId, Note updatedNote, String username) {
        try {
            Note existingNote = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));

            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            // Check if user owns the note or is admin
            if (!existingNote.getUser().getId().equals(user.getId()) && !"ADMIN".equals(user.getRole())) {
                throw new AccessDeniedException("Access denied: You can only update your own notes");
            }

            // Encrypt updated content
            String encryptedTitle = encryptionUtil.encrypt(updatedNote.getTitle());
            String encryptedContent = encryptionUtil.encrypt(updatedNote.getContent());

            existingNote.setTitle(encryptedTitle);
            existingNote.setContent(encryptedContent);
            existingNote.setUpdatedAt(LocalDateTime.now());

            Note savedNote = noteRepository.save(existingNote);

            // Decrypt content for response
            try {
                savedNote.setTitle(encryptionUtil.decrypt(savedNote.getTitle()));
                savedNote.setContent(encryptionUtil.decrypt(savedNote.getContent()));
            } catch (Exception decryptException) {
                throw new RuntimeException("Failed to decrypt updated note content: " + decryptException.getMessage());
            }

            return savedNote;
        } catch (ResourceNotFoundException | AccessDeniedException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to update note: " + e.getMessage());
        }
    }

    /**
     * Deletes a note
     * @param noteId The ID of the note to delete
     * @param username The username of the requesting user
     */
    public void deleteNote(Long noteId, String username) {
        try {
            Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));

            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            // Check if user owns the note or is admin
            if (!note.getUser().getId().equals(user.getId()) && !"ADMIN".equals(user.getRole())) {
                throw new AccessDeniedException("Access denied: You can only delete your own notes");
            }

            noteRepository.delete(note);
        } catch (ResourceNotFoundException | AccessDeniedException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete note: " + e.getMessage());
        }
    }

    /**
     * Generates a share token for a note
     * @param noteId The ID of the note to share
     * @param username The username of the requesting user
     * @param expirationHours How many hours the share link should be valid
     * @return The generated share token
     */
    public String generateShareToken(Long noteId, String username, int expirationHours) {
        try {
            Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));

            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            // Check if user owns the note
            if (!note.getUser().getId().equals(user.getId())) {
                throw new AccessDeniedException("Access denied: You can only share your own notes");
            }

            // Generate UUID token
            String shareToken = UUID.randomUUID().toString();
            
            // Set expiration time
            LocalDateTime expirationTime = LocalDateTime.now().plusHours(expirationHours);
            
            note.setShareToken(shareToken);
            note.setShareExpirationTime(expirationTime);
            
            noteRepository.save(note);
            
            return shareToken;
        } catch (ResourceNotFoundException | AccessDeniedException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate share token: " + e.getMessage());
        }
    }

    /**
     * Gets a note by share token if it's valid and not expired
     * @param shareToken The share token
     * @return The note with decrypted content
     */
    public Note getNoteByShareToken(String shareToken) {
        try {
            // Clean up expired tokens first
            noteRepository.invalidateExpiredShareTokens(LocalDateTime.now());
            
            Note note = noteRepository.findByShareTokenAndNotExpired(shareToken, LocalDateTime.now())
                .orElseThrow(() -> new ResourceNotFoundException("Share link not found or expired"));

            // Check if the note itself is expired
            if (isNoteExpired(note)) {
                throw new ResourceNotFoundException("Note has expired and is no longer available");
            }

            // Decrypt content for response
            try {
                note.setTitle(encryptionUtil.decrypt(note.getTitle()));
                note.setContent(encryptionUtil.decrypt(note.getContent()));
            } catch (Exception decryptException) {
                throw new RuntimeException("Failed to decrypt shared note content: " + decryptException.getMessage());
            }

            return note;
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch shared note: " + e.getMessage());
        }
    }

    /**
     * Revokes a share token for a note
     * @param noteId The ID of the note
     * @param username The username of the requesting user
     */
    public void revokeShareToken(Long noteId, String username) {
        try {
            Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));

            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            // Check if user owns the note
            if (!note.getUser().getId().equals(user.getId())) {
                throw new AccessDeniedException("Access denied: You can only revoke share tokens for your own notes");
            }

            note.setShareToken(null);
            note.setShareExpirationTime(null);
            
            noteRepository.save(note);
        } catch (ResourceNotFoundException | AccessDeniedException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to revoke share token: " + e.getMessage());
        }
    }
}
