/**
 * Primary Button Component
 * Green for important actions, DPP-specific
 */
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ms-primary-button',
  template: `
    <button 
      class="btn btn-primary"
      [class.btn-primary-dark]="dark"
      [disabled]="disabled || loading"
      (click)="onClick.emit($event)"
      type="button"
    >
      <span *ngIf="loading" class="loading-spinner"></span>
      <ng-content></ng-content>
      <mat-icon *ngIf="icon" class="btn-icon">{{ icon }}</mat-icon>
    </button>
  `,
  styleUrls: ['./primary-button.component.scss']
})
export class PrimaryButtonComponent {
  @Input() disabled = false;
  @Input() loading = false;
  @Input() dark = false;
  @Input() icon: string | null = null;
  @Output() onClick = new EventEmitter<Event>();
}