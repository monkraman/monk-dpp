import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { AuthService, User } from './core/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isAuthLayout = true;
  isCollapsed = false;
  isDark = true;
  isProfileOpen = false;
  currentUser: User | null = null;

  constructor(
    private router: Router,
    private titleService: Title,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Monk Spaces - DPP Platform');

    // Default theme apply (Dark mode default as requested)
    const savedTheme = localStorage.getItem('app_theme') || 'dark';
    this.isDark = savedTheme === 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    this.currentUser = this.authService.getCurrentUser();
    this.checkLayout(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.checkLayout(event.urlAfterRedirects || event.url);
        this.currentUser = this.authService.getCurrentUser();
        this.isProfileOpen = false;
      });
  }

  private checkLayout(url: string): void {
    const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    this.isAuthLayout = authRoutes.some(r => url.startsWith(r));
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleTheme(): void {
    this.isDark = !this.isDark;
    const theme = this.isDark ? 'dark' : 'light';
    localStorage.setItem('app_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  toggleProfileMenu(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.isProfileOpen = !this.isProfileOpen;
  }

  closeProfileMenu(): void {
    this.isProfileOpen = false;
  }

  getUserInitials(): string {
    if (!this.currentUser) return 'RT';
    const first = this.currentUser.firstName?.charAt(0) || '';
    const last = this.currentUser.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || this.currentUser.email?.charAt(0).toUpperCase() || 'U';
  }

  getUserDisplayName(): string {
    if (!this.currentUser) return 'Raman Thakur';
    if (this.currentUser.firstName) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName || ''}`.trim();
    }
    return this.currentUser.email.split('@')[0];
  }

  getPageTitle(): string {
    const url = this.router.url;
    if (url.includes('/dashboard')) return 'Operations Hub';
    if (url.includes('/product-passports') || url.includes('/dpps')) return 'Digital Passports';
    if (url.includes('/company-management')) return 'Company Management';
    if (url.includes('/product-management')) return 'Product Management';
    if (url.includes('/user-management') || url.includes('/access-control')) return 'Manage Users';
    return 'Dashboard';
  }

  logout(): void {
    this.authService.logout();
  }
}
