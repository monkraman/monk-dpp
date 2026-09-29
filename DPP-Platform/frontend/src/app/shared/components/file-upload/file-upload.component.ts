import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  template: `
    <div class="file-upload" [class.dragover]="isDragOver">
      <input
        type="file"
        #fileInput
        [accept]="accept"
        [multiple]="multiple"
        (change)="onFileSelected($event)"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        hidden
      />
      
      <div class="upload-area" (click)="fileInput.click()">
        <mat-icon class="upload-icon">cloud_upload</mat-icon>
        <span class="upload-text">
          <span class="upload-primary">{{ uploadText }}</span>
          <span class="upload-hint" *ngIf="hint">{{ hint }}</span>
        </span>
        <span class="upload-restrictions" *ngIf="restrictions">{{ restrictions }}</span>
      </div>
      
      <div class="file-list" *ngIf="files.length > 0">
        <div class="file-item" *ngFor="let file of files; let i = index">
          <mat-icon class="file-icon">insert_drive_file</mat-icon>
          <div class="file-info">
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ getFileSize(file.size) }}</span>
          </div>
          <div class="file-progress" *ngIf="file.progress !== undefined">
            <mat-progress-bar mode="determinate" [value]="file.progress"></mat-progress-bar>
          </div>
          <button mat-icon-button class="file-remove" (click)="removeFile(i)">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>
      
      <div class="upload-actions" *ngIf="files.length > 0">
        <button mat-button color="primary" [disabled]="isUploading" (click)="upload()">
          <mat-icon>cloud_upload</mat-icon>
          {{ isUploading ? 'Uploading...' : 'Upload Files' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .file-upload {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .upload-area {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 32px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      background: #fafafa;
    }
    .file-upload.dragover .upload-area {
      border-color: #1976d2;
      background: rgba(25, 118, 210, 0.05);
    }
    .upload-icon {
      font-size: 40px;
      color: #9e9e9e;
      margin-bottom: 8px;
    }
    .upload-text {
      font-size: 14px;
      color: #555;
    }
    .upload-primary {
      font-weight: 500;
      color: #333;
    }
    .upload-hint {
      display: block;
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }
    .upload-restrictions {
      display: block;
      font-size: 12px;
      color: #999;
      margin-top: 8px;
    }
    .file-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .file-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }
    .file-icon {
      color: #9e9e9e;
    }
    .file-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .file-name {
      font-size: 13px;
      color: #333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 300px;
    }
    .file-size {
      font-size: 11px;
      color: #999;
    }
    .file-progress {
      width: 100px;
    }
    .file-remove {
      color: #999;
    }
    .file-remove:hover {
      color: #f44336;
    }
    .upload-actions {
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class FileUploadComponent implements OnInit {
  @Input() accept = '';
  @Input() multiple = false;
  @Input() uploadText = 'Click to upload or drag and drop';
  @Input() hint = 'Max file size: 10MB';
  @Input() restrictions = 'PDF, Images (PNG, JPG)';
  @Input() maxFileSize = 10 * 1024 * 1024; // 10MB default
  @Input() isUploading = false;

  @Output() filesSelected = new EventEmitter<File[]>();
  @Output() uploadStarted = new EventEmitter<void>();
  @Output() uploadProgress = new EventEmitter<{ file: File; progress: number }>();
  @Output() uploadComplete = new EventEmitter<any[]>();
  @Output() uploadError = new EventEmitter<string>();

  files: { name: string; size: number; progress?: number; file: File }[] = [];
  isDragOver = false;

  ngOnInit(): void {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
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
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  private handleFiles(files: File[]): void {
    for (const file of files) {
      if (!this.validateFile(file)) {
        continue;
      }

      // Check for duplicates
      const existing = this.files.find(f => f.name === file.name && f.size === file.size);
      if (existing) {
        continue;
      }

      this.files.push({
        name: file.name,
        size: file.size,
        file,
        progress: 0,
      });
    }

    this.filesSelected.emit(this.files.map(f => f.file));
  }

  private validateFile(file: File): boolean {
    // Check file type
    if (this.accept && !this.accept.split(',').some(t => file.type.includes(t.trim()))) {
      this.uploadError.emit(`File type not allowed: ${file.name}`);
      return false;
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      this.uploadError.emit(`File too large: ${file.name} (max ${this.maxFileSize / 1024 / 1024}MB)`);
      return false;
    }

    return true;
  }

  removeFile(index: number): void {
    this.files.splice(index, 1);
    this.filesSelected.emit(this.files.map(f => f.file));
  }

  getFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  upload(): void {
    if (this.isUploading || this.files.length === 0) return;

    this.isUploading = true;
    this.uploadStarted.emit();

    // Simulated upload progress
    let completed = 0;
    for (const fileItem of this.files) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          completed++;

          this.uploadProgress.emit({ file: fileItem.file, progress: 100 });

          if (completed === this.files.length) {
            this.isUploading = false;
            this.uploadComplete.emit(this.files.map(f => f.file));
          }
        } else {
          this.uploadProgress.emit({ file: fileItem.file, progress });
        }
      }, 100);
    }
  }
}
