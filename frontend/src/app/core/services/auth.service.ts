import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmLogoutDialogComponent } from 'src/app/features/confirm-logout-dialog/confirm-logout-dialog.component';
import { environment } from 'src/app/environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  // ✅ Suivi réactif de l’état de connexion
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.hasValidToken(),
  );
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  /** 🔹 Authentifie l’utilisateur */
  login(email: string, password: string) {
    return this.http.post<{ token: string; refreshToken: string }>(
      `${this.apiUrl}/login`,
      { email, password },
    );
  }

  /** 🔹 Enregistre un nouvel utilisateur */
  register(user: User): Observable<string> {
    return this.http.post(`${this.apiUrl}/register`, user, {
      responseType: 'text',
    });
  }

  /** 🔹 Sauvegarde les tokens et met à jour l’état connecté */
  saveToken(token: string, refreshToken: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    this.isAuthenticatedSubject.next(true);
  }

  /** 🔹 Récupère le token JWT */
  getToken() {
    return localStorage.getItem('token') ?? undefined;
  }

  /** 🔹 Vérifie si l’utilisateur est connecté */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /** 🔹 Déconnexion classique */
  loGout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/']);
  }

  /** 🔹 Déconnexion avec popup de confirmation */
  logout() {
    const dialogRef = this.dialog.open(ConfirmLogoutDialogComponent, {
      width: '400px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        this.isAuthenticatedSubject.next(false);
        this.router.navigate(['/']);
      }
    });
  }

  /** 🔹 Vérifie la validité du token */
  private hasValidToken(): boolean {
    const token = localStorage.getItem('token');
    return !!token; // 👉 tu peux ajouter une vérif de date d’expiration si besoin
  }

  /** 🔹 Récupère l'email de l'utilisateur à partir du JWT */
  getUserEmail(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      const payloadObj = JSON.parse(decodedPayload);
      return payloadObj.email || payloadObj.sub || null;
    } catch (e) {
      console.error('Erreur lors du décodage du token :', e);
      return null;
    }
  }

  /** 🔹 Récupère le nom de l'utilisateur à partir du JWT */
  getUserName(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      const payloadObj = JSON.parse(decodedPayload);
      return payloadObj.name || null;
    } catch (e) {
      console.error('Erreur lors du décodage du token :', e);
      return null;
    }
  }

  /** 🔹 Récupère l’ID de l’utilisateur */
  getUserId(): number {
    const token = this.getToken();
    if (!token) return 0;

    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(
        payloadBase64.replace(/-/g, '+').replace(/_/g, '/'),
      );
      const payload = JSON.parse(payloadJson);
      return payload.id || payload.userId || 0;
    } catch (error) {
      console.error('Erreur lors du décodage du token JWT', error);
      return 0;
    }
  }
  /** 🔹 Vérifie si le token JWT est expiré */

  isTokenExpired(token?: string): boolean {
    token = token || this.getToken();

    if (!token) return true;

    try {
      const payloadBase64 = token.split('.')[1];

      const payloadJson = atob(
        payloadBase64.replace(/-/g, '+').replace(/_/g, '/'),
      );

      const payload = JSON.parse(payloadJson);

      if (!payload.exp) return true; // pas de date d'expiration => considérer comme expiré

      const expiryTime = payload.exp * 1000; // JWT exp est en secondes, JS Date en ms

      const currentTime = Date.now();

      return currentTime >= expiryTime;
    } catch (error) {
      console.error('Erreur lors du décodage du token JWT', error);

      return true; // en cas d'erreur, considérer le token comme expiré
    }
  }

  /** 🔹 Récupère le rôle de l’utilisateur */
  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch (e) {
      console.error('Erreur lors du décodage du token :', e);
      return null;
    }
  }
}
