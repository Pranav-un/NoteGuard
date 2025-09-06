package com.noteguard.backend.repository;

import com.noteguard.backend.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    
    List<Note> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);
    
    @Query("SELECT n FROM Note n WHERE n.ownerId = :ownerId AND (n.expirationTime IS NULL OR n.expirationTime > :currentTime)")
    List<Note> findActiveNotesByOwnerId(@Param("ownerId") Long ownerId, @Param("currentTime") LocalDateTime currentTime);
    
    @Query("SELECT n FROM Note n WHERE n.expirationTime IS NOT NULL AND n.expirationTime <= :currentTime")
    List<Note> findExpiredNotes(@Param("currentTime") LocalDateTime currentTime);
    
    long countByOwnerId(Long ownerId);
}
