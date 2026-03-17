import { Injectable } from '@angular/core';

import { Client, IMessage, StompSubscription } from '@stomp/stompjs';

import * as SockJS from 'sockjs-client';

import { BehaviorSubject } from 'rxjs';

// Interface for notifications

export interface Notification {
  id?: number; // Optional, useful if backend stores notifications

  message: string; // The main notification text

  timestamp?: string; // Optional timestamp
}

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private client!: Client; // STOMP client instance

  private subscription: StompSubscription | null = null; // Current subscription

  // Observable notifications for components

  private notificationsSubject = new BehaviorSubject<Notification[]>([]);

  notifications$ = this.notificationsSubject.asObservable();

  constructor() {}

  /**

   * Connect to WebSocket server

   * @param token JWT token for authentication

   */

  connect(token?: string): void {
    // Use token from localStorage if not passed

    if (!token) {
      token = localStorage.getItem('token') || '';

      if (!token) {
        console.error('Token not found, cannot connect WebSocket');

        return;
      }
    }

    // Create a new STOMP client

    this.client = new Client({
      // SockJS factory for fallback support

      webSocketFactory: () =>
        new SockJS(`http://localhost:8080/ws?token=${token}`),

      // Auto-reconnect every 5 seconds

      reconnectDelay: 5000,

      // Debug logs

      debug: (str) => console.log('[STOMP DEBUG]', str),

      // When connection is established

      onConnect: () => {
        console.log('✅ WebSocket connected');

        // Subscribe to user's private notification queue

        this.subscription = this.client.subscribe(
          '/user/queue/notifications',

          (message: IMessage) => {
            try {
              const notification: Notification = JSON.parse(message.body);

              console.log('🔔 Notification received:', notification);

              // Prepend to current notifications list

              const current = this.notificationsSubject.getValue();

              this.notificationsSubject.next([notification, ...current]);
            } catch (err) {
              console.error('Failed to parse notification', err);
            }
          },
        );
      },

      // Handle STOMP errors

      onStompError: (frame) => {
        console.error('❌ STOMP Error:', frame.headers['message'], frame.body);
      },

      // Optional: handle WebSocket close

      onWebSocketClose: (evt: CloseEvent) => {
        console.warn('⚠️ WebSocket closed', evt);
      },

      // Optional: handle WebSocket error

      onWebSocketError: (evt: Event) => {
        console.error('⚠️ WebSocket error', evt);
      },
    });

    // Activate the STOMP client

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

   * Manually add a notification

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
