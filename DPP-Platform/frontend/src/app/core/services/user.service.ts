import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth.service';

export interface ManagedUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'super_admin' | 'org_admin' | 'product_manager' | 'compliance' | 'viewer';
  status: 'active' | 'invited' | 'suspended';
  organization_id?: string;
  organization?: {
    id: string;
    name: string;
    email?: string;
    tenant_id?: string;
  };
  created_at: string;
}

export interface ManagedOrg {
  id: string;
  name: string;
  email: string;
  tenant_id: string;
  usersCount?: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;
  private orgsUrl = `${environment.apiUrl}/orgs`;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  getUsers(organizationId?: string): Observable<ManagedUser[]> {
    const url = organizationId ? `${this.apiUrl}?organizationId=${organizationId}` : this.apiUrl;
    return this.http.get<ManagedUser[]>(url, { headers: this.auth.getAuthHeaders() });
  }

  getUser(id: string): Observable<ManagedUser> {
    return this.http.get<ManagedUser>(`${this.apiUrl}/${id}`, { headers: this.auth.getAuthHeaders() });
  }

  createUser(data: {
    email: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    role?: string;
    organizationId?: string;
    status?: string;
  }): Observable<ManagedUser> {
    return this.http.post<ManagedUser>(this.apiUrl, data, { headers: this.auth.getAuthHeaders() });
  }

  updateUser(id: string, data: {
    firstName?: string;
    lastName?: string;
    role?: string;
    status?: string;
  }): Observable<ManagedUser> {
    return this.http.put<ManagedUser>(`${this.apiUrl}/${id}`, data, { headers: this.auth.getAuthHeaders() });
  }

  deleteUser(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getOrganizations(): Observable<ManagedOrg[]> {
    return this.http.get<ManagedOrg[]>(this.orgsUrl, { headers: this.auth.getAuthHeaders() }).pipe(
      catchError(() => of([]))
    );
  }
}
