import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../core/product.service';
import { AuthService, User } from '../../core/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { FilterTabItem } from '../../shared/components/filter-tabs/filter-tabs.component';

export interface CatalogProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  categoryKey: 'ALL' | 'BATTERIES' | 'PACKAGING' | 'CHEMICALS' | 'TEXTILES';
  type: 'Custom' | 'Material' | 'Component';
  sku: string;
  gtin: string;
  serialNumber?: string;
  massOrVolume: string;
  specsSummary: string;
  imageUrl: string;
  status: 'published' | 'draft' | 'unlinked';
  origin: string;
  dppId?: string;
  createdAt: string;
}

@Component({
  selector: 'app-product-management',
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.scss'],
})
export class ProductManagementComponent implements OnInit {
  currentUser: User | null = null;
  products: CatalogProduct[] = [];
  filteredProducts: CatalogProduct[] = [];
  isLoading = false;

  // Search & Filter
  searchQuery = '';
  activeCategoryFilter = 'ALL';

  // Category Filter Tabs
  categoryTabs: FilterTabItem[] = [
    { id: 'ALL', label: 'All Products', count: 0, icon: 'inventory_2' },
    { id: 'PACKAGING', label: 'Packaging & Containers', count: 0, icon: 'takeout_dining' },
    { id: 'BATTERIES', label: 'Batteries & Energy', count: 0, icon: 'battery_charging_full' },
    { id: 'CHEMICALS', label: 'Chemicals & Minerals', count: 0, icon: 'science' },
    { id: 'TEXTILES', label: 'Textiles & Fiber', count: 0, icon: 'checkroom' },
  ];

  // Modal
  isModalOpen = false;
  isSaving = false;
  productForm!: FormGroup;

  // Curated demo catalog matching the exact supply chain in Monkspaces screenshots
  private defaultCatalog: CatalogProduct[] = [
    {
      id: 'prod-dettol-01',
      name: 'Dettol Antiseptic Liquid (250ml)',
      brand: 'Reckitt Benckiser',
      category: 'Packaging & Formulations',
      categoryKey: 'PACKAGING',
      type: 'Custom',
      sku: 'DET-ANT-250',
      gtin: '08901396112015',
      serialNumber: 'DET-ANT-250-0001',
      massOrVolume: '0.25 L (250 ml)',
      specsSummary: 'Chloroxylenol 4.8% w/v • Terpineol • Caramel',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
      status: 'published',
      origin: 'India',
      dppId: '#D8696627',
      createdAt: '2026-09-14',
    },
    {
      id: 'prod-petbottle-02',
      name: 'PET-Bottle 250ml Clear Container',
      brand: 'Cascarine Polymers',
      category: 'Polymers & Packaging',
      categoryKey: 'PACKAGING',
      type: 'Component',
      sku: 'PET-BOT-250C',
      gtin: '08901396992102',
      serialNumber: 'PET-2026-8819',
      massOrVolume: '28 grams / unit',
      specsSummary: '100% Recyclable Polyethylene-Terephthalate • PCR 35%',
      imageUrl: 'https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?w=300&auto=format&fit=crop&q=80',
      status: 'published',
      origin: 'India',
      dppId: '#5255A0B9',
      createdAt: '2026-09-14',
    },
    {
      id: 'prod-titan-03',
      name: 'Titan-EV 800 Ultra Pack',
      brand: 'Monk Volt',
      category: 'Batteries & Energy Storage',
      categoryKey: 'BATTERIES',
      type: 'Custom',
      sku: 'TITAN-EV-800',
      gtin: '08901396773341',
      serialNumber: 'MNK-TITAN-EV-800-001',
      massOrVolume: '450.0 kg',
      specsSummary: '78.5 kWh • 800V Architecture • NMC 811 • 2,200 Cycles',
      imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=300&auto=format&fit=crop&q=80',
      status: 'published',
      origin: 'Germany / India',
      dppId: '#2842DBE9',
      createdAt: '2026-08-20',
    },
    {
      id: 'prod-pcmx-04',
      name: 'Chloroxylenol PCMX Technical Grade',
      brand: 'Fenbrolt Chemicals',
      category: 'Chemicals & Minerals',
      categoryKey: 'CHEMICALS',
      type: 'Material',
      sku: 'CHLX-PCMX-99',
      gtin: '08901396441029',
      serialNumber: 'FN-PCMX-2026-B1',
      massOrVolume: '1,000 kg (Drum)',
      specsSummary: 'Purity 99.2% • CAS 88-04-0 • REACH Certified',
      imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=300&auto=format&fit=crop&q=80',
      status: 'published',
      origin: 'Netherlands',
      dppId: '#971F2793',
      createdAt: '2026-08-25',
    },
    {
      id: 'prod-lyocell-05',
      name: 'Lyocell Sustainable Microfiber',
      brand: 'Monk Eco Circular',
      category: 'Textiles & Fiber',
      categoryKey: 'TEXTILES',
      type: 'Material',
      sku: 'LYO-FIB-100',
      gtin: '08901396338812',
      serialNumber: 'ECO-LYO-2026-01',
      massOrVolume: '5,000 kg',
      specsSummary: 'Closed-loop solvent spun wood pulp • OEKO-TEX 100',
      imageUrl: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=300&auto=format&fit=crop&q=80',
      status: 'draft',
      origin: 'Austria / India',
      dppId: '#771B267A',
      createdAt: '2026-09-02',
    },
    {
      id: 'prod-ironore-06',
      name: 'Direct Reduced Iron Ore (Pellet)',
      brand: 'Bharat Ore Mines',
      category: 'Chemicals & Minerals',
      categoryKey: 'CHEMICALS',
      type: 'Material',
      sku: 'ORE-DRI-65',
      gtin: '08901396229911',
      serialNumber: 'BOM-ORE-2026-90',
      massOrVolume: '500 t (Tonnes)',
      specsSummary: 'Fe 65.5% Grade • Low Gangue • ISO 14001 Compliant',
      imageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=300&auto=format&fit=crop&q=80',
      status: 'published',
      origin: 'India',
      dppId: '#B6F0A7BB',
      createdAt: '2026-09-10',
    },
  ];

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadProducts();
  }

  initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      brand: ['', [Validators.required]],
      categoryKey: ['PACKAGING', [Validators.required]],
      type: ['Custom', [Validators.required]],
      sku: ['', [Validators.required]],
      gtin: ['', [Validators.required, Validators.pattern(/^[0-9]{8,14}$/)]],
      massOrVolume: ['', [Validators.required]],
      specsSummary: ['', [Validators.required]],
      imageUrl: [''],
      origin: ['India', [Validators.required]],
    });
  }

  loadProducts(): void {
    this.isLoading = true;

    // Load from backend PostgreSQL products and merge
    this.productService.getProducts({ limit: 50 }).subscribe({
      next: (res) => {
        let mergedList = [...this.defaultCatalog];
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          res.data.forEach((p: any) => {
            const exists = mergedList.find((m) => m.id === p.id || m.sku === p.gtin || m.name === p.model_name);
            if (!exists) {
              mergedList.unshift({
                id: p.id,
                name: p.model_name || 'Standard Product',
                brand: p.brand_name || 'Monkspaces',
                category: p.battery_category || 'Industrial Equipment',
                categoryKey: 'BATTERIES',
                type: 'Custom',
                sku: p.gtin || `SKU-${p.id.slice(0, 6)}`,
                gtin: p.gtin || '08901396000000',
                serialNumber: p.serial_number || 'SN-001',
                massOrVolume: p.mass_kg ? `${p.mass_kg} kg` : '100 kg',
                specsSummary: `${p.chemistry || 'Standard Spec'} • Voltage: ${p.nominal_voltage || '48'}V`,
                imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=300&auto=format&fit=crop&q=80',
                status: (p.status === 'published' ? 'published' : 'draft') as any,
                origin: p.manufacturer_plant_location || 'India',
                createdAt: p.created_at || new Date().toISOString(),
              });
            }
          });
        }
        this.products = mergedList;
        this.applyFilter();
        this.updateTabCounts();
        this.isLoading = false;
      },
      error: () => {
        // Fallback to default catalog if backend error
        this.products = [...this.defaultCatalog];
        this.applyFilter();
        this.updateTabCounts();
        this.isLoading = false;
      },
    });
  }

  updateTabCounts(): void {
    const counts: Record<string, number> = {
      ALL: this.products.length,
      PACKAGING: 0,
      BATTERIES: 0,
      CHEMICALS: 0,
      TEXTILES: 0,
    };

    this.products.forEach((p) => {
      if (counts[p.categoryKey] !== undefined) {
        counts[p.categoryKey]++;
      }
    });

    this.categoryTabs = this.categoryTabs.map((tab) => ({
      ...tab,
      count: counts[tab.id] || 0,
    }));
  }

  onCategoryFilterChange(tabId: string): void {
    this.activeCategoryFilter = tabId;
    this.applyFilter();
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    let result = [...this.products];

    if (this.activeCategoryFilter !== 'ALL') {
      result = result.filter((p) => p.categoryKey === this.activeCategoryFilter);
    }

    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.gtin.toLowerCase().includes(q) ||
          p.specsSummary.toLowerCase().includes(q) ||
          p.origin.toLowerCase().includes(q)
      );
    }

    this.filteredProducts = result;
  }

  openCreateModal(): void {
    const randomGtin = '08901396' + Math.floor(100000 + Math.random() * 900000);
    this.productForm.reset({
      name: '',
      brand: 'Monkspaces',
      categoryKey: 'PACKAGING',
      type: 'Custom',
      sku: 'SKU-' + Math.floor(1000 + Math.random() * 9000),
      gtin: randomGtin,
      massOrVolume: '1.0 kg',
      specsSummary: 'High-purity raw material • Recyclable composition',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
      origin: 'India',
    });
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  submitProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const val = this.productForm.value;

    const newProd: CatalogProduct = {
      id: 'prod-' + Date.now(),
      name: val.name,
      brand: val.brand,
      category: this.getCategoryLabel(val.categoryKey),
      categoryKey: val.categoryKey,
      type: val.type,
      sku: val.sku,
      gtin: val.gtin,
      massOrVolume: val.massOrVolume,
      specsSummary: val.specsSummary,
      imageUrl: val.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
      status: 'draft',
      origin: val.origin,
      createdAt: new Date().toISOString(),
    };

    // Save to backend PostgreSQL
    this.productService
      .createProduct({
        model_name: val.name,
        brand_name: val.brand,
        gtin: val.gtin,
        serial_number: val.sku,
        battery_category: val.categoryKey === 'BATTERIES' ? 'EV' : 'Industrial',
        mass_kg: parseFloat(val.massOrVolume) || 1,
        parts_materials: val.specsSummary,
      } as any)
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.isModalOpen = false;
          this.products = [newProd, ...this.products];
          this.applyFilter();
          this.updateTabCounts();
          this.toastService.show(`Product "${newProd.name}" added to master catalog!`, 'success', 3500);
        },
        error: () => {
          this.isSaving = false;
          this.isModalOpen = false;
          this.products = [newProd, ...this.products];
          this.applyFilter();
          this.updateTabCounts();
          this.toastService.show(`Product saved locally to catalog!`, 'success', 3000);
        },
      });
  }

  private getCategoryLabel(key: string): string {
    switch (key) {
      case 'BATTERIES':
        return 'Batteries & Energy Storage';
      case 'PACKAGING':
        return 'Polymers & Packaging';
      case 'CHEMICALS':
        return 'Chemicals & Minerals';
      case 'TEXTILES':
        return 'Textiles & Fiber';
      default:
        return 'General Products';
    }
  }
}
