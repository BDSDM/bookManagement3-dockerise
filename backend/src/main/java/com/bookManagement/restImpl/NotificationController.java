package com.bookManagement.restImpl;

import com.bookManagement.dto.NotificationDTO;
import com.bookManagement.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<List<NotificationDTO>> getNotificationsByUser(@PathVariable("email") String email) {
        List<NotificationDTO> notifications = notificationService.getNotificationsForUser(email);
        return ResponseEntity.ok(notifications);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable("id") Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/user/{email}")
    public ResponseEntity<Void> deleteAllNotificationsForUser(@PathVariable("email") String email) {
        notificationService.deleteAllNotificationsForUser(email);
        return ResponseEntity.ok().build();
    }
}