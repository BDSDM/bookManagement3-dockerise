package com.bookManagement.rest;

import com.bookManagement.dto.NotificationDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/notifications")
public interface NotificationRest {

    @GetMapping("/{email}")
    ResponseEntity<List<NotificationDTO>> getNotifications(@PathVariable("email") String email);

    @DeleteMapping("/{id}")
    ResponseEntity<String> deleteNotification(@PathVariable("id") Long id);

}