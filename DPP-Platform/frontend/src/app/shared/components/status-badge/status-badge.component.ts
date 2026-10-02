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
    /* DPP-specific style overrides */
      .status-badge--draft {
        background: var(--ms-green-light);
        color: var(--ms-primary-dark);
      }
      .status-badge--published, .status-badge--completed, .status-badge--active, .status-badge--approved {
        background: #E8F5EC;
        color: #075C30;
      }
      .status-badge--submitted, .status-badge--sent, .status-badge--responded {
        background: #FFF8E1;
        color: #B7791F;
      }
      .status-badge--archived, .status-badge--deleted, .status-badge--expired, .status-badge--rejected {
        background: #F5F5F5;
        color: #666666;
      }
      .status-badge--pending {
        background: #FFF8E1;
        color: #B7791F;
      }
      .status-badge--error, .status-badge--failed {
        background: #FFEBEE;
        color: #D92D20;
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
