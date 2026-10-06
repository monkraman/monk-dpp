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
      gap: 4px;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
    }
    /* DPP Unified Semantic Status System */
    /* 1. Success / Live / Active / Published / Approved / Completed */
    .status-badge--published,
    .status-badge--completed,
    .status-badge--active,
    .status-badge--approved,
    .status-badge--success,
    .status-badge--verified {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    :host-context([data-theme='light']) .status-badge--published,
    :host-context([data-theme='light']) .status-badge--completed,
    :host-context([data-theme='light']) .status-badge--active,
    :host-context([data-theme='light']) .status-badge--approved,
    :host-context([data-theme='light']) .status-badge--success,
    :host-context([data-theme='light']) .status-badge--verified {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }

    /* 2. Pending / Review / Submitted / Sent / Responded */
    .status-badge--pending,
    .status-badge--submitted,
    .status-badge--sent,
    .status-badge--responded {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    :host-context([data-theme='light']) .status-badge--pending,
    :host-context([data-theme='light']) .status-badge--submitted,
    :host-context([data-theme='light']) .status-badge--sent,
    :host-context([data-theme='light']) .status-badge--responded {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }

    /* 3. Neutral / Draft / Archived / Expired / Inactive */
    .status-badge--draft,
    .status-badge--archived,
    .status-badge--deleted,
    .status-badge--expired,
    .status-badge--inactive,
    .status-badge--unverified {
      background: rgba(148, 163, 184, 0.12);
      color: #cbd5e1;
      border: 1px solid rgba(148, 163, 184, 0.25);
    }
    :host-context([data-theme='light']) .status-badge--draft,
    :host-context([data-theme='light']) .status-badge--archived,
    :host-context([data-theme='light']) .status-badge--deleted,
    :host-context([data-theme='light']) .status-badge--expired,
    :host-context([data-theme='light']) .status-badge--inactive,
    :host-context([data-theme='light']) .status-badge--unverified {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
    }

    /* 4. Danger / Error / Failed / Rejected */
    .status-badge--error,
    .status-badge--failed,
    .status-badge--rejected {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    :host-context([data-theme='light']) .status-badge--error,
    :host-context([data-theme='light']) .status-badge--failed,
    :host-context([data-theme='light']) .status-badge--rejected {
      background: #fef2f2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }
    .status-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }
    .status-label {
      line-height: 1;
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
