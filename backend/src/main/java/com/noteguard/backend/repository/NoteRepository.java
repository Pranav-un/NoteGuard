package com.noteguard.backend.repository;

import com.noteguard.backend.model.Note;
import com.noteguard.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    
    List<Note> findByUserOrderByCreatedAtDesc(User user);
    
    long countByUser(User user);
    
    Optional<Note> findByShareToken(String shareToken);
    
    @Query("SELECT n FROM Note n WHERE n.shareToken = :token AND n.shareExpirationTime > :currentTime")
    Optional<Note> findByShareTokenAndNotExpired(@Param("token") String shareToken, @Param("currentTime") LocalDateTime currentTime);
    
    @Modifying
    @Transactional
    @Query("UPDATE Note n SET n.shareToken = NULL, n.shareExpirationTime = NULL WHERE n.shareExpirationTime <= :currentTime")
    void invalidateExpiredShareTokens(@Param("currentTime") LocalDateTime currentTime);
    
    @Query("SELECT COUNT(n) FROM Note n WHERE n.expirationTime IS NOT NULL AND n.expirationTime <= :currentTime")
    long countExpiredNotes(@Param("currentTime") LocalDateTime currentTime);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM Note n WHERE n.expirationTime IS NOT NULL AND n.expirationTime <= :currentTime")
    int deleteExpiredNotes(@Param("currentTime") LocalDateTime currentTime);
    
    @Query("SELECT COUNT(n) FROM Note n WHERE n.expirationTime IS NOT NULL AND n.expirationTime <= :futureTime")
    long countNotesExpiringBefore(@Param("futureTime") LocalDateTime futureTime);
    
    long countByShareTokenIsNotNull();
}
