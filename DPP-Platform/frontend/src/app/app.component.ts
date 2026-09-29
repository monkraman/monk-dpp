import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { AuthService, User } from './core/auth.service';

@Component({
  selector: 'app-root',
  template: `
    <!-- Global Toast Notifications -->
    <app-toast></app-toast>

    <!-- Public / Auth Flow Layout (Login) -->
    <ng-container *ngIf="isAuthLayout">
      <router-outlet></router-outlet>
    </ng-container>

    <!-- Authenticated App Shell Layout (Dashboard) matching screenshot -->
    <div *ngIf="!isAuthLayout" class="app-layout">
      <!-- Left Sidebar -->
      <aside class="sidebar" [class.collapsed]="isCollapsed">
        <div class="sidebar-top">
          <div class="brand-container">
            <app-monk-logo [size]="15"></app-monk-logo>
          </div>

          <nav class="nav-menu">
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <mat-icon class="nav-icon">home</mat-icon>
              <span class="nav-text">Dashboard</span>
            </a>

            <a routerLink="/product-passports" routerLinkActive="active" class="nav-item">
              <mat-icon class="nav-icon">layers</mat-icon>
              <span class="nav-text">Product Passports</span>
            </a>

            <a routerLink="/access-control" routerLinkActive="active" class="nav-item">
              <mat-icon class="nav-icon">verified_user</mat-icon>
              <span class="nav-text">Access Control</span>
            </a>

            <a routerLink="/product-library" routerLinkActive="active" class="nav-item">
              <mat-icon class="nav-icon">widgets</mat-icon>
              <span class="nav-text">Product Library</span>
            </a>
          </nav>
        </div>

        <!-- Collapse Toggle -->
        <button class="collapse-toggle-btn" (click)="toggleCollapse()" title="Toggle Sidebar">
          <mat-icon>{{ isCollapsed ? 'chevron_right' : 'chevron_left' }}</mat-icon>
        </button>

        <!-- Sidebar Bottom Actions & Profile -->
        <div class="sidebar-bottom">
          <nav class="nav-menu bottom-menu">
            <a routerLink="/notifications" routerLinkActive="active" class="nav-item">
              <mat-icon class="nav-icon">notifications_none</mat-icon>
              <span class="nav-text">Notifications</span>
            </a>

            <a routerLink="/settings" routerLinkActive="active" class="nav-item">
              <mat-icon class="nav-icon">settings</mat-icon>
              <span class="nav-text">Settings</span>
            </a>
          </nav>

          <div class="user-profile-row">
            <div class="user-avatar">
              <mat-icon>person</mat-icon>
            </div>
            <div class="user-info">
              <span class="user-name">{{ currentUser?.firstName || 'Raman' }} {{ currentUser?.lastName || 'Thakur' }}</span>
              <span class="user-email" title="{{ currentUser?.email || 'raman@monkspaces.com' }}">
                {{ currentUser?.email || 'raman@monkspace...' }}
              </span>
            </div>
            <button class="logout-btn" (click)="logout()" title="Log out">
              <mat-icon>logout</mat-icon>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Workspace Content Area -->
      <main class="main-viewport">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background-color: #ffffff;
      font-family: var(--font-family);
    }

    .sidebar {
      width: 230px;
      min-width: 230px;
      background-color: #ffffff;
      border-right: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      transition: width 0.2s ease, min-width 0.2s ease;
      z-index: 10;

      &.collapsed {
        width: 72px;
        min-width: 72px;

        .nav-text,
        .user-info,
        app-monk-logo ::ng-deep .logo-text {
          display: none;
        }

        .brand-container {
          padding: 24px 16px;
        }

        .nav-item {
          justify-content: center;
          padding: 10px 0;
        }

        .user-profile-row {
          justify-content: center;
          padding: 12px 8px;
        }
      }
    }

    .sidebar-top {
      display: flex;
      flex-direction: column;
    }

    .brand-container {
      padding: 24px 20px 20px;
    }

    .nav-menu {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 8px 12px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 9px 12px;
      border-radius: 6px;
      color: #4b5563;
      text-decoration: none;
      font-size: 13.5px;
      font-weight: 500;
      transition: all 0.15s ease;

      .nav-icon {
        font-size: 19px;
        width: 19px;
        height: 19px;
        color: #6b7280;
      }

      &:hover {
        background-color: #f9fafb;
        color: #111827;

        .nav-icon {
          color: #111827;
        }
      }

      &.active {
        background-color: var(--bg-active-nav, #eef4fa);
        color: var(--brand-primary, #3b5778);
        font-weight: 600;

        .nav-icon {
          color: var(--brand-primary, #3b5778);
        }
      }
    }

    .collapse-toggle-btn {
      position: absolute;
      top: 50%;
      right: -12px;
      transform: translateY(-50%);
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 20;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: #6b7280;
      }

      &:hover {
        background: #f9fafb;
        color: #111827;
      }
    }

    .sidebar-bottom {
      border-top: 1px solid #f3f4f6;
      padding-top: 8px;
    }

    .bottom-menu {
      padding-bottom: 4px;
    }

    .user-profile-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px 16px;
      border-top: 1px solid #f3f4f6;

      .user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: #e5e7eb;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6b7280;
        flex-shrink: 0;

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }

      .user-info {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        flex: 1;

        .user-name {
          font-size: 13px;
          font-weight: 600;
          color: #111827;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-email {
          font-size: 11px;
          color: #6b7280;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .logout-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: #9ca3af;
        display: flex;
        align-items: center;
        padding: 4px;
        border-radius: 4px;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }

        &:hover {
          color: #ef4444;
          background-color: #fef2f2;
        }
      }
    }

    .main-viewport {
      flex: 1;
      height: 100vh;
      overflow-y: auto;
      background-color: #ffffff;
      padding: 24px 32px 40px;
    }
  `],
})
export class AppComponent implements OnInit {
  isAuthLayout = true;
  isCollapsed = false;
  currentUser: User | null = null;

  constructor(
    private router: Router,
    private titleService: Title,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Monk Spaces - DPP Platform');
    this.currentUser = this.authService.getCurrentUser();

    this.checkLayout(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.checkLayout(event.urlAfterRedirects || event.url);
        this.currentUser = this.authService.getCurrentUser();
      });
  }

  private checkLayout(url: string): void {
    const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    this.isAuthLayout = authRoutes.some(r => url.startsWith(r)) || url === '/';
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    this.authService.logout();
  }
}
