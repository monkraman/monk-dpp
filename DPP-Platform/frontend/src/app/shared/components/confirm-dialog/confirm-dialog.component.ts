import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Inject } from '@angular/core';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'accent' | 'warn';
  icon?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [NgIf, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="dialog-header" *ngIf="data.title || data.icon">
        <mat-icon *ngIf="data.icon" class="dialog-icon">{{ data.icon }}</mat-icon>
        <h2 class="dialog-title" *ngIf="data.title">{{ data.title }}</h2>
      </div>
      
      <div class="dialog-content">
        <p>{{ data.message }}</p>
      </div>
      
      <div class="dialog-actions">
        <button mat-button (click)="onCancel()">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button mat-flat-button [color]="data.confirmColor || 'primary'" (click)="onConfirm()">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      padding: 8px;
      min-width: 300px;
      max-width: 450px;
    }
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e0e0e0;
      margin-bottom: 16px;
    }
    .dialog-icon {
      font-size: 24px;
      color: #1976d2;
    }
    .dialog-title {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
      color: #333;
    }
    .dialog-content {
      padding: 8px 0;
      line-height: 1.5;
      color: #555;
    }
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }
  `]
})
export class ConfirmDialogComponent {
  @Input() data!: ConfirmDialogData;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: ConfirmDialogData,
  ) {
    this.data = dialogData;
  }

  onConfirm(): void {
    this.confirm.emit();
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.cancel.emit();
    this.dialogRef.close(false);
  }
}
