package com.noteguard.backend.dto;

import java.time.LocalDateTime;

public class NoteDto {
    private Long id;
    private String title;
    private String content;
    private LocalDateTime updatedAt;
    private LocalDateTime createdAt;
    private LocalDateTime expirationTime;
    private String shareToken;
    private LocalDateTime shareExpirationTime;
    private Long ownerId;
    private String ownerUsername; // Instead of full User object

    // Default constructor
    public NoteDto() {}

    // Constructor
    public NoteDto(Long id, String title, String content, LocalDateTime updatedAt, 
                   LocalDateTime createdAt, LocalDateTime expirationTime, String shareToken,
                   LocalDateTime shareExpirationTime, Long ownerId, String ownerUsername) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.updatedAt = updatedAt;
        this.createdAt = createdAt;
        this.expirationTime = expirationTime;
        this.shareToken = shareToken;
        this.shareExpirationTime = shareExpirationTime;
        this.ownerId = ownerId;
        this.ownerUsername = ownerUsername;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getExpirationTime() {
        return expirationTime;
    }

    public void setExpirationTime(LocalDateTime expirationTime) {
        this.expirationTime = expirationTime;
    }

    public String getShareToken() {
        return shareToken;
    }

    public void setShareToken(String shareToken) {
        this.shareToken = shareToken;
    }

    public LocalDateTime getShareExpirationTime() {
        return shareExpirationTime;
    }

    public void setShareExpirationTime(LocalDateTime shareExpirationTime) {
        this.shareExpirationTime = shareExpirationTime;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public String getOwnerUsername() {
        return ownerUsername;
    }

    public void setOwnerUsername(String ownerUsername) {
        this.ownerUsername = ownerUsername;
    }
}
