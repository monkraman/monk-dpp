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
      background: var(--bg-surface, #1e1f20);
      padding: 3px;
      border-radius: 8px;
      border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
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
      color: var(--text-secondary, #9aa0a6);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;

      .tab-icon {
        font-size: 15px;
        width: 15px;
        height: 15px;
        color: inherit;
      }

      .tab-count {
        font-size: 11px;
        font-weight: 600;
        background: rgba(125, 125, 125, 0.15);
        color: var(--text-secondary, #9aa0a6);
        padding: 1px 6px;
        border-radius: 9999px;
      }

      &:hover {
        color: var(--text-primary, #e3e3e3);
        background: var(--bg-surface-hover, rgba(255, 255, 255, 0.05));
      }

      &.active {
        background: var(--bg-surface-active, rgba(255, 255, 255, 0.12));
        color: var(--text-primary, #ffffff);
        font-weight: 600;

        .tab-count {
          background: rgba(125, 125, 125, 0.25);
          color: var(--text-primary, #ffffff);
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
