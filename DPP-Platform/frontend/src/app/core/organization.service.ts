import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Organization } from '../models';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private apiUrl = `${environment.apiUrl}/orgs`;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  /**
   * Get current organization
   */
  getOrganization(): Observable<Organization> {
    return this.http.get<Organization>(this.apiUrl, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * Update organization settings
   */
  updateOrganization(data: Partial<Organization>): Observable<Organization> {
    return this.http.put<Organization>(this.apiUrl, data, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * List organization members
   */
  getMembers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/members`, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * Invite a new member
   */
  inviteMember(email: string, role: string, firstName?: string, lastName?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/members`, {
      email,
      role,
      firstName,
      lastName,
    }, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * Remove a member
   */
  removeMember(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/members/${userId}`, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * Change user role
   */
  updateUserRole(userId: string, role: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/members/${userId}`, { role }, {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
