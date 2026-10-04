import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="stat-card">
      <div class="stat-card-top">
        <span class="stat-label">{{ label }}</span>
        <div class="stat-icon-wrap" *ngIf="icon">
          <mat-icon>{{ icon }}</mat-icon>
        </div>
      </div>

      <div class="stat-card-middle">
        <div class="stat-value-row">
          <span class="stat-value">{{ value }}</span>
          <span class="stat-unit" *ngIf="unit">{{ unit }}</span>
        </div>
        <span
          *ngIf="change"
          class="stat-pill"
          [class.pill-positive]="trend === 'positive'"
          [class.pill-negative]="trend === 'negative'"
          [class.pill-neutral]="trend === 'neutral'"
        >
          {{ change }}
        </span>
      </div>

      <div class="stat-card-bottom" *ngIf="detail">
        <span class="stat-detail">{{ detail }}</span>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      background: var(--bg-card, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: var(--radius-lg, 12px);
      padding: 20px;
      box-shadow: var(--shadow-card, 0 1px 3px rgba(0, 0, 0, 0.05));
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: all 0.2s ease;

      &:hover {
        box-shadow: var(--shadow-card-hover, 0 8px 18px rgba(0, 0, 0, 0.08));
        transform: translateY(-2px);
      }
    }

    .stat-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .stat-label {
        font-size: 13px;
        font-weight: 500;
        color: var(--text-muted, #64748b);
      }

      .stat-icon-wrap {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-md, 8px);
        background: var(--brand-primary-light, #ecfdf5);
        display: flex;
        align-items: center;
        justify-content: center;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          color: var(--brand-accent, #10b981);
        }
      }
    }

    .stat-card-middle {
      display: flex;
      justify-content: space-between;
      align-items: baseline;

      .stat-value-row {
        display: flex;
        align-items: baseline;
        gap: 4px;
      }

      .stat-value {
        font-size: 26px;
        font-weight: 700;
        color: var(--text-primary, #0f172a);
        letter-spacing: -0.02em;
      }

      .stat-unit {
        font-size: 12px;
        color: var(--text-muted, #64748b);
        font-weight: 500;
      }

      .stat-pill {
        font-size: 11px;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: var(--radius-full, 9999px);
        background: var(--badge-draft-bg, #f1f5f9);
        color: var(--badge-draft-text, #475569);

        &.pill-positive {
          background: var(--badge-published-bg, #dcfce7);
          color: var(--badge-published-text, #15803d);
        }

        &.pill-negative {
          background: #fee2e2;
          color: #b91c1c;
        }

        &.pill-neutral {
          background: var(--bg-hover, #f1f5f9);
          color: var(--text-muted, #64748b);
        }
      }
    }

    .stat-card-bottom {
      border-top: 1px solid var(--border-light, #f1f5f9);
      padding-top: 10px;

      .stat-detail {
        font-size: 11px;
        color: var(--text-muted, #64748b);
      }
    }
  `],
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() unit = '';
  @Input() change = '';
  @Input() trend: 'positive' | 'negative' | 'neutral' = 'neutral';
  @Input() detail = '';
  @Input() icon = '';
}
