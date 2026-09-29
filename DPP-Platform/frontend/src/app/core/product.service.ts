import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Product } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  /**
   * List all products (with pagination and filters)
   */
  getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
  }): Observable<{ data: Product[]; meta: any }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.category) queryParams.set('category', params.category);
    if (params?.status) queryParams.set('status', params.status);
    if (params?.search) queryParams.set('search', params.search);

    const query = queryParams.toString();
    const url = query ? `${this.apiUrl}?${query}` : this.apiUrl;

    return this.http.get<{ data: Product[]; meta: any }>(url, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * Get product by ID
   */
  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * Create new product
   */
  createProduct(data: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, data, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * Update product
   */
  updateProduct(id: string, data: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, data, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * Delete (archive) product
   */
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * Publish product (generates QR code)
   */
  publishProduct(id: string): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/${id}/publish`, {}, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * Get product categories
   */
  getCategories(): string[] {
    return [
      'ev_battery',
      'lmt_battery',
      'industrial_battery',
      'other',
    ];
  }
}
