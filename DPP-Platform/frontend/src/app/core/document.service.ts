import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Document } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/documents`;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  /**
   * List documents
   */
  getDocuments(filters?: {
    productId?: string;
    type?: string;
  }): Observable<Document[]> {
    const params: Record<string, string> = {};
    if (filters?.productId) params['productId'] = filters.productId;
    if (filters?.type) params['type'] = filters.type;

    const query = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');
    const url = query ? `${this.apiUrl}?${query}` : this.apiUrl;

    return this.http.get<Document[]>(url, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * Get document by ID
   */
  getDocument(id: string): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/${id}`, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * Upload document
   */
  uploadDocument(formData: FormData): Observable<Document> {
    return this.http.post<Document>(`${this.apiUrl}/upload`, formData, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * Get download URL
   */
  getDownloadUrl(id: string): Observable<{ url: string; expiresIn: number }> {
    return this.http.get<{ url: string; expiresIn: number }>(`${this.apiUrl}/${id}/download`, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * Delete document
   */
  deleteDocument(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * Get documents for product
   */
  getDocumentsByProduct(productId: string): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/product/${productId}`, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * Get document types
   */
  getDocumentTypes(): { value: string; label: string }[] {
    return [
      { value: 'declaration', label: 'Declaration' },
      { value: 'certificate', label: 'Certificate' },
      { value: 'test_report', label: 'Test Report' },
      { value: 'manual', label: 'Manual' },
      { value: 'other', label: 'Other' },
    ];
  }

  /**
   * Get visibility levels
   */
  getVisibilityLevels(): { value: string; label: string }[] {
    return [
      { value: 'public', label: 'Public' },
      { value: 'professional', label: 'Professional' },
      { value: 'authority', label: 'Authority' },
    ];
  }
}
