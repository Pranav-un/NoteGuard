package com.noteguard.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShareTokenResponse {
    private String shareToken;
    private String shareUrl;
    private LocalDateTime expirationTime;
}
