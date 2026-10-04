import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-meter">
      <div class="meter-info">
        <span class="meter-label">{{ label }}</span>
        <div class="meter-values">
          <span class="meter-current" [style.color]="color || 'var(--brand-accent)'">
            {{ value }}{{ unit }}
          </span>
          <span class="meter-target" *ngIf="target !== undefined">
            / Target {{ target }}{{ unit }}
          </span>
        </div>
      </div>
      <div class="meter-track">
        <div
          class="meter-fill"
          [style.width.%]="clampedPercentage"
          [style.background-color]="color || 'var(--brand-accent)'"
        ></div>
      </div>
      <span class="meter-subtext" *ngIf="subtext">{{ subtext }}</span>
    </div>
  `,
  styles: [`
    .progress-meter {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
    }

    .meter-info {
      display: flex;
      justify-content: space-between;
      align-items: baseline;

      .meter-label {
        font-size: 13px;
        font-weight: 500;
        color: var(--text-primary, #0f172a);
      }

      .meter-values {
        display: flex;
        align-items: baseline;
        gap: 4px;

        .meter-current {
          font-size: 13px;
          font-weight: 700;
        }

        .meter-target {
          font-size: 11px;
          color: var(--text-muted, #64748b);
        }
      }
    }

    .meter-track {
      width: 100%;
      height: 7px;
      background: var(--border-light, #f1f5f9);
      border-radius: var(--radius-full, 9999px);
      overflow: hidden;

      .meter-fill {
        height: 100%;
        border-radius: var(--radius-full, 9999px);
        transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }
    }

    .meter-subtext {
      font-size: 11px;
      color: var(--text-muted, #64748b);
    }
  `],
})
export class ProgressBarComponent {
  @Input() label = '';
  @Input() value = 0;
  @Input() target: number | null = null;
  @Input() max = 100;
  @Input() unit = '%';
  @Input() color = '';
  @Input() subtext = '';

  get clampedPercentage(): number {
    const denominator = this.target ? this.target * 1.25 : this.max;
    const pct = (this.value / denominator) * 100;
    return Math.min(100, Math.max(0, pct));
  }
}
