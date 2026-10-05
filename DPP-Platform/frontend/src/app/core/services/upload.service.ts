import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PresignedUploadResponse {
  uploadUrl: string;
  fileKey: string;
  publicUrl?: string;
  expiresIn?: number;
}

export interface UploadProgress {
  progress: number;
  completed: boolean;
  publicUrl?: string;
  fileKey?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Step 1: Request presigned upload URL from backend for direct Cloudflare R2 / S3 upload
   */
  getPresignedUploadUrl(
    fileName: string,
    fileType: string,
    category: 'public' | 'compliance' = 'public',
    productId?: string
  ): Observable<PresignedUploadResponse> {
    return this.http.post<PresignedUploadResponse>(`${this.apiUrl}/documents/presigned-upload`, {
      fileName,
      fileType,
      category,
      productId,
    });
  }

  /**
   * Step 2: Upload file directly to Cloudflare R2 / S3 using presigned PUT URL
   * Does not pass through backend server, saving backend CPU & RAM!
   */
  uploadToPresignedUrl(presignedUrl: string, file: File): Observable<number> {
    const headers = new HttpHeaders({
      'Content-Type': file.type || 'application/octet-stream',
    });

    const req = new HttpRequest('PUT', presignedUrl, file, {
      reportProgress: true,
      headers,
    });

    return this.http.request(req).pipe(
      map((event: HttpEvent<unknown>) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          return Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          return 100;
        }
        return 0;
      })
    );
  }

  /**
   * Step 3: Confirm upload with backend to persist document metadata in PostgreSQL
   */
  confirmDocumentUpload(metadata: {
    fileKey: string;
    originalName: string;
    fileSize: number;
    fileType: string;
    documentType: string;
    productId?: string;
    visibility?: 'public' | 'professional' | 'authority';
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/documents/confirm`, metadata);
  }

  /**
   * Fallback: Direct Multipart Form-data upload via backend
   */
  uploadMultipart(file: File, metadata: Record<string, any> = {}): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(metadata).forEach((key) => {
      formData.append(key, metadata[key]);
    });
    return this.http.post(`${this.apiUrl}/documents/upload`, formData);
  }

  /**
   * Get secure temporary presigned download URL for a confidential certificate
   */
  getDownloadUrl(documentId: string): Observable<{ url: string; expiresIn: number }> {
    return this.http.get<{ url: string; expiresIn: number }>(
      `${this.apiUrl}/documents/${documentId}/download`
    );
  }
}
