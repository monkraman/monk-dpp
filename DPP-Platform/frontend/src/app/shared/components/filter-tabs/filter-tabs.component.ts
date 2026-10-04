import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface FilterTabItem {
  id: string;
  label: string;
  count?: number;
  icon?: string;
}

@Component({
  selector: 'app-filter-tabs',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="filter-tabs-container">
      <button
        type="button"
        *ngFor="let tab of tabs"
        class="tab-btn"
        [class.active]="tab.id === activeTab"
        (click)="onTabClick(tab.id)"
      >
        <mat-icon *ngIf="tab.icon" class="tab-icon">{{ tab.icon }}</mat-icon>
        <span class="tab-label">{{ tab.label }}</span>
        <span *ngIf="tab.count !== undefined" class="tab-count">{{ tab.count }}</span>
      </button>
    </div>
  `,
  styles: [`
    .filter-tabs-container {
      display: inline-flex;
      align-items: center;
      background: var(--bg-hover, #f1f5f9);
      padding: 3px;
      border-radius: var(--radius-md, 8px);
      border: 1px solid var(--border-color, #e2e8f0);
      gap: 2px;
    }

    .tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: none;
      background: transparent;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 500;
      color: var(--text-muted, #64748b);
      border-radius: var(--radius-sm, 6px);
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;

      .tab-icon {
        font-size: 15px;
        width: 15px;
        height: 15px;
      }

      .tab-count {
        font-size: 10px;
        font-weight: 600;
        background: rgba(0, 0, 0, 0.06);
        padding: 1px 6px;
        border-radius: 9999px;
      }

      &:hover {
        color: var(--text-primary, #0f172a);
      }

      &.active {
        background: var(--bg-surface, #ffffff);
        color: var(--text-primary, #0f172a);
        font-weight: 600;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

        .tab-count {
          background: var(--brand-primary-light, #ecfdf5);
          color: var(--brand-accent, #10b981);
        }
      }
    }
  `],
})
export class FilterTabsComponent {
  @Input() tabs: FilterTabItem[] = [];
  @Input() activeTab = '';
  @Output() tabChange = new EventEmitter<string>();

  onTabClick(tabId: string): void {
    if (this.activeTab !== tabId) {
      this.activeTab = tabId;
      this.tabChange.emit(tabId);
    }
  }
}
