import { Component, Input, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="loading-spinner-container" [ngClass]="{ 'overlay': overlay }">
      <mat-spinner [diameter]="diameter" [strokeWidth]="strokeWidth" color="primary"></mat-spinner>
      <span *ngIf="message" class="loading-message">{{ message }}</span>
    </div>
  `,
  styles: [`
    .loading-spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .loading-spinner-container.overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.7);
      z-index: 9999;
    }
    .loading-message {
      margin-top: 12px;
      font-size: 14px;
      color: #666;
    }
  `]
})
export class LoadingSpinnerComponent implements OnInit {
  @Input() diameter = 48;
  @Input() strokeWidth = 4;
  @Input() message = '';
  @Input() overlay = false;

  ngOnInit(): void {}
}
