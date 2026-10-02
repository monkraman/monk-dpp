/**
 * DPP Creation Wizard
 * Multi-step workflow for creating Digital Product Passports
 * Based on EU Battery Regulation 2023/1542
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

import { Dpp, CreateDppDto } from '../../models/dpp.models';
import { ActivatedRoute, Router } from '@angular/router';
import { DppService } from '../services/dpp.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

interface Step {
  number: number;
  label: string;
  description: string;
  icon: string;
  completed: boolean;
  required: boolean;
}

@Component({
  selector: 'app-dpp-wizard',
  standalone: true,
  imports: [
    CommonModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressBarModule,
    MatSnackBarModule,
    FormsModule,
    ReactiveFormsModule,
    StatusBadgeComponent
  ],
  template: `
    <div class="dpp-wizard">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">Create Digital Product Passport</h1>
        <p class="page-subtitle">Guide you through creating a compliant DPP</p>
        
        <div class="progress-bar">
          <mat-progress-bar 
            mode="determinate" 
            [value]="completionPercentage"
            color="primary"
          ></mat-progress-bar>
          <div class="progress-text">
            {{ completionPercentage }}% complete
          </div>
        </div>
      </div>

      <!-- Stepper -->
      <mat-horizontal-stepper 
        [linear]="isLinear" 
        [selectedIndex]="currentStep"
        (selectionChange)="onStepChange($event)"
        class="stepper"
      >
        
        <!-- Step 1: Product Information -->
        <mat-step [stepControl]="step1Form" completed="isStepCompleted(1)">
          <mat-label>
            <mat-icon class="step-icon">inventory</mat-icon>
            Product Information
          </mat-label>
          <div class="step-content">
            <form [formGroup]="step1Form">
              <div class="field-row">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Product Name</mat-label>
                  <input matInput formControlName="name" placeholder="Battery Product Name">
                  <mat-icon matSuffix>label</mat-icon>
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Brand</mat-label>
                  <input matInput formControlName="brand" placeholder="Manufacturer Brand">
                  <mat-icon matSuffix>business</mat-icon>
                </mat-form-field>
              </div>
              
              <div class="field-row">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Battery Category</mat-label>
                  <mat-select formControlName="batteryCategory">
                    <mat-option value="EV">EV Battery</mat-option>
                    <mat-option value="LMT">Light Motor Transport</mat-option>
                    <mat-option value="Industrial">Industrial</mat-option>
                  </mat-select>
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Chemistry</mat-label>
                  <mat-select formControlName="chemistry">
                    <mat-option value="NMC">NMC (Nickel Manganese Cobalt)</mat-option>
                    <mat-option value="LFP">LFP (Lithium Iron Phosphate)</mat-option>
                    <mat-option value="Li-ion">Standard Li-ion</mat-option>
                    <mat-option value="Lead-acid">Lead-acid</mat-option>
                    <mat-option value="NiMH">Nickel Metal Hydride</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
              
              <div class="field-row">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Mass (kg)</mat-label>
                  <input matInput type="number" formControlName="massKg" placeholder="e.g., 12.5">
                  <span matSuffix>kg</span>
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Energy Capacity (Wh)</mat-label>
                  <input matInput type="number" formControlName="energyWh" placeholder="e.g., 65">
                  <span matSuffix>Wh</span>
                </mat-form-field>
              </div>
            </form>
          </div>
        </mat-step>

        <!-- Step 2: Identifiers -->
        <mat-step [stepControl]="step2Form" completed="isStepCompleted(2)">
          <mat-label>
            <mat-icon class="step-icon">qr_code</mat-icon>
            Identifiers
          </mat-label>
          <div class="step-content">
            <form [formGroup]="step2Form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>GTIN (Global Trade Item Number)</mat-label>
                <input matInput formControlName="gtin" placeholder="00123456789012">
                <mat-icon matSuffix>barcode</mat-icon>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Serial Number</mat-label>
                <input matInput formControlName="serialNumber" placeholder="BAT-2024-00123">
                <mat-icon matSuffix>confirmation_number</mat-icon>
              </mat-form-field>
              
              <div class="info-box">
                <mat-icon>info</mat-icon>
                <p>GS1 Digital Link will be generated automatically: <code>https://dpp.himsols.online/id/{GTIN}/{Serial}</code></p>
              </div>
            </form>
          </div>
        </mat-step>

        <!-- Step 3: Compliance Data -->
        <mat-step [stepControl]="step3Form" completed="isStepCompleted(3)">
          <mat-label>
            <mat-icon class="step-icon">description</mat-icon>
            Compliance & Documentation
          </mat-label>
          <div class="step-content">
            <form [formGroup]="step3Form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Manufacturer Name</mat-label>
                <input matInput formControlName="manufacturerName">
                <mat-icon matSuffix>business</mat-icon>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Plant Location</mat-label>
                <input matInput formControlName="manufacturerLocation" placeholder="City, Country">
                <mat-icon matSuffix>location_on</mat-icon>
              </mat-form-field>
              
              <div class="section-title">
                <mat-icon>check_circle</mat-icon>
                <span>Required EU Documents</span>
              </div>
              
              <div class="checkbox-group">
                <mat-checkbox formControlName="declarations">EU Declarations of Conformity</mat-checkbox>
                <mat-checkbox formControlName="safety">Safety Certificates</mat-checkbox>
                <mat-checkbox formControlName="environmental">Environmental Compliance</mat-checkbox>
              </div>
            </form>
          </div>
        </mat-step>

        <!-- Step 4: Sustainability Information -->
        <mat-step [stepControl]="step4Form" completed="isStepCompleted(4)">
          <mat-label>
            <mat-icon class="step-icon">eco</mat-icon>
            Sustainability Data
          </mat-label>
          <div class="step-content">
            <form [formGroup]="step4Form">
              <div class="field-row">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Recycling Instructions</mat-label>
                  <input matInput formControlName="recyclingInfo">
                </mat-form-field>
              </div>
              
              <div class="field-row">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Lifetime (years)</mat-label>
                  <input matInput type="number" formControlName="lifetimeYears">
                  <span matSuffix>years</span>
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Cycle Life</mat-label>
                  <input matInput type="number" formControlName="cycleLife">
                  <span matSuffix>cycles</span>
                </mat-form-field>
              </div>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Carbon Footprint (kg CO2e)</mat-label>
                <input matInput type="number" formControlName="carbonFootprint">
                <span matSuffix>kg CO2e</span>
              </mat-form-field>
            </form>
          </div>
        </mat-step>

        <!-- Step 5: Review & Publish -->
        <mat-step [completed]="isStepCompleted(5)">
          <mat-label>
            <mat-icon class="step-icon">review</mat-icon>
            Review & Publish
          </mat-label>
          <div class="step-content">
            <div class="review-card">
              <h3>DPP Summary</h3>
              <p class="status-badge" [class]="'status-badge--draft'">Draft Status</p>
              
              <div class="review-grid">
                <div class="review-item">
                  <span class="label">Product:</span>
                  <span class="value">{{ step1Form.get('name')?.value }}</span>
                </div>
                <div class="review-item">
                  <span class="label">Category:</span>
                  <span class="value">{{ step1Form.get('batteryCategory')?.value }}</span>
                </div>
                <div class="review-item">
                  <span class="label">GTIN:</span>
                  <span class="value">{{ step2Form.get('gtin')?.value }}</span>
                </div>
                <div class="review-item">
                  <span class="label">Manufacturer:</span>
                  <span class="value">{{ step3Form.get('manufacturerName')?.value }}</span>
                </div>
              </div>
              
              <div class="qr-preview">
                <img [src]="qrCodeDataUrl" alt="QR Code" *ngIf="qrCodeDataUrl; else placeholder">
                <ng-template #placeholder>
                  <div class="qr-placeholder">
                    <mat-icon>qr_code</mat-icon>
                    <p>QR Code will be generated on publish</p>
                  </div>
                </ng-template>
              </div>
            </div>
            
            <div class="actions">
              <button mat-button (click)="previousStep()">
                <mat-icon>arrow_back</mat-icon>
                Back
              </button>
              <button mat-flat-button color="primary" (click)="publishDpp()">
                <mat-icon>publish</mat-icon>
                Publish DPP
              </button>
            </div>
          </div>
        </mat-step>

      </mat-horizontal-stepper>
    </div>
  `,
  styleUrls: ['./dpp-wizard.component.scss']
})
export class DppWizardComponent implements OnInit {
  // Forms for each step
  step1Form = new FormGroup({
    name: new FormControl('', Validators.required),
    brand: new FormControl('', Validators.required),
    batteryCategory: new FormControl('', Validators.required),
    chemistry: new FormControl('', Validators.required),
    massKg: new FormControl('', [Validators.required, Validators.min(0)]),
    energyWh: new FormControl('', [Validators.required, Validators.min(0)])
  });

  step2Form = new FormGroup({
    gtin: new FormControl(''),
    serialNumber: new FormControl('', Validators.required)
  });

  step3Form = new FormGroup({
    manufacturerName: new FormControl(''),
    manufacturerLocation: new FormControl(''),
    declarations: new FormControl(false),
    safety: new FormControl(false),
    environmental: new FormControl(false)
  });

  step4Form = new FormGroup({
    recyclingInfo: new FormControl(''),
    lifetimeYears: new FormControl(''),
    cycleLife: new FormControl(''),
    carbonFootprint: new FormControl('')
  });

  // Stepper state
  isLinear = true;
  currentStep = 0;
  qrCodeDataUrl = '';

  get completionPercentage(): number {
    const steps = [this.step1Form, this.step2Form, this.step3Form, this.step4Form];
    const completed = steps.filter(f => f.valid).length;
    return Math.round((completed / steps.length) * 100);
  }

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Check if editing existing product/DPP
    this.currentStep = 0;
  }

  onStepChange(event: any): void {
    this.currentStep = event.selectedIndex;
  }

  isStepCompleted(step: number): boolean {
    const forms = [this.step1Form, this.step2Form, this.step3Form, this.step4Form];
    return forms[step - 1]?.valid ?? false;
  }

  onNext(): void {
    if (this.currentStep < 4) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  publishDpp(): void {
    // Generate DPP data
    const dppData: CreateDppDto = {
      productId: 'temp-id', // Will be set by backend
      publicData: {
        name: this.step1Form.get('name')?.value,
        brand: this.step1Form.get('brand')?.value,
        productIdentifier: `https://dpp.himsols.online/id/${this.step2Form.get('gtin')?.value}/${this.step2Form.get('serialNumber')?.value}`,
        batteryCategory: this.step1Form.get('batteryCategory')?.value,
        chemistry: this.step1Form.get('chemistry')?.value,
        mass: this.step1Form.get('massKg')?.value,
        energyCapacity: this.step1Form.get('energyWh')?.value,
        recycleInstructions: this.step4Form.get('recyclingInfo')?.value
      },
      professionalData: {
        lifetimeYears: this.step4Form.get('lifetimeYears')?.value,
        cycleLife: this.step4Form.get('cycleLife')?.value,
        nominalVoltage: 3.7,
        maxVoltage: 4.2
      },
      authorityData: {
        manufacturer: this.step3Form.get('manufacturerName')?.value,
        location: this.step3Form.get('manufacturerLocation')?.value
      },
      accessLevel: 'public'
    };

    console.log('Publishing DPP:', dppData);
    // TODO: Call DPP service to save
  }

  onNextStep(): void {
    const form = [this.step1Form, this.step2Form, this.step3Form, this.step4Form][this.currentStep];
    if (form?.valid) {
      if (this.currentStep < 4) {
        this.onNext();
      }
    } else {
      form?.markAllAsTouched();
    }
  }
}