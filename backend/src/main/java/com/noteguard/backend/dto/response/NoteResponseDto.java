package com.noteguard.backend.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

/**
 * Note response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoteResponseDto {
    private Long id;
    private String title;
    private String content;
    private String createdAt;
    private String expirationTime;
    private UserResponseDto owner;
    private String shareUrl;
    private boolean isExpired;
}
