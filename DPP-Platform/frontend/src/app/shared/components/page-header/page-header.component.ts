import { Component, Input } from '@angular/core';
import { NgIf, NgStyle } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [NgIf, NgStyle],
  template: `
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ title }}</h1>
        <p class="page-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
      </div>
      <div class="header-right">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      padding: 0 4px;
    }
    .page-title {
      font-size: 24px;
      font-weight: 500;
      color: #1a237e;
      margin: 0;
    }
    .page-subtitle {
      font-size: 14px;
      color: #666;
      margin: 4px 0 0;
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
