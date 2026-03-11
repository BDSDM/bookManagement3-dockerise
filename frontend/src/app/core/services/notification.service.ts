import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Notification } from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private baseUrl = 'http://localhost:8080/api/notifications';

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<Notification[]> {
    const email = localStorage.getItem('userEmail');
    if (!email) return of([]);
    return this.http.get<Notification[]>(`${this.baseUrl}/user/${email}`);
  }

  deleteNotifications(): Observable<void> {
    const email = localStorage.getItem('userEmail');
    if (!email) return of(void 0);
    return this.http.delete<void>(`${this.baseUrl}/user/${email}`);
  }

  markAsRead(notificationId: number): Observable<Notification> {
    return this.http.patch<Notification>(
      `${this.baseUrl}/${notificationId}/read`,
      {},
    );
  }
}
