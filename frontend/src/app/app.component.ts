import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';

import { CheckActivityService } from './core/services/check-activity.service';
import { ColorService } from './core/services/color.service';
import { CookieService } from './core/services/cookie.service';
import { AuthService } from './core/services/auth.service';
import { WebsocketService } from './core/services/websocket.service';
import { NotificationService } from './core/services/notification.service';
import { UserService } from './core/services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'bookManagementFrontend';
  notifications: any[] = [];

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
        if (!isAuthenticated) {
          this.colorService.applyColorToBody('#ffffff', true);
          this.websocketService.disconnect();
          this.notifications = [];

          this.wsSubscription?.unsubscribe();
          return;
        }

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
        this.loadNotifications();

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

  /** Connect WebSocket and subscribe safely */
  private connectWebSocket(token: string): void {
    this.websocketService.connect(token);

    // 🔥 IMPORTANT: unsubscribe previous subscription
    this.wsSubscription?.unsubscribe();

    this.wsSubscription = this.websocketService
      .getNotifications()
      .subscribe((notifications) => {
        console.log('🔔 Notifications updated:', notifications);
        this.notifications = notifications;
      });
  }

  /** Load stored notifications from backend */
  private loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data || [];
      },
      error: (err) => console.error('Error loading notifications:', err),
    });
  }

  private loadUserColor(): void {
    this.colorService.getColorServer().subscribe({
      next: (res) => {
        if (res?.color) {
          this.colorService.applyColorToBody(res.color, true);
        }
      },
    });
  }

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

  private isIgnoredRoute(route: string): boolean {
    const cleanRoute = route.split('?')[0].split('#')[0];
    return this.ignoredRoutes.includes(cleanRoute);
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
  }
}
