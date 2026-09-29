import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { Toast, ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="toast-container" *ngIf="toasts$ | async as toasts">
      <div
        *ngFor="let toast of toasts"
        class="toast-item toast-{{ toast.type }}"
      >
        <div class="toast-content">
          <mat-icon class="toast-icon">{{ getIcon(toast.type) }}</mat-icon>
          <span>{{ toast.message }}</span>
        </div>
        <button class="toast-close" (click)="dismiss(toast.id)" aria-label="Close notification">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    </div>
  `,
})
export class ToastComponent implements OnInit {
  toasts$!: Observable<Toast[]>;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toasts$ = this.toastService.toasts$;
  }

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  }
}
