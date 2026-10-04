import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyService, CompanyPartner, CompanyRole } from '../../core/services/company.service';
import { AuthService, User } from '../../core/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { FilterTabItem } from '../../shared/components/filter-tabs/filter-tabs.component';

@Component({
  selector: 'app-company-management',
  templateUrl: './company-management.component.html',
  styleUrls: ['./company-management.component.scss'],
})
export class CompanyManagementComponent implements OnInit {
  currentUser: User | null = null;
  companies: CompanyPartner[] = [];
  filteredCompanies: CompanyPartner[] = [];
  isLoading = false;

  // Search & Filters
  searchQuery = '';
  activeRoleFilter = 'ALL';

  // Role Filter Tabs
  roleTabs: FilterTabItem[] = [
    { id: 'ALL', label: 'All Companies', count: 0, icon: 'business' },
    { id: 'supplier', label: 'Suppliers (From)', count: 0, icon: 'input' },
    { id: 'internal', label: 'Internal / Manufacturing', count: 0, icon: 'factory' },
    { id: 'recipient', label: 'Recipients (To)', count: 0, icon: 'output' },
    { id: 'recycler', label: 'Circular Recyclers', count: 0, icon: 'autorenew' },
  ];

  // Modal State
  isModalOpen = false;
  isSaving = false;
  companyForm!: FormGroup;

  // Delete modal
  isDeleteModalOpen = false;
  companyToDelete: CompanyPartner | null = null;

  constructor(
    private companyService: CompanyService,
    private authService: AuthService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadCompanies();
  }

  initForm(): void {
    this.companyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      legalName: [''],
      email: ['', [Validators.required, Validators.email]],
      role: ['supplier', [Validators.required]],
      sector: ['Polymers & Packaging', [Validators.required]],
      country: ['India', [Validators.required]],
      countryFlag: ['🇮🇳'],
      registrationNumber: ['', [Validators.required]],
      contactPerson: ['', [Validators.required]],
      contactPhone: [''],
    });

    // Auto-update flag when country changes
    this.companyForm.get('country')?.valueChanges.subscribe((country) => {
      let flag = '🇮🇳';
      if (country === 'Germany') flag = '🇩🇪';
      else if (country === 'Netherlands') flag = '🇳🇱';
      else if (country === 'UK' || country === 'United Kingdom') flag = '🇬🇧';
      else if (country === 'USA' || country === 'United States') flag = '🇺🇸';
      else if (country === 'France') flag = '🇫🇷';
      this.companyForm.patchValue({ countryFlag: flag }, { emitEvent: false });
    });
  }

  loadCompanies(): void {
    this.isLoading = true;
    this.companyService.getCompanies().subscribe({
      next: (list) => {
        this.companies = list;
        this.applyFilter();
        this.updateTabCounts();
        this.isLoading = false;
      },
      error: () => {
        this.toastService.show('Failed to fetch company list', 'error', 3000);
        this.isLoading = false;
      },
    });
  }

  updateTabCounts(): void {
    const counts: Record<string, number> = {
      ALL: this.companies.length,
      supplier: 0,
      internal: 0,
      recipient: 0,
      recycler: 0,
    };

    this.companies.forEach((c) => {
      if (counts[c.role] !== undefined) {
        counts[c.role]++;
      }
    });

    this.roleTabs = this.roleTabs.map((tab) => ({
      ...tab,
      count: counts[tab.id] || 0,
    }));
  }

  onRoleFilterChange(tabId: string): void {
    this.activeRoleFilter = tabId;
    this.applyFilter();
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    let result = [...this.companies];

    if (this.activeRoleFilter !== 'ALL') {
      result = result.filter((c) => c.role === this.activeRoleFilter);
    }

    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.sector.toLowerCase().includes(q) ||
          c.contactPerson.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.registrationNumber.toLowerCase().includes(q)
      );
    }

    this.filteredCompanies = result;
  }

  openCreateModal(): void {
    this.companyForm.reset({
      name: '',
      legalName: '',
      email: '',
      role: 'supplier',
      sector: 'Polymers & Packaging',
      country: 'India',
      countryFlag: '🇮🇳',
      registrationNumber: `REG-${Math.floor(100000 + Math.random() * 900000)}`,
      contactPerson: '',
      contactPhone: '',
    });
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  submitCompany(): void {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const formVal = this.companyForm.value;

    this.companyService.addCompany(formVal).subscribe({
      next: (created) => {
        this.isSaving = false;
        this.isModalOpen = false;
        this.toastService.show(`Company "${created.name}" registered successfully!`, 'success', 3500);
        this.loadCompanies();
      },
      error: () => {
        this.isSaving = false;
        this.toastService.show('Failed to save company', 'error', 3000);
      },
    });
  }

  openDeleteModal(company: CompanyPartner): void {
    this.companyToDelete = company;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.companyToDelete = null;
  }

  confirmDelete(): void {
    if (!this.companyToDelete) return;

    this.companyService.deleteCompany(this.companyToDelete.id).subscribe({
      next: () => {
        this.toastService.show(`Removed company "${this.companyToDelete?.name}"`, 'success', 3000);
        this.closeDeleteModal();
        this.loadCompanies();
      },
    });
  }

  getRoleBadgeClass(role: CompanyRole): string {
    switch (role) {
      case 'internal':
        return 'badge-internal';
      case 'supplier':
        return 'badge-supplier';
      case 'recipient':
        return 'badge-recipient';
      case 'recycler':
        return 'badge-recycler';
      default:
        return 'badge-default';
    }
  }
}
