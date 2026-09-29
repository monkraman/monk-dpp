import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="spinner-container" [class.fullscreen]="fullscreen">
      <mat-spinner [diameter]="diameter" color="primary"></mat-spinner>
      <p *ngIf="message" class="spinner-message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      gap: 16px;
    }
    .spinner-container.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.85);
      z-index: 9999;
    }
    .spinner-message {
      margin: 0;
      font-size: 14px;
      color: #666;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() diameter = 48;
  @Input() message = '';
  @Input() fullscreen = false;
}
