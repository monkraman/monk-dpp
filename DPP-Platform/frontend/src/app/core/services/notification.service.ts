import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  /**
   * Show success message
   */
  success(message: string, duration = 3000): void {
    this.show(message, 'Success', 'checkmark', 'dismiss', duration, 'success');
  }

  /**
   * Show error message
   */
  error(message: string, duration = 5000): void {
    this.show(message, 'Error', 'error', 'dismiss', duration, 'error');
  }

  /**
   * Show warning message
   */
  warning(message: string, duration = 4000): void {
    this.show(message, 'Warning', 'warning', 'dismiss', duration, 'warning');
  }

  /**
   * Show info message
   */
  info(message: string, duration = 3000): void {
    this.show(message, 'Info', 'info', 'dismiss', duration, 'info');
  }

  /**
   * Show custom snackbar
   */
  show(
    message: string,
    summary: string,
    icon: string,
    action: string,
    duration: number,
    panelClass: string,
  ): void {
    const config: MatSnackBarConfig = {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: `snackbar-${panelClass}`,
    };

    this.snackBar.open(message, action, config);
  }

  /**
   * Show confirmation dialog
   */
  confirm(
    message: string,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const snackbarRef = this.snackBar.open(message, `${cancelText} ${confirmText}`, {
        duration: 60000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });

      snackbarRef.onAction().subscribe(() => {
        resolve(true);
      });

      snackbarRef.afterDismissed().subscribe(() => {
        resolve(false);
      });
    });
  }
}
