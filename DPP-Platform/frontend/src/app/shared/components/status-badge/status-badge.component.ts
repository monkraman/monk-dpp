import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule, MatBadgeModule, MatIconModule, MatTooltipModule],
  template: `
    <span
      class="status-badge"
      [class]="'status-badge--' + status"
      [matTooltip]="tooltip"
    >
      <mat-icon *ngIf="showIcon" class="status-icon">
        {{ getIcon() }}
      </mat-icon>
      <span class="status-label">{{ getLabel() }}</span>
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
      color: var(--text-primary);

      .status-icon {
        font-size: 15px;
        width: 15px;
        height: 15px;
        color: var(--text-secondary);
      }

      .status-label {
        line-height: 1;
      }
    }

    .status-badge--published,
    .status-badge--completed,
    .status-badge--active,
    .status-badge--approved,
    .status-badge--success,
    .status-badge--verified {
      .status-icon {
        color: #10b981;
      }
    }

    .status-badge--pending,
    .status-badge--submitted,
    .status-badge--sent,
    .status-badge--responded {
      .status-icon {
        color: #f59e0b;
      }
    }

    .status-badge--draft,
    .status-badge--archived,
    .status-badge--deleted,
    .status-badge--expired,
    .status-badge--inactive,
    .status-badge--unverified {
      color: var(--text-secondary);
      .status-icon {
        color: var(--text-muted);
      }
    }

    .status-badge--error,
    .status-badge--failed,
    .status-badge--rejected {
      color: #ef4444;
      .status-icon {
        color: #ef4444;
      }
    }
  `]
})
export class StatusBadgeComponent implements OnInit {
  @Input() status = '';
  @Input() showIcon = true;
  @Input() customLabels: Record<string, string> = {};
  @Input() customIcons: Record<string, string> = {};

  ngOnInit(): void {}

  getLabel(): string {
    return this.customLabels[this.status] || this.getDefaultLabel(this.status);
  }

  getIcon(): string {
    return this.customIcons[this.status] || this.getDefaultIcon(this.status);
  }

  get tooltip(): string {
    return this.getLabel();
  }

  private getDefaultLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'Draft',
      published: 'Published',
      archived: 'Archived',
      submitted: 'Submitted',
      approved: 'Approved',
      pending: 'Pending',
      sent: 'Sent',
      responded: 'Responded',
      completed: 'Completed',
      expired: 'Expired',
      deleted: 'Deleted',
      active: 'Active',
      inactive: 'Inactive',
      error: 'Error',
      failed: 'Failed',
      success: 'Success',
      verified: 'Verified',
      unverified: 'Unverified',
    };
    return labels[status] || status;
  }

  private getDefaultIcon(status: string): string {
    const icons: Record<string, string> = {
      draft: 'edit_note',
      published: 'check_circle',
      archived: 'archive',
      submitted: 'send',
      approved: 'verified',
      pending: 'pending',
      sent: 'email',
      responded: 'reply',
      completed: 'done_all',
      expired: 'expiration_time',
      deleted: 'delete',
      active: 'play_circle',
      inactive: 'pause_circle',
      error: 'error',
      failed: 'cancel',
      success: 'check_circle',
      verified: 'verified_user',
      unverified: 'cancel',
    };
    return icons[status] || 'info';
  }
}
