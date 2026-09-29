import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private loading = false;
  private loadingCount = 0;

  /**
   * Show loader
   */
  show(): void {
    this.loadingCount++;
    this.loading = true;
  }

  /**
   * Hide loader
   */
  hide(): void {
    this.loadingCount = Math.max(0, this.loadingCount - 1);
    if (this.loadingCount === 0) {
      this.loading = false;
    }
  }

  /**
   * Check if loading
   */
  isLoading(): boolean {
    return this.loading;
  }
}
