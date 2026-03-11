import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

import { CheckActivityService } from './core/services/check-activity.service';
import { ColorService } from './core/services/color.service';
import { CookieService } from './core/services/cookie.service';
import { AuthService } from './core/services/auth.service';
import { WebsocketService } from './core/services/websocket.service';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'bookManagementFrontend';

  notifications: any[] = [];

  private ignoredRoutes: string[] = ['/login', '/logout', '/register', '/'];

  constructor(
    private checkActivityService: CheckActivityService,
    private colorService: ColorService,
    private cookieService: CookieService,
    private router: Router,
    private authService: AuthService,
    private websocketService: WebsocketService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    // Start activity checking
    this.checkActivityService.startChecking();

    // Listen to authentication changes
    this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
      if (!isAuthenticated) {
        this.colorService.applyColorToBody('#ffffff', true);

        // Disconnect WebSocket
        this.websocketService.disconnect();

        // Clear notifications
        this.notifications = [];

        return;
      }

      const email = this.authService.getUserEmail();
      const role = this.authService.getUserRole();
      const token = localStorage.getItem('token');

      if (!email) {
        console.error('User email is null. Cannot proceed.');
        return;
      }

      // Load user settings
      this.loadUserColor();
      this.loadLastVisitedPage(email);
      this.trackVisitedPages();

      // ✅ Load notifications from database
      this.loadNotifications();

      // ✅ Connect WebSocket for admins (real-time notifications)
      if (role?.toLowerCase() === 'admin' && token) {
        this.websocketService.connect(token);

        this.websocketService.getNotifications().subscribe((notification) => {
          console.log('🔔 Real-time notification:', notification);

          // Add new notification on top
          this.notifications.unshift(notification);
        });
      }
    });
  }

  /**
   * Load stored notifications from backend
   */
  private loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        console.log('📥 Notifications loaded from DB:', data);
        this.notifications = data || [];
      },

      error: (err) => {
        console.error('Error loading notifications:', err);
      },
    });
  }

  /**
   * Load user color preference
   */
  private loadUserColor(): void {
    this.colorService.getColorServer().subscribe({
      next: (res) => {
        if (res?.color) {
          this.colorService.applyColorToBody(res.color, true);
        }
      },

      error: (err) => console.warn('Error loading user color:', err),
    });
  }

  /**
   * Restore last visited page
   */
  private loadLastVisitedPage(email: string): void {
    this.cookieService.getLastPage(email).subscribe({
      next: (res) => {
        const lastPage = res?.lastPage || '/';

        if (!this.isIgnoredRoute(lastPage) && lastPage !== this.router.url) {
          this.router.navigateByUrl(lastPage);
        }
      },

      error: () => this.router.navigateByUrl('/'),
    });
  }

  /**
   * Track visited pages
   */
  private trackVisitedPages(): void {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((event) => {
        const page = event.urlAfterRedirects;
        const email = this.authService.getUserEmail();

        if (!email) return;

        if (!this.isIgnoredRoute(page)) {
          this.cookieService.setLastPage(page, email).subscribe();
        }
      });
  }

  /**
   * Ignore certain routes
   */
  private isIgnoredRoute(route: string): boolean {
    const cleanRoute = route.split('?')[0].split('#')[0];

    return this.ignoredRoutes.includes(cleanRoute);
  }
}
