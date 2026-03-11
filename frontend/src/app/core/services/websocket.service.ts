import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id?: number; // Optional, for backend DB notifications
  message: string;
  timestamp?: string;
}

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private client!: Client;
  private subscription: StompSubscription | null = null;

  // Observable notifications (for components)
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  constructor() {}

  /**
   * Connect to WebSocket server
   * @param token JWT token for authentication
   */
  connect(token?: string): void {
    if (!token) {
      token = localStorage.getItem('token') || '';
      if (!token) {
        console.error('Token not found, cannot connect WebSocket');
        return;
      }
    }

    this.client = new Client({
      webSocketFactory: () =>
        new SockJS(`http://localhost:8080/ws?token=${token}`),

      reconnectDelay: 5000,

      debug: (str) => {
        console.log('[STOMP DEBUG]', str);
      },

      onConnect: () => {
        console.log('✅ WebSocket connected');

        // Subscribe to user's notification queue
        this.subscription = this.client.subscribe(
          '/user/queue/notifications',
          (message: IMessage) => {
            const notification: Notification = JSON.parse(message.body);

            console.log('🔔 Notification received:', notification);

            // Prepend to current notifications
            const current = this.notificationsSubject.getValue();
            this.notificationsSubject.next([notification, ...current]);
          },
        );
      },

      onStompError: (frame) => {
        console.error('❌ STOMP Error:', frame.headers['message'], frame.body);
      },
    });

    this.client.activate();
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    if (this.client?.active) {
      this.client.deactivate();
    }

    // Clear notifications when user logs out
    this.notificationsSubject.next([]);
    console.log('🛑 WebSocket disconnected');
  }

  /**
   * Add a notification manually (e.g., from HTTP call)
   */
  addNotification(notification: Notification) {
    const current = this.notificationsSubject.getValue();
    this.notificationsSubject.next([notification, ...current]);
  }

  /**
   * Remove a notification by its ID
   */
  removeNotification(notificationId: number) {
    const current = this.notificationsSubject.getValue();
    const updated = current.filter((n) => n.id !== notificationId);
    this.notificationsSubject.next(updated);
  }

  /**
   * Clear all notifications
   */
  clearNotifications() {
    this.notificationsSubject.next([]);
  }

  /**
   * Get notifications as Observable
   */
  getNotifications() {
    return this.notifications$;
  }
}
