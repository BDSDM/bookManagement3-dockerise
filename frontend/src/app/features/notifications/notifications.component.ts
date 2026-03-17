import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService } from 'src/app/core/services/notification.service';
import { WebsocketService } from 'src/app/core/services/websocket.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Notification } from 'src/app/core/models/notification.model';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription?: Subscription;

  constructor(
    private notificationService: NotificationService,
    private websocketService: WebsocketService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const email = this.authService.getUserEmail();
    const token = this.authService.getToken();

    if (!email || !token) {
      console.error('Missing email or token');
      return;
    }

    // ✅ STEP 1: Subscribe FIRST (single source of truth)
    this.subscription = this.websocketService
      .getNotifications()
      .subscribe((notifications) => {
        this.notifications = notifications;
      });

    // ✅ STEP 2: Load DB notifications and push into WebSocket state
    this.notificationService.getNotifications(email).subscribe({
      next: (res) => {
        console.log('📥 Loaded from DB:', res);

        this.websocketService.clearNotifications();

        res.forEach((n) => {
          this.websocketService.addNotification(n);
        });
      },
      error: (err) => console.warn('Failed to load notifications:', err),
    });

    // ✅ STEP 3: Connect WebSocket (live updates)
    this.websocketService.connect(token);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.websocketService.disconnect();
  }

  /**
   * ✅ Clear all notifications (DB + UI)
   */
  clearNotifications(): void {
    const email = this.authService.getUserEmail();
    if (!email) return;

    this.notificationService.deleteAllNotifications(email).subscribe({
      next: () => {
        this.websocketService.clearNotifications();
      },
      error: (err) => console.warn('Failed to clear notifications:', err),
    });
  }

  /**
   * ✅ Remove a single notification
   */
  removeNotification(notification: Notification): void {
    if (!notification.id) {
      // Local only
      this.websocketService.removeNotification(0);
      return;
    }

    // Remove from UI immediately
    this.websocketService.removeNotification(notification.id);

    // Delete from backend
    this.notificationService.deleteNotification(notification.id).subscribe({
      next: () => {},
      error: (err) => console.warn('Failed to delete notification:', err),
    });
  }

  /**
   * ✅ Mark as read (optional feature)
   */
  markAsRead(notification: Notification): void {
    if (!notification.id) return;

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {},
      error: (err) => console.warn('Failed to mark as read:', err),
    });
  }
}
