package com.noteguard.backend.service;

import com.noteguard.backend.repository.NoteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class CleanupService {

    private static final Logger logger = LoggerFactory.getLogger(CleanupService.class);

    @Autowired
    private NoteRepository noteRepository;

    /**
     * Deletes expired notes based on expirationTime
     * Runs every hour at the top of the hour
     */
    @Scheduled(cron = "0 0 * * * *") // Every hour at minute 0
    @Transactional
    public void deleteExpiredNotes() {
        try {
            LocalDateTime now = LocalDateTime.now();
            logger.info("Starting cleanup of expired notes at {}", now);

            // First, invalidate expired share tokens
            noteRepository.invalidateExpiredShareTokens(now);
            logger.debug("Invalidated expired share tokens");

            // Get count of expired notes before deletion for logging
            long expiredCount = noteRepository.countExpiredNotes(now);
            
            if (expiredCount > 0) {
                // Delete expired notes
                int deletedCount = noteRepository.deleteExpiredNotes(now);
                logger.info("Cleanup completed: {} expired notes deleted", deletedCount);
            } else {
                logger.debug("Cleanup completed: No expired notes found");
            }

        } catch (Exception e) {
            logger.error("Error during cleanup of expired notes: {}", e.getMessage(), e);
        }
    }

    /**
     * Manual cleanup method for testing or administrative purposes
     */
    public void performManualCleanup() {
        logger.info("Manual cleanup initiated");
        deleteExpiredNotes();
    }

    /**
     * Get count of notes that will expire in the next specified hours
     * @param hours Number of hours to look ahead
     * @return Count of notes expiring
     */
    public long getNotesExpiringInHours(int hours) {
        LocalDateTime futureTime = LocalDateTime.now().plusHours(hours);
        return noteRepository.countNotesExpiringBefore(futureTime);
    }
}
