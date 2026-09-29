import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Dpp } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DppService {
  private apiUrl = `${environment.apiUrl}/dpps`;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  /**
   * List all DPPs
   */
  getDpps(): Observable<Dpp[]> {
    return this.http.get<Dpp[]>(this.apiUrl, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * Get DPP by ID
   */
  getDpp(id: string): Observable<Dpp> {
    return this.http.get<Dpp>(`${this.apiUrl}/${id}`, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * Get DPP by product ID
   */
  getDppByProduct(productId: string): Observable<Dpp> {
    return this.http.get<Dpp>(`${this.apiUrl}/product/${productId}`, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * Create DPP
   */
  createDpp(data: {
    productId: string;
    data: Record<string, unknown>;
    accessLevel?: 'public' | 'professional' | 'authority';
  }): Observable<Dpp> {
    return this.http.post<Dpp>(this.apiUrl, data, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * Update DPP
   */
  updateDpp(id: string, data: Record<string, unknown>): Observable<Dpp> {
    return this.http.put<Dpp>(`${this.apiUrl}/${id}`, data, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * Publish DPP
   */
  publishDpp(id: string): Observable<Dpp> {
    return this.http.post<Dpp>(`${this.apiUrl}/${id}/publish`, {}, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * Get DPP version history
   */
  getDppHistory(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/history`, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * Get public DPP data (for preview)
   */
  getPublicDpp(identifier: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/public/dpp/${identifier}`);
  }

  /**
   * Get DPP JSON-LD export
   */
  getDppJsonLd(id: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/export/dpps/${id}/jsonld`, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * Get product JSON-LD export
   */
  getProductJsonLd(id: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/export/products/${id}/jsonld`, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * Get DPP access levels
   */
  getAccessLevels(): { value: string; label: string }[] {
    return [
      { value: 'public', label: 'Public (Consumer)' },
      { value: 'professional', label: 'Professional (Technician)' },
      { value: 'authority', label: 'Authority (Regulator)' },
    ];
  }
}
