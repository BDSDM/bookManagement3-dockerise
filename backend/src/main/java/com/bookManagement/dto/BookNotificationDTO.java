package com.bookManagement.dto;

import java.time.LocalDateTime;

public class BookNotificationDTO {

    private String message;
    private LocalDateTime timestamp;

    public BookNotificationDTO(String message) {
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    public String getMessage() { return message; }
    public LocalDateTime getTimestamp() { return timestamp; }
}