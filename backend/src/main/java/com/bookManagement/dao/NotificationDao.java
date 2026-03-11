package com.bookManagement.dao;

import com.bookManagement.pojo.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationDao extends JpaRepository<Notification, Long> {

    // Get notifications for a recipient, newest first
    List<Notification> findByRecipientEmailOrderByCreatedAtDesc(String email);

    // Get notifications for a recipient without ordering
    List<Notification> findByRecipientEmail(String email);

    // Delete notifications for a recipient
    void deleteByRecipientEmail(String email);
}