import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Core
import { CoreModule } from './core/core.module';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

// Shared
import { SharedModule } from './shared/shared.module';

// Material
import { MaterialModule } from './shared/material.module';
import { ToastComponent } from './shared/components/toast/toast.component';
import { MonkLogoComponent } from './shared/components/monk-logo/monk-logo.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
    ToastComponent,
    MonkLogoComponent,
  ],
  providers: [AuthGuard, RoleGuard],
  bootstrap: [AppComponent],
})
export class AppModule {}
