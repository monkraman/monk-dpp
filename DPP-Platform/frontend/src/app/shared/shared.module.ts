import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Shared reusable UI components
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { StatCardComponent } from './components/stat-card/stat-card.component';
import { StatusBadgeComponent } from './components/status-badge/status-badge.component';
import { FilterTabsComponent } from './components/filter-tabs/filter-tabs.component';
import { SearchInputComponent } from './components/search-input/search-input.component';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { PrimaryButtonComponent } from './components/primary-button/primary-button.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';

const SHARED_COMPONENTS = [
  LoadingSpinnerComponent,
  StatCardComponent,
  StatusBadgeComponent,
  FilterTabsComponent,
  SearchInputComponent,
  ProgressBarComponent,
  PageHeaderComponent,
  EmptyStateComponent,
  PrimaryButtonComponent,
  FileUploadComponent,
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ...SHARED_COMPONENTS,
  ],
  exports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ...SHARED_COMPONENTS,
  ],
})
export class SharedModule {}
