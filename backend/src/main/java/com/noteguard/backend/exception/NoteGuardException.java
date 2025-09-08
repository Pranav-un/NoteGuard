package com.noteguard.backend.exception;

import lombok.Getter;

/**
 * Custom exception for NoteGuard application
 */
@Getter
public class NoteGuardException extends RuntimeException {
    private final String errorCode;
    private final String message;
    private final int httpStatus;

    public NoteGuardException(String message) {
        super(message);
        this.errorCode = "GENERAL_ERROR";
        this.message = message;
        this.httpStatus = 500;
    }

    public NoteGuardException(String errorCode, String message, int httpStatus) {
        super(message);
        this.errorCode = errorCode;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
