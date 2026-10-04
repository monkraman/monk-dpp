import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadChildren: () => import('./features/auth/login/login.module').then((m) => m.LoginModule),
  },
  {
    path: 'register',
    loadChildren: () => import('./features/auth/register/register.module').then((m) => m.RegisterModule),
  },
  // Operations Hub / Dashboard
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module').then((m) => m.DashboardModule),
    canActivate: [AuthGuard],
  },
  { path: 'product-passports', redirectTo: 'dashboard' },

  // 1. Company Management (To & From Companies, Supply Chain Directory)
  {
    path: 'company-management',
    loadChildren: () => import('./features/company-management/company-management.module').then((m) => m.CompanyManagementModule),
    canActivate: [AuthGuard],
  },
  { path: 'companies', redirectTo: 'company-management' },

  // 2. Product Management (Master Catalog with photos, specs, and materials)
  {
    path: 'product-management',
    loadChildren: () => import('./features/product-management/product-management.module').then((m) => m.ProductManagementModule),
    canActivate: [AuthGuard],
  },
  { path: 'product-library', redirectTo: 'product-management' },
  { path: 'products', redirectTo: 'product-management' },

  // 3. User Management (Team Members & RBAC)
  {
    path: 'user-management',
    loadChildren: () => import('./features/access-control/access-control.module').then((m) => m.AccessControlModule),
    canActivate: [AuthGuard],
  },
  { path: 'access-control', redirectTo: 'user-management' },
  { path: 'users', redirectTo: 'user-management' },

  { path: 'notifications', redirectTo: 'dashboard' },
  { path: 'settings', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
