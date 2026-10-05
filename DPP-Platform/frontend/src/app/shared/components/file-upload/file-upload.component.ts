import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UploadService } from '../../../core/services/upload.service';

export interface UploadedFileItem {
  name: string;
  size: number;
  progress: number;
  status: 'idle' | 'uploading' | 'completed' | 'error';
  file?: File;
  url?: string;
  fileKey?: string;
  error?: string;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  template: `
    <div class="uploader-container" [class.mode-image]="mode === 'image'">
      <!-- ============================================== -->
      <!-- IMAGE MODE: Product Cover / Company Logo UI     -->
      <!-- ============================================== -->
      <ng-container *ngIf="mode === 'image'">
        <div class="image-uploader" [class.has-image]="previewUrl || existingUrl" [class.drag-over]="isDragOver">
          <input
            #imageInput
            type="file"
            [accept]="accept || 'image/png,image/jpeg,image/webp'"
            (change)="onFileSelected($event)"
            hidden
          />

          <!-- Preview State -->
          <div class="image-preview-wrapper" *ngIf="previewUrl || existingUrl">
            <img [src]="previewUrl || existingUrl" alt="Upload Preview" class="preview-img" />
            <div class="image-overlay">
              <button mat-mini-fab color="primary" type="button" (click)="imageInput.click()" matTooltip="Change Image">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-mini-fab color="warn" type="button" (click)="removeImage()" matTooltip="Remove Image">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>

          <!-- Empty Upload Dropzone -->
          <div
            class="image-dropzone"
            *ngIf="!previewUrl && !existingUrl"
            (click)="imageInput.click()"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onDrop($event)"
          >
            <div class="icon-circle">
              <mat-icon class="drop-icon">add_photo_alternate</mat-icon>
            </div>
            <div class="dropzone-text">
              <span class="primary-label">{{ label || 'Upload Product Image' }}</span>
              <span class="sub-label">PNG, JPG, or WEBP up to {{ maxFileSizeMb }}MB</span>
            </div>
            <button mat-stroked-button color="primary" type="button" class="browse-btn">
              <mat-icon>upload</mat-icon> Browse File
            </button>
          </div>
        </div>
      </ng-container>

      <!-- ============================================== -->
      <!-- DOCUMENT / CERTIFICATE MODE: Compliance Files  -->
      <!-- ============================================== -->
      <ng-container *ngIf="mode === 'document'">
        <div
          class="document-dropzone"
          [class.drag-over]="isDragOver"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
          (click)="docInput.click()"
        >
          <input
            #docInput
            type="file"
            [accept]="accept || '.pdf,.doc,.docx,application/pdf'"
            [multiple]="multiple"
            (change)="onFileSelected($event)"
            hidden
          />

          <div class="dropzone-content">
            <div class="icon-circle doc-circle">
              <mat-icon class="drop-icon">verified_user</mat-icon>
            </div>
            <div class="text-content">
              <span class="primary-label">{{ label || 'Upload Compliance Certificate (CE, UN 38.3, RoHS)' }}</span>
              <span class="sub-label">Drag & drop your files here or click to browse (PDF up to {{ maxFileSizeMb }}MB)</span>
            </div>
          </div>
        </div>

        <!-- Document List -->
        <div class="document-list" *ngIf="fileList.length > 0">
          <div class="document-item" *ngFor="let item of fileList; let i = index">
            <div class="doc-icon-badge" [class.is-pdf]="item.name.toLowerCase().endsWith('.pdf')">
              <mat-icon>description</mat-icon>
            </div>
            <div class="doc-details">
              <div class="doc-header">
                <span class="doc-name" [matTooltip]="item.name">{{ item.name }}</span>
                <span class="doc-badge" *ngIf="documentType">{{ documentType }}</span>
              </div>
              <div class="doc-meta">
                <span class="doc-size">{{ formatBytes(item.size) }}</span>
                <span class="doc-status status-{{ item.status }}">
                  <mat-icon class="status-icon" *ngIf="item.status === 'completed'">check_circle</mat-icon>
                  <mat-icon class="status-icon" *ngIf="item.status === 'error'">error</mat-icon>
                  {{ item.status === 'uploading' ? 'Uploading ' + item.progress + '%' : (item.status === 'completed' ? 'Uploaded' : (item.status === 'error' ? 'Failed' : 'Ready')) }}
                </span>
              </div>
              <mat-progress-bar
                *ngIf="item.status === 'uploading'"
                mode="determinate"
                [value]="item.progress"
                class="upload-bar"
              ></mat-progress-bar>
              <span class="error-msg" *ngIf="item.error">{{ item.error }}</span>
            </div>
            <button mat-icon-button color="warn" type="button" (click)="removeDocument(i)" matTooltip="Remove">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .uploader-container {
      width: 100%;
      font-family: inherit;
    }

    /* Common Dropzone Styles */
    .icon-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #eff6ff;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 12px;
      transition: all 0.2s ease;
    }
    .icon-circle .drop-icon {
      color: #2563eb;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    .icon-circle.doc-circle {
      background: #f0fdf4;
    }
    .icon-circle.doc-circle .drop-icon {
      color: #16a34a;
    }

    .primary-label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 4px;
    }
    .sub-label {
      display: block;
      font-size: 12px;
      color: #64748b;
    }

    /* IMAGE MODE */
    .image-uploader {
      position: relative;
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      background: #f8fafc;
      overflow: hidden;
      transition: all 0.25s ease;
      min-height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .image-uploader.drag-over {
      border-color: #2563eb;
      background: #eff6ff;
    }
    .image-dropzone {
      padding: 24px;
      text-align: center;
      cursor: pointer;
      width: 100%;
    }
    .browse-btn {
      margin-top: 12px !important;
    }
    .image-preview-wrapper {
      position: relative;
      width: 100%;
      height: 220px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0f172a;
    }
    .preview-img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .image-overlay {
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    .image-preview-wrapper:hover .image-overlay {
      opacity: 1;
    }

    /* DOCUMENT MODE */
    .document-dropzone {
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      background: #f8fafc;
      padding: 24px;
      cursor: pointer;
      text-align: center;
      transition: all 0.25s ease;
    }
    .document-dropzone:hover, .document-dropzone.drag-over {
      border-color: #16a34a;
      background: #f0fdf4;
    }
    .document-dropzone.drag-over .doc-circle {
      transform: scale(1.1);
    }

    /* Document List */
    .document-list {
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .document-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 16px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      transition: transform 0.2s ease;
    }
    .document-item:hover {
      border-color: #cbd5e1;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.06);
    }
    .doc-icon-badge {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: #f1f5f9;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .doc-icon-badge.is-pdf {
      background: #fef2f2;
      color: #dc2626;
    }
    .doc-details {
      flex: 1;
      min-width: 0;
    }
    .doc-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .doc-name {
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 320px;
    }
    .doc-badge {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 2px 6px;
      border-radius: 4px;
      background: #eff6ff;
      color: #2563eb;
    }
    .doc-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 2px;
    }
    .doc-size {
      font-size: 11px;
      color: #64748b;
    }
    .doc-status {
      font-size: 11px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .doc-status.status-completed {
      color: #16a34a;
    }
    .doc-status.status-error {
      color: #dc2626;
    }
    .status-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }
    .upload-bar {
      margin-top: 6px;
      border-radius: 4px;
    }
    .error-msg {
      font-size: 11px;
      color: #dc2626;
      display: block;
      margin-top: 4px;
    }
  `],
})
export class FileUploadComponent implements OnInit {
  @Input() mode: 'image' | 'document' = 'document';
  @Input() accept = '';
  @Input() multiple = false;
  @Input() maxFileSizeMb = 10;
  @Input() existingUrl?: string;
  @Input() label = '';
  @Input() category: 'public' | 'compliance' = 'public';
  @Input() documentType = '';
  @Input() productId?: string;
  @Input() autoUpload = true;

  @Output() fileUploaded = new EventEmitter<{ url: string; fileKey: string; file?: File; name: string }>();
  @Output() fileRemoved = new EventEmitter<void>();
  @Output() filesSelected = new EventEmitter<File[]>();
  @Output() uploadError = new EventEmitter<string>();

  isDragOver = false;
  previewUrl: string | null = null;
  fileList: UploadedFileItem[] = [];

  constructor(private uploadService: UploadService) {}

  ngOnInit(): void {
    if (this.existingUrl && this.mode === 'image') {
      this.previewUrl = this.existingUrl;
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFiles(Array.from(input.files));
      input.value = ''; // Reset input to allow selecting same file again
    }
  }

  private processFiles(files: File[]): void {
    const validFiles: File[] = [];

    for (const file of files) {
      if (file.size > this.maxFileSizeMb * 1024 * 1024) {
        const err = `File "${file.name}" exceeds the maximum limit of ${this.maxFileSizeMb}MB`;
        this.uploadError.emit(err);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    this.filesSelected.emit(validFiles);

    if (this.mode === 'image') {
      const singleFile = validFiles[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(singleFile);

      if (this.autoUpload) {
        this.performUpload(singleFile, 0);
      }
    } else {
      for (const file of validFiles) {
        const item: UploadedFileItem = {
          name: file.name,
          size: file.size,
          progress: 0,
          status: 'idle',
          file,
        };
        const index = this.fileList.push(item) - 1;
        if (this.autoUpload) {
          this.performUpload(file, index);
        }
      }
    }
  }

  private performUpload(file: File, index: number): void {
    const item = this.mode === 'document' ? this.fileList[index] : null;
    if (item) {
      item.status = 'uploading';
    }

    // Attempt direct Cloudflare R2 presigned upload first
    this.uploadService.getPresignedUploadUrl(file.name, file.type, this.category, this.productId).subscribe({
      next: (res) => {
        if (res && res.uploadUrl) {
          this.uploadService.uploadToPresignedUrl(res.uploadUrl, file).subscribe({
            next: (progress) => {
              if (item) item.progress = progress;
            },
            complete: () => {
              if (item) {
                item.progress = 100;
                item.status = 'completed';
                item.url = res.publicUrl || res.fileKey;
                item.fileKey = res.fileKey;
              }
              this.fileUploaded.emit({
                url: res.publicUrl || res.fileKey,
                fileKey: res.fileKey,
                file,
                name: file.name,
              });
            },
            error: (err) => {
              this.fallbackMultipart(file, item);
            },
          });
        } else {
          this.fallbackMultipart(file, item);
        }
      },
      error: () => {
        // Fallback to backend multipart upload if presigned endpoint is not yet active
        this.fallbackMultipart(file, item);
      },
    });
  }

  private fallbackMultipart(file: File, item: UploadedFileItem | null): void {
    this.uploadService
      .uploadMultipart(file, {
        category: this.category,
        documentType: this.documentType,
        productId: this.productId,
      })
      .subscribe({
        next: (res: any) => {
          if (item) {
            item.status = 'completed';
            item.progress = 100;
            item.url = res.storagePath || res.url;
            item.fileKey = res.id;
          }
          this.fileUploaded.emit({
            url: res.storagePath || res.url || URL.createObjectURL(file),
            fileKey: res.id || file.name,
            file,
            name: file.name,
          });
        },
        error: (err) => {
          if (item) {
            item.status = 'error';
            item.error = 'Upload failed. Please try again.';
          }
          this.uploadError.emit(`Failed to upload ${file.name}`);
        },
      });
  }

  removeImage(): void {
    this.previewUrl = null;
    this.existingUrl = undefined;
    this.fileRemoved.emit();
  }

  removeDocument(index: number): void {
    this.fileList.splice(index, 1);
    this.fileRemoved.emit();
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
