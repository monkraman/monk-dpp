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
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module').then((m) => m.DashboardModule),
    canActivate: [AuthGuard],
  },
  // Clean routes matching screenshot navigation
  { path: 'product-passports', redirectTo: 'dashboard' },
  {
    path: 'access-control',
    loadChildren: () => import('./features/access-control/access-control.module').then((m) => m.AccessControlModule),
    canActivate: [AuthGuard],
  },
  { path: 'product-library', redirectTo: 'dashboard' },
  { path: 'notifications', redirectTo: 'dashboard' },
  { path: 'settings', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
