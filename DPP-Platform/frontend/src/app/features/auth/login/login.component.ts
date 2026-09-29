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
    const { email } = this.loginForm.value;

    // Simulate / execute authentication
    setTimeout(() => {
      this.isLoading = false;
      this.authService.setTokens('mock-access-token-monk', 'mock-refresh-token-monk');
      this.authService.setCurrentUser({
        id: 'usr-raman-001',
        email: email || 'raman@monkspaces.com',
        firstName: 'Raman',
        lastName: 'Thakur',
        role: 'admin',
        organization: {
          id: 'org-monkspaces',
          name: 'Monk Spaces',
          slug: 'monk-spaces',
        },
        createdAt: new Date().toISOString(),
      });

      this.toastService.show('Welcome back, Raman Thakur', 'success', 2500);
      this.router.navigate(['/dashboard']);
    }, 400);
  }

  onSocialLogin(provider: string): void {
    this.toastService.show(`Connecting to ${provider} Single Sign-On...`, 'info', 2000);
    setTimeout(() => {
      this.onSubmit();
    }, 500);
  }
}
