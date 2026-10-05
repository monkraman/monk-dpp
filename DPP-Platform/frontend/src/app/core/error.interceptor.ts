import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from './services/toast.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private toastService: ToastService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Skip handling for login endpoint since login component shows its own custom message
        const isLoginRequest = request.url.includes('/auth/login');

        if (!isLoginRequest) {
          let errorMessage = 'An unexpected error occurred.';

          if (error.error) {
            if (Array.isArray(error.error.message)) {
              errorMessage = error.error.message.join(', ');
            } else if (typeof error.error.message === 'string') {
              errorMessage = error.error.message;
            } else if (typeof error.error === 'string') {
              errorMessage = error.error;
            }
          } else if (error.message) {
            errorMessage = error.message;
          }

          if (error.status === 403) {
            this.toastService.show(
              errorMessage || 'Permission Denied: You do not have permission for this action.',
              'error',
              4500
            );
          } else if (error.status === 401) {
            // Only show if not a public endpoint
            if (!request.url.includes('/public/')) {
              this.toastService.show('Session expired or unauthorized. Please re-login.', 'warning', 3500);
            }
          } else if (error.status === 404) {
            this.toastService.show(errorMessage || 'Requested resource not found.', 'error', 3500);
          } else if (error.status === 400) {
            this.toastService.show(errorMessage || 'Invalid request. Please check input fields.', 'error', 4000);
          } else if (error.status === 409) {
            this.toastService.show(errorMessage || 'Conflict detected. Record already exists.', 'warning', 4000);
          } else if (error.status >= 500) {
            this.toastService.show(errorMessage || 'Internal server error. Please try again.', 'error', 4500);
          } else if (error.status === 0) {
            this.toastService.show('Unable to connect to server. Please check backend connection.', 'error', 4500);
          } else {
            this.toastService.show(errorMessage, 'error', 4000);
          }
        }

        return throwError(() => error);
      })
    );
  }
}
