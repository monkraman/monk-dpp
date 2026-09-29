import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { ToastService } from '../../../core/services/toast.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (password && confirmPassword && password !== confirmPassword) {
    control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  currentStep = 1;
  orgForm!: FormGroup;
  userForm!: FormGroup;

  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;

  industries = [
    'Automotive & EV Batteries',
    'Industrial Batteries & ESS',
    'Light Means of Transport (LMT)',
    'Consumer Electronics',
    'Renewable Energy',
    'Manufacturing & Raw Materials',
    'Other',
  ];

  countries = [
    { code: 'DE', name: 'Germany (EU)' },
    { code: 'FR', name: 'France (EU)' },
    { code: 'NL', name: 'Netherlands (EU)' },
    { code: 'SE', name: 'Sweden (EU)' },
    { code: 'BE', name: 'Belgium (EU)' },
    { code: 'IT', name: 'Italy (EU)' },
    { code: 'ES', name: 'Spain (EU)' },
    { code: 'US', name: 'United States' },
    { code: 'IN', name: 'India' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'JP', name: 'Japan' },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Step 1: Organization details
    this.orgForm = this.fb.group({
      organizationName: ['', [Validators.required, Validators.minLength(2)]],
      industry: ['Automotive & EV Batteries', [Validators.required]],
      country: ['DE', [Validators.required]],
    });

    // Step 2: User details
    this.userForm = this.fb.group(
      {
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        phone: [''],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: passwordMatchValidator }
    );
  }

  get orgF() {
    return this.orgForm.controls;
  }

  get userF() {
    return this.userForm.controls;
  }

  goToStep(step: number): void {
    if (step === 2) {
      if (this.orgForm.invalid) {
        this.orgForm.markAllAsTouched();
        return;
      }
    }
    this.currentStep = step;
  }

  togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPassword(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  onSubmit(): void {
    if (this.orgForm.invalid) {
      this.currentStep = 1;
      this.orgForm.markAllAsTouched();
      return;
    }

    if (this.userForm.invalid || this.isLoading) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const payload = {
      organizationName: this.orgForm.value.organizationName,
      industry: this.orgForm.value.industry,
      country: this.orgForm.value.country,
      firstName: this.userForm.value.firstName,
      lastName: this.userForm.value.lastName,
      email: this.userForm.value.email,
      phone: this.userForm.value.phone || undefined,
      password: this.userForm.value.password,
    };

    this.authService.register(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.toastService.show(
          'Organization & Admin account registered successfully!',
          'success',
          4000
        );
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        const errorMsg =
          err?.error?.message ||
          (err.status === 409
            ? 'An account with this email address already exists.'
            : 'Registration failed. Please check your details and try again.');
        this.toastService.show(errorMsg, 'error', 5000);
      },
    });
  }
}
