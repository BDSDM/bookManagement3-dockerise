import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';

import { CheckActivityService } from './core/services/check-activity.service';
import { ColorService } from './core/services/color.service';
import { CookieService } from './core/services/cookie.service';
import { AuthService } from './core/services/auth.service';
import {
  WebsocketService,
  Notification,
} from './core/services/websocket.service';
import { NotificationService } from './core/services/notification.service';
import { UserService } from './core/services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'bookManagementFrontend';
  notifications: Notification[] = [];

  private ignoredRoutes: string[] = ['/login', '/logout', '/register', '/'];

  private wsSubscription?: Subscription;
  private authSubscription?: Subscription;

  constructor(
    private checkActivityService: CheckActivityService,
    private colorService: ColorService,
    private cookieService: CookieService,
    private router: Router,
    private authService: AuthService,
    private websocketService: WebsocketService,
    private notificationService: NotificationService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.checkActivityService.startChecking();

    this.authSubscription = this.authService.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        // 🔴 USER LOGGED OUT
        if (!isAuthenticated) {
          this.colorService.applyColorToBody('#ffffff', true);
          this.websocketService.disconnect();
          this.notifications = [];

          this.wsSubscription?.unsubscribe();
          return;
        }

        // 🟢 USER LOGGED IN
        const email = this.authService.getUserEmail();
        const role = this.authService.getUserRole();
        const token = this.authService.getToken();

        if (!email) {
          console.error('User email is null. Cannot proceed.');
          return;
        }

        this.loadUserColor();
        this.loadLastVisitedPage(email);
        this.trackVisitedPages();

        // 🔥 STEP 1: LOAD FROM DATABASE FIRST
        this.loadNotifications(email);

        // 🔥 STEP 2: CONNECT WEBSOCKET FOR LIVE UPDATES
        if (role?.toLowerCase() === 'admin' && token) {
          if (this.authService.isTokenExpired(token)) {
            this.userService.refreshAccessToken().subscribe({
              next: (newToken) => {
                if (!newToken) {
                  this.authService.logout();
                  return;
                }

                const refreshToken = localStorage.getItem('refreshToken') || '';

                this.authService.saveToken(newToken, refreshToken);

                this.connectWebSocket(newToken);
              },
              error: () => {
                console.error('Token refresh failed');
                this.authService.logout();
              },
            });
          } else {
            this.connectWebSocket(token);
          }
        }
      },
    );
  }

  /**
   * ✅ Connect WebSocket and subscribe
   */
  private connectWebSocket(token: string): void {
    this.websocketService.connect(token);

    // Prevent duplicate subscriptions
    this.wsSubscription?.unsubscribe();

    this.wsSubscription = this.websocketService
      .getNotifications()
      .subscribe((notifications) => {
        console.log('🔔 Notifications updated (WS + DB):', notifications);
        this.notifications = notifications;
      });
  }

  /**
   * ✅ Load notifications from database
   */
  private loadNotifications(email: string): void {
    this.notificationService.getNotifications(email).subscribe({
      next: (data) => {
        console.log('📥 Notifications loaded from DB:', data);

        // 🔥 IMPORTANT: push DB data into WebSocket state
        this.websocketService.clearNotifications();

        data.forEach((n) => {
          this.websocketService.addNotification(n);
        });
      },
      error: (err) => console.error('Error loading notifications:', err),
    });
  }

  /**
   * Load user color
   */
  private loadUserColor(): void {
    this.colorService.getColorServer().subscribe({
      next: (res) => {
        if (res?.color) {
          this.colorService.applyColorToBody(res.color, true);
        }
      },
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
   * Ignore routes
   */
  private isIgnoredRoute(route: string): boolean {
    const cleanRoute = route.split('?')[0].split('#')[0];
    return this.ignoredRoutes.includes(cleanRoute);
  }

  /**
   * Cleanup
   */
  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
  }
}
