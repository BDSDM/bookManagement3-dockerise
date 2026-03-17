import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { BehaviorSubject } from 'rxjs';

// Interface for notifications
export interface Notification {
  id?: number;
  message: string;
  timestamp?: string;
}

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private client: Client | null = null;
  private subscription: StompSubscription | null = null;

  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  constructor() {}

  /**
   * Connect to WebSocket server
   */
  connect(token?: string): void {
    // 🔥 ALWAYS disconnect before reconnecting (avoid duplicates)
    this.disconnect();

    // Get token if not provided
    if (!token) {
      token = localStorage.getItem('token') || '';
      if (!token) {
        console.error('❌ Token not found, cannot connect WebSocket');
        return;
      }
    }

    // Create STOMP client
    this.client = new Client({
      webSocketFactory: () =>
        new SockJS(`http://localhost:8080/ws?token=${token}`),

      reconnectDelay: 5000,

      debug: (str) => console.log('[STOMP DEBUG]', str),

      onConnect: () => {
        console.log('✅ WebSocket connected');

        // Subscribe safely
        this.subscription = this.client!.subscribe(
          '/user/queue/notifications',
          (message: IMessage) => {
            this.handleIncomingNotification(message);
          },
        );
      },

      onStompError: (frame) => {
        console.error('❌ STOMP Error:', frame.headers['message'], frame.body);
      },

      onWebSocketClose: (evt: CloseEvent) => {
        console.warn('⚠️ WebSocket closed', evt);
      },

      onWebSocketError: (evt: Event) => {
        console.error('⚠️ WebSocket error', evt);
      },
    });

    this.client.activate();
  }

  /**
   * Handle incoming notifications (clean separation of logic)
   */
  private handleIncomingNotification(message: IMessage): void {
    try {
      const notification: Notification = JSON.parse(message.body);

      console.log('🔔 Notification received:', notification);

      const current = this.notificationsSubject.getValue();

      this.notificationsSubject.next([notification, ...current]);
    } catch (err) {
      console.error('❌ Failed to parse notification', err);
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    if (this.client && this.client.active) {
      this.client.deactivate();
      this.client = null;
    }

    this.notificationsSubject.next([]);

    console.log('🛑 WebSocket disconnected');
  }

  /**
   * Add notification manually
   */
  addNotification(notification: Notification): void {
    const current = this.notificationsSubject.getValue();
    this.notificationsSubject.next([notification, ...current]);
  }

  /**
   * Remove notification by ID
   */
  removeNotification(notificationId: number): void {
    const current = this.notificationsSubject.getValue();
    const updated = current.filter((n) => n.id !== notificationId);
    this.notificationsSubject.next(updated);
  }

  /**
   * Clear all notifications
   */
  clearNotifications(): void {
    this.notificationsSubject.next([]);
  }

  /**
   * Get notifications as Observable
   */
  getNotifications() {
    return this.notifications$;
  }
}
