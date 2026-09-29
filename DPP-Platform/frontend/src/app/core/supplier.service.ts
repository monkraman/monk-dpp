import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface SupplierRequest {
  id: string;
  productId: string;
  productName?: string;
  supplierEmail: string;
  supplierName?: string;
  dataFields: string[];
  status: 'pending' | 'sent' | 'responded' | 'completed' | 'expired';
  dueDate?: string;
  sentAt?: string;
  respondedAt?: string;
  createdAt: string;
}

export interface SupplierResponse {
  id: string;
  requestId: string;
  submittedData: Record<string, unknown>;
  status: string;
  submittedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private apiUrl = `${environment.apiUrl}/supplier-requests`;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  /**
   * List all supplier requests
   */
  getRequests(): Observable<SupplierRequest[]> {
    return this.http.get<SupplierRequest[]>(this.apiUrl, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * Get request by ID
   */
  getRequest(id: string): Observable<SupplierRequest> {
    return this.http.get<SupplierRequest>(`${this.apiUrl}/${id}`, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * Create new supplier request
   */
  createRequest(data: {
    productId: string;
    supplierEmail: string;
    supplierName?: string;
    dataFields: string[];
    dueDate?: string;
    message?: string;
  }): Observable<SupplierRequest> {
    return this.http.post<SupplierRequest>(this.apiUrl, data, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * Update request status
   */
  updateRequestStatus(id: string, status: string): Observable<SupplierRequest> {
    return this.http.put<SupplierRequest>(`${this.apiUrl}/${id}`, { status }, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * Delete request
   */
  deleteRequest(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  /**
   * Respond to request (supplier endpoint - public)
   */
  respondToRequest(requestId: string, data: Record<string, unknown>, token: string): Observable<SupplierResponse> {
    return this.http.post<SupplierResponse>(`${this.apiUrl}/${requestId}/respond?token=${token}`, data);
  }

  /**
   * Get request statuses
   */
  getStatuses(): { value: string; label: string }[] {
    return [
      { value: 'pending', label: 'Pending' },
      { value: 'sent', label: 'Sent' },
      { value: 'responded', label: 'Responded' },
      { value: 'completed', label: 'Completed' },
      { value: 'expired', label: 'Expired' },
    ];
  }

  /**
   * Get data field types (based on template)
   */
  getDataFieldOptions(): { value: string; label: string; visibility: string }[] {
    return [
      { value: 'manufacturer_name', label: 'Manufacturer Name', visibility: 'authority' },
      { value: 'manufacture_date', label: 'Manufacture Date', visibility: 'authority' },
      { value: 'mass', label: 'Mass (kg)', visibility: 'public' },
      { value: 'energy_capacity', label: 'Energy Capacity (Wh)', visibility: 'public' },
      { value: 'chemistry', label: 'Chemistry', visibility: 'public' },
      { value: 'hazardous_substance', label: 'Hazardous Substance', visibility: 'public' },
      { value: 'nominal_voltage', label: 'Nominal Voltage (V)', visibility: 'professional' },
      { value: 'max_voltage', label: 'Max Voltage (V)', visibility: 'professional' },
      { value: 'original_power', label: 'Original Power (W)', visibility: 'professional' },
      { value: 'cycle_life', label: 'Cycle Life', visibility: 'professional' },
      { value: 'round_trip_efficiency', label: 'Round-Trip Efficiency (%)', visibility: 'professional' },
      { value: 'battery_lifetime', label: 'Battery Lifetime (years)', visibility: 'professional' },
      { value: 'parts_materials', label: 'Parts/Materials', visibility: 'professional' },
      { value: 'spare_parts_supplier', label: 'Spare Parts Supplier', visibility: 'professional' },
      { value: 'eu_conformity_docs', label: 'EU Conformity Docs', visibility: 'authority' },
    ];
  }
}
