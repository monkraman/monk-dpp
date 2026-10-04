import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="search-box" [style.max-width.px]="maxWidth">
      <mat-icon class="search-icon">search</mat-icon>
      <input
        type="text"
        [placeholder]="placeholder"
        [(ngModel)]="searchQuery"
        (ngModelChange)="onModelChange($event)"
        class="search-native-input"
      />
      <button
        *ngIf="searchQuery"
        type="button"
        class="clear-btn"
        (click)="clearSearch()"
        title="Clear"
      >
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .search-box {
      display: flex;
      align-items: center;
      background: var(--bg-surface, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: var(--radius-md, 8px);
      padding: 0 12px;
      height: 38px;
      width: 100%;
      min-width: 200px;
      transition: all 0.15s ease;

      &:focus-within {
        border-color: var(--brand-accent, #10b981);
        box-shadow: 0 0 0 3px var(--brand-accent-glow, rgba(16, 185, 129, 0.2));
      }

      .search-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--text-muted, #64748b);
        margin-right: 8px;
        flex-shrink: 0;
      }

      .search-native-input {
        border: none;
        outline: none;
        background: transparent;
        font-size: 13px;
        color: var(--text-primary, #0f172a);
        width: 100%;

        &::placeholder {
          color: var(--text-light, #94a3b8);
        }
      }

      .clear-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 2px;
        color: var(--text-muted, #64748b);
        display: flex;
        align-items: center;
        flex-shrink: 0;

        mat-icon {
          font-size: 15px;
          width: 15px;
          height: 15px;
        }

        &:hover {
          color: var(--text-primary, #0f172a);
        }
      }
    }
  `],
})
export class SearchInputComponent {
  @Input() placeholder = 'Search...';
  @Input() maxWidth = 300;
  @Input() searchQuery = '';
  @Output() searchChange = new EventEmitter<string>();

  onModelChange(val: string): void {
    this.searchChange.emit(val);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchChange.emit('');
  }
}
