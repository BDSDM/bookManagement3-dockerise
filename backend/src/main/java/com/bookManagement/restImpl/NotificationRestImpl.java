package com.bookManagement.restImpl;

import com.bookManagement.dto.NotificationDTO;
import com.bookManagement.service.NotificationService;
import com.bookManagement.rest.NotificationRest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class NotificationRestImpl implements NotificationRest {

    private final NotificationService notificationService;

    public NotificationRestImpl(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Override
    public ResponseEntity<List<NotificationDTO>> getNotifications(String email) {

        return ResponseEntity.ok(
                notificationService.getNotificationsForUser(email)
        );
    }

    @Override
    public ResponseEntity<String> deleteNotification(Long id) {

        notificationService.deleteNotification(id);

        return ResponseEntity.ok("Notification deleted");
    }
}