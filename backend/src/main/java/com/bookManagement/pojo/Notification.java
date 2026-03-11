package com.bookManagement.pojo;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private String recipientEmail;

    private LocalDateTime createdAt;

    private boolean isRead;

    public Notification() {
        this.createdAt = LocalDateTime.now();
        this.isRead = false;
    }

    public Notification(String message, String recipientEmail) {
        this.message = message;
        this.recipientEmail = recipientEmail;
        this.createdAt = LocalDateTime.now();
        this.isRead = false;
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
        return isRead;
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
        isRead = read;
    }
}