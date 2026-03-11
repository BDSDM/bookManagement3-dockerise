package com.bookManagement.service;

import com.bookManagement.dto.NotificationDTO;
import com.bookManagement.pojo.User;

import java.util.List;

public interface NotificationService {

    void sendToAdmins(List<User> admins, String message);

    List<NotificationDTO> getNotificationsForUser(String email);

    void deleteNotification(Long id);

    // ✅ Add this method to handle deleting all notifications for a user
    void deleteAllNotificationsForUser(String email);
}