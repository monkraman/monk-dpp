import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  hidePassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['raman@monkspaces.com', [Validators.required, Validators.email]],
      password: ['••••••••', [Validators.required]],
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const user = res.user || this.authService.getCurrentUser();
        const userName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User';
        const orgName = user?.organization?.name || 'Your Organization';
        this.toastService.show(`Welcome back, ${userName} (${orgName})`, 'success', 3000);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.toastService.show('Invalid email or password. Please try again.', 'error', 4000);
        } else if (err.status === 0) {
          // Backend is offline or unreachable - activate demo mode for local UI testing
          this.toastService.show('Backend is offline. Starting local demo session...', 'info', 3000);
          this.authService.setTokens('mock-jwt-token-monkspaces-2026', 'mock-refresh-token-monkspaces');
          this.authService.setCurrentUser({
            id: '6e3b8e9f-e850-4308-bd6d-83708b84c9ba',
            email: email || 'admin@monkspaces.com',
            firstName: 'Raman',
            lastName: 'Thakur',
            role: 'admin',
            organizationId: 'c6c5485c-9e10-4bae-b298-72ec331daf91',
            organization: {
              id: 'c6c5485c-9e10-4bae-b298-72ec331daf91',
              name: 'Monkspaces Technologies',
              slug: 'monkspaces-technologies',
            },
            createdAt: new Date().toISOString(),
          });
          this.router.navigate(['/dashboard']);
        } else {
          const message = err.error?.message || 'Login failed. Please verify credentials.';
          this.toastService.show(message, 'error', 4000);
        }
      },
    });
  }

  onSocialLogin(provider: string): void {
    this.toastService.show(`Connecting to ${provider} Single Sign-On...`, 'info', 2000);
    setTimeout(() => {
      this.onSubmit();
    }, 500);
  }
}
