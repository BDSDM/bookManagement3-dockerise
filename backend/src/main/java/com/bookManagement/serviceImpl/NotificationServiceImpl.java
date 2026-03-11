package com.bookManagement.serviceImpl;

import com.bookManagement.dao.NotificationDao;
import com.bookManagement.dto.NotificationDTO;
import com.bookManagement.pojo.Notification;
import com.bookManagement.pojo.User;
import com.bookManagement.service.NotificationService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationDao notificationDao;

    public NotificationServiceImpl(SimpMessagingTemplate messagingTemplate,
                                   NotificationDao notificationDao) {
        this.messagingTemplate = messagingTemplate;
        this.notificationDao = notificationDao;
    }

    /**
     * Envoie une notification à tous les admins
     */
    @Override
    @Transactional
    public void sendToAdmins(List<User> admins, String message) {

        for (User admin : admins) {

            Notification notification = new Notification(
                    message,
                    admin.getEmail()
            );

            Notification saved = notificationDao.save(notification);

            NotificationDTO dto = new NotificationDTO();
            dto.setId(saved.getId());
            dto.setMessage(saved.getMessage());
            dto.setRecipientEmail(saved.getRecipientEmail());
            dto.setCreatedAt(saved.getCreatedAt());

            messagingTemplate.convertAndSendToUser(
                    admin.getEmail(),
                    "/queue/notifications",
                    dto
            );
        }
    }

    /**
     * Récupère les notifications d’un utilisateur par email
     */
    @Override
    public List<NotificationDTO> getNotificationsForUser(String email) {

        return notificationDao
                .findByRecipientEmailOrderByCreatedAtDesc(email)
                .stream()
                .map(n -> {
                    NotificationDTO dto = new NotificationDTO();
                    dto.setId(n.getId());
                    dto.setMessage(n.getMessage());
                    dto.setRecipientEmail(n.getRecipientEmail());
                    dto.setCreatedAt(n.getCreatedAt());
                    dto.setRead(n.isRead());
                    return dto;
                })
                .toList();
    }

    /**
     * Supprime une notification par ID
     */
    @Override
    @Transactional
    public void deleteNotification(Long id) {

        Notification notification = notificationDao.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notificationDao.delete(notification);
    }

    /**
     * Supprime toutes les notifications pour un utilisateur par email
     */
    @Transactional
    public void deleteAllNotificationsForUser(String email) {
        notificationDao.deleteByRecipientEmail(email);
    }

}