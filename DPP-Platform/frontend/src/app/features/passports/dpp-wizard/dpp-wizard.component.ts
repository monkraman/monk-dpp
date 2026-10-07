import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CreateDppModalComponent, CreatedPassportResult } from '../create-dpp-modal/create-dpp-modal.component';

@Component({
  selector: 'app-dpp-wizard',
  standalone: true,
  imports: [CommonModule, CreateDppModalComponent],
  template: `
    <app-create-dpp-modal
      [isOpen]="true"
      (close)="onClose()"
      (passportCreated)="onPassportCreated($event)"
    ></app-create-dpp-modal>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
})
export class DppWizardComponent {
  constructor(private router: Router) {}

  onClose(): void {
    this.router.navigate(['/product-passports']);
  }

  onPassportCreated(res: CreatedPassportResult): void {
    this.router.navigate(['/product-passports']);
  }
}