import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'member' | 'viewer' | 'supplier';
  phone?: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
}

const TOKEN_KEY = 'dpp_access_token';
const REFRESH_TOKEN_KEY = 'dpp_refresh_token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    // Auto-logout if no token on init
    if (!this.getToken()) {
      // User is not logged in
    }
  }

  /**
   * Get stored access token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Store tokens
   */
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Clear all tokens (logout)
   */
  clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Get current user from localStorage (cached)
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('dpp_current_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Store current user
   */
  setCurrentUser(user: User): void {
    localStorage.setItem('dpp_current_user', JSON.stringify(user));
  }

  /**
   * Remove current user
   */
  removeCurrentUser(): void {
    localStorage.removeItem('dpp_current_user');
  }

  /**
   * Login
   */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        this.setTokens(response.accessToken, response.refreshToken);
        // After login, fetch user profile and cache it
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Register
   */
  register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName: string;
    phone?: string;
    country?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, data).pipe(
      tap((response: any) => {
        if (response?.accessToken) {
          this.setTokens(response.accessToken, response.refreshToken);
          this.setCurrentUser(response.user);
        }
      })
    );
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<LoginResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap(response => {
        this.setTokens(response.accessToken, response.refreshToken);
      })
    );
  }

  /**
   * Get user profile (me)
   */
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap(user => this.setCurrentUser(user))
    );
  }

  /**
   * Logout
   */
  logout(): void {
    this.clearTokens();
    this.removeCurrentUser();
    this.router.navigate(['/login']);
  }

  /**
   * Get auth headers for API calls
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    });
  }
}
