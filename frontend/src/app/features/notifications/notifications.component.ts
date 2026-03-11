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
  private subscription!: Subscription;

  constructor(
    private notificationService: NotificationService,
    private websocketService: WebsocketService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const email = this.authService.getUserEmail();
    if (!email) return;

    // Load notifications from backend
    this.notificationService.getNotifications().subscribe({
      next: (res) => {
        this.notifications = res;
      },
      error: (err) => console.warn('Failed to load notifications:', err),
    });

    // Subscribe to WebSocket real-time notifications
    this.subscription = this.websocketService.notifications$.subscribe(
      (notifications: Notification[]) => {
        this.notifications = notifications;
      },
    );

    // Connect WebSocket
    this.websocketService.connect();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.websocketService.disconnect();
  }

  /** Clear all notifications locally AND in backend */
  clearNotifications(): void {
    this.notificationService.deleteNotifications().subscribe({
      next: () => {
        // Only clear UI after backend confirmation
        this.notifications = [];
        this.websocketService.clearNotifications();
      },
      error: (err) => console.warn('Failed to clear notifications:', err),
    });
  }

  /** Remove a single notification */
  removeNotification(notification: Notification): void {
    if (!notification.id) {
      // If notification has no backend ID → remove only locally
      this.notifications = this.notifications.filter((n) => n !== notification);
      this.websocketService.removeNotification(notification.id || 0);
      return;
    }

    // Remove from UI
    this.notifications = this.notifications.filter(
      (n) => n.id !== notification.id,
    );

    // Remove from WebSocket state
    this.websocketService.removeNotification(notification.id);

    // Mark as read in backend
    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {},
      error: (err) => console.warn('Failed to mark notification as read:', err),
    });
  }
}
