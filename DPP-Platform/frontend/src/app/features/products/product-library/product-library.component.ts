/**
 * Product Library Screen
 * Lists all products with filters, search, and actions
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Product, PaginatedResponse } from '../../models/dpp.models';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-product-library',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatSortModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="product-library">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">Products</h1>
        <p class="page-subtitle">Manage product master records for DPP creation</p>
        
        <div class="actions">
          <button mat-icon-button [matMenuTriggerFor]="filterMenu" aria-label="Filter">
            <mat-icon>filter_list</mat-icon>
          </button>
          
          <input 
            matInput 
            placeholder="Search products..."
            [(ngModel)]="searchQuery"
            (keyup.enter)="loadProducts()"
            class="search-input"
          />
          
          <button mat-icon-button (click)="loadProducts()" [disabled]="loading">
            <mat-icon>search</mat-icon>
          </button>
          
          <button mat-flat-button color="primary" routerLink="/products/new">
            <mat-icon>add</mat-icon>
            Add Product
          </button>
        </div>
      </div>

      <!-- Filter Menu -->
      <mat-menu #filterMenu="matMenu">
        <div mat-menu-content>
          <mat-menu-item *ngFor="let filter of filters" (click)="applyFilter(filter)">
            <mat-icon>{{ filter.icon }}</mat-icon>
            <span>{{ filter.label }}</span>
            <mat-badge 
              *ngIf="activeFilters[filter.key]" 
              [value]="activeFilters[filter.key].length" 
              color="primary"
            ></mat-badge>
          </mat-menu-item>
        </div>
      </mat-menu>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && products.length === 0" class="empty-state">
        <mat-icon>inventory</mat-icon>
        <h3>No products found</h3>
        <p>Start by adding your first product</p>
        <button mat-flat-button color="primary" routerLink="/products/new">
          Add Product
        </button>
      </div>

      <!-- Products Table -->
      <div *ngIf="!loading && products.length > 0" class="table-container">
        <table mat-table [dataSource]="products" matSort (matSortChange)="sortData($event)">

          <!-- Product Identifier -->
          <ng-container matColumnDef="productIdentifier">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Product ID</th>
            <td mat-cell *matCellDef="let product">
              <div class="product-id">
                <code>{{ product.productIdentifier }}</code>
              </div>
            </td>
          </ng-container>

          <!-- Name Columns -->
          <ng-container matColumnDef="brandName">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Brand</th>
            <td mat-cell *matCellDef="let product">{{ product.brandName }}</td>
          </ng-container>

          <ng-container matColumnDef="modelName">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Model</th>
            <td mat-cell *matCellDef="let product">{{ product.modelName }}</td>
          </ng-container>

          <!-- Category -->
          <ng-container matColumnDef="batteryCategory">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Category</th>
            <td mat-cell *matCellDef="let product">
              <span class="chip chip--{{ product.batteryCategory?.toLowerCase() }}">
                {{ product.batteryCategory }}
              </span>
            </td>
          </ng-container>

          <!-- Specifications -->
          <ng-container matColumnDef="massKg">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Mass (kg)</th>
            <td mat-cell *matCellDef="let product">{{ product.massKg }}</td>
          </ng-container>

          <ng-container matColumnDef="energyCapacityWh">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Energy (Wh)</th>
            <td mat-cell *matCellDef="let product">{{ product.energyCapacityWh }}</td>
          </ng-container>

          <!-- Chemistry -->
          <ng-container matColumnDef="chemistry">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Chemistry</th>
            <td mat-cell *matCellDef="let product">{{ product.chemistry }}</td>
          </ng-container>

          <!-- Status -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
            <td mat-cell *matCellDef="let product">
              <app-status-badge [status]="product.status"></app-status-badge>
            </td>
          </ng-container>

          <!-- Actions -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let product">
              <button mat-icon-button (click)="viewProduct(product)">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button [matMenuTriggerFor]="productMenu" (click)="currentProduct = product">
                <mat-icon>more_horiz</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>

        <!-- Pagination -->
        <div class="pagination">
          <button mat-mini-button [disabled]="page === 1" (click)="previousPage()">
            <mat-icon>chevron_left</mat-icon>
          </button>
          <span class="page-info">Page {{ page }} of {{ totalPages }}</span>
          <button mat-mini-button [disabled]="page === totalPages" (click)="nextPage()">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>
      </div>

      <!-- Product Actions Menu -->
      <mat-menu #productMenu="matMenu">
        <button mat-menu-item (click)="createDpp(currentProduct)">
          <mat-icon>description</mat-icon>
          <span>Create DPP</span>
        </button>
        <button mat-menu-item (click)="viewDpp(currentProduct)">
          <mat-icon>link</mat-icon>
          <span>View Passport</span>
        </button>
        <button mat-menu-item (click)="editProduct(currentProduct)">
          <mat-icon>edit</mat-icon>
          <span>Edit Product</span>
        </button>
      </mat-menu>
    </div>
  `,
  styleUrls: ['./product-library.component.scss']
})
export class ProductLibraryComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  page = 1;
  limit = 20;
  totalPages = 1;
  searchQuery = '';
  selectedCategory: string | null = null;
  
  activeFilters: Record<string, any[]> = {};
  currentProduct: Product | null = null;

  displayedColumns: string[] = [
    'productIdentifier', 'brandName', 'modelName', 
    'batteryCategory', 'massKg', 'energyCapacityWh', 
    'chemistry', 'status', 'actions'
  ];

  filters = [
    { key: 'batteryCategory', label: 'Battery Category', icon: 'battery_std' },
    { key: 'chemistry', label: 'Chemistry', icon: 'science' },
    { key: 'status', label: 'Status', icon: 'status' }
  ];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    const params: any = {
      page: this.page,
      limit: this.limit
    };
    
    if (this.searchQuery) {
      params.search = this.searchQuery;
    }
    
    this.productService.getProducts(this.orgId, params).subscribe({
      next: (response: PaginatedResponse<Product>) => {
        this.products = response.data;
        this.totalPages = Math.ceil(response.meta.total / this.limit);
      },
      error: (error) => console.error('Error loading products:', error),
      complete: () => this.loading = false
    });
  }

  applyFilter(filter: { key: string; label: string; icon: string }): void {
    // Implement filter logic
  }

  sortData(event: any): void {
    // Implement sorting
  }

  viewProduct(product: Product): void {
    // Navigate to product detail
  }

  editProduct(product: Product | null): void {
    if (product) {
      // Navigate to edit
    }
  }

  createDpp(product: Product | null): void {
    if (product) {
      // Navigate to DPP creation with product pre-selected
    }
  }

  viewDpp(product: Product | null): void {
    if (product) {
      // Navigate to DPP view
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadProducts();
    }
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadProducts();
    }
  }

  get orgId(): string {
    return localStorage.getItem('currentOrg') || 'default';
  }
}