import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private baseUrl = 'http://localhost:8080/api/notifications';

  constructor(private http: HttpClient) {}

  /**
   * ✅ Get notifications for a user
   */
  getNotifications(email: string): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.baseUrl}/user/${email}`);
  }

  /**
   * ✅ Delete all notifications for a user
   */
  deleteAllNotifications(email: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/user/${email}`);
  }

  /**
   * ✅ Delete a single notification
   */
  deleteNotification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * ⚠️ Requires backend endpoint
   */
  markAsRead(notificationId: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${notificationId}/read`, {});
  }
}
