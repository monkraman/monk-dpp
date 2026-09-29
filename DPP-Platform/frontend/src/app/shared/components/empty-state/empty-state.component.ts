import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [NgIf, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="empty-state">
      <mat-card class="empty-card">
        <div class="empty-icon">
          <mat-icon [fontIcon]="icon"></mat-icon>
        </div>
        <h3 class="empty-title">{{ title }}</h3>
        <p class="empty-description" *ngIf="description">{{ description }}</p>
        <div class="empty-action" *ngIf="actionLabel">
          <button mat-flat-button color="primary" (click)="onAction()">
            {{ actionLabel }}
          </button>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 48px 24px;
      height: 100%;
    }
    .empty-card {
      max-width: 400px;
      padding: 32px;
      text-align: center;
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      border-radius: 8px;
    }
    .empty-icon {
      font-size: 48px;
      color: #9e9e9e;
      margin-bottom: 16px;
    }
    .empty-title {
      font-size: 18px;
      font-weight: 500;
      color: #333;
      margin: 0 0 8px;
    }
    .empty-description {
      font-size: 14px;
      color: #666;
      margin: 0 0 24px;
      line-height: 1.5;
    }
    .empty-action {
      margin-top: 8px;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'folder_open';
  @Input() title = 'No data';
  @Input() description = '';
  @Input() actionLabel = '';
  @Input() actionCallback: (() => void) | null = null;

  onAction(): void {
    if (this.actionCallback) {
      this.actionCallback();
    }
  }
}
