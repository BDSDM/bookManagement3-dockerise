package com.bookManagement.dto;

import java.time.LocalDateTime;

public class NotificationDTO {

    private Long id;
    private String message;
    private String recipientEmail;
    private LocalDateTime createdAt;
    private boolean read;

    public NotificationDTO() {}

    public NotificationDTO(String message) {
        this.message = message;
    }

    public Long getId() {
        return id;
    }

    public String getMessage() {
        return message;
    }

    public String getRecipientEmail() {
        return recipientEmail;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public boolean isRead() {
        return read;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setRecipientEmail(String recipientEmail) {
        this.recipientEmail = recipientEmail;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setRead(boolean read) {
        this.read = read;
    }
}