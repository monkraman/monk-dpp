import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, User } from '../../core/auth.service';
import { UserService, ManagedUser, ManagedOrg } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';
import { FilterTabItem } from '../../shared/components/filter-tabs/filter-tabs.component';

@Component({
  selector: 'app-access-control',
  templateUrl: './access-control.component.html',
  styleUrls: ['./access-control.component.scss'],
})
export class AccessControlComponent implements OnInit {
  currentUser: User | null = null;
  users: ManagedUser[] = [];
  organizations: ManagedOrg[] = [];
  isLoading = false;
  isSaving = false;

  // Filters & Search
  searchQuery = '';
  activeRoleFilter = 'ALL';
  selectedOrgFilter = 'ALL';

  // Modal State
  isModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedUser: ManagedUser | null = null;
  userForm!: FormGroup;
  formError = '';

  // Delete Confirmation Modal
  isDeleteModalOpen = false;
  userToDelete: ManagedUser | null = null;
  isDeleting = false;

  // Role Filter Tabs
  roleTabs: FilterTabItem[] = [
    { id: 'ALL', label: 'All Users', count: 0, icon: 'groups' },
    { id: 'super_admin', label: 'Super Admins', count: 0, icon: 'admin_panel_settings' },
    { id: 'org_admin', label: 'Org Admins', count: 0, icon: 'manage_accounts' },
  ];

  get isSuperAdmin(): boolean {
    return this.currentUser?.role === 'super_admin';
  }

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadData();
  }

  initForm(): void {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['SecurePassword123!', [Validators.minLength(8)]],
      role: ['org_admin', [Validators.required]],
      organizationId: [''],
      status: ['active', [Validators.required]],
    });

    // Toggle organization requirement based on role
    this.userForm.get('role')?.valueChanges.subscribe((role) => {
      const orgControl = this.userForm.get('organizationId');
      if (role === 'org_admin') {
        orgControl?.setValidators([Validators.required]);
      } else {
        orgControl?.clearValidators();
      }
      orgControl?.updateValueAndValidity();
    });
  }

  loadData(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.updateTabCounts();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.toastService.show('Failed to fetch user directory', 'error', 3000);
        this.isLoading = false;
      },
    });

    this.userService.getOrganizations().subscribe({
      next: (orgs) => {
        this.organizations = orgs;
      },
      error: (err) => {
        console.warn('Could not load organizations list', err);
      },
    });
  }

  updateTabCounts(): void {
    const total = this.users.length;
    const superAdmins = this.users.filter((u) => u.role === 'super_admin').length;
    const orgAdmins = this.users.filter((u) => u.role === 'org_admin').length;

    this.roleTabs = [
      { id: 'ALL', label: 'All Users', count: total, icon: 'groups' },
      { id: 'super_admin', label: 'Super Admins', count: superAdmins, icon: 'admin_panel_settings' },
      { id: 'org_admin', label: 'Org Admins', count: orgAdmins, icon: 'manage_accounts' },
    ];
  }

  get filteredUsers(): ManagedUser[] {
    return this.users.filter((u) => {
      // 1. Role filter
      if (this.activeRoleFilter !== 'ALL' && u.role !== this.activeRoleFilter) {
        return false;
      }

      // 2. Org filter
      if (this.selectedOrgFilter !== 'ALL' && u.organization_id !== this.selectedOrgFilter) {
        return false;
      }

      // 3. Search query
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase().trim();
        const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
        const email = u.email.toLowerCase();
        const orgName = (u.organization?.name || '').toLowerCase();
        const role = u.role.toLowerCase();

        return fullName.includes(q) || email.includes(q) || orgName.includes(q) || role.includes(q);
      }

      return true;
    });
  }

  // Stat getters
  get superAdminCount(): number {
    return this.users.filter((u) => u.role === 'super_admin').length;
  }

  get orgAdminCount(): number {
    return this.users.filter((u) => u.role === 'org_admin').length;
  }

  get activeUserCount(): number {
    return this.users.filter((u) => u.status === 'active').length;
  }

  get totalOrgsCount(): number {
    return this.organizations.length;
  }

  onRoleTabChange(tabId: string): void {
    this.activeRoleFilter = tabId;
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.selectedUser = null;
    this.formError = '';
    this.userForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      password: 'SecurePassword123!',
      role: 'org_admin',
      organizationId: this.organizations.length > 0 ? this.organizations[0].id : (this.currentUser?.organizationId || ''),
      status: 'active',
    });
    this.isModalOpen = true;
  }

  openEditModal(user: ManagedUser): void {
    this.modalMode = 'edit';
    this.selectedUser = user;
    this.formError = '';
    this.userForm.patchValue({
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      email: user.email,
      role: user.role,
      organizationId: user.organization_id || '',
      status: user.status,
    });
    // In edit mode, password is not required
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedUser = null;
    this.formError = '';
  }

  saveUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.formError = '';

    const formValues = this.userForm.value;

    if (this.modalMode === 'create') {
      this.userService.createUser(formValues).subscribe({
        next: (created) => {
          this.toastService.show(`User "${created.email}" provisioned successfully`, 'success', 3000);
          this.closeModal();
          this.loadData();
          this.isSaving = false;
        },
        error: (err) => {
          this.formError = err?.error?.message || 'Failed to create user. Please check all fields.';
          this.isSaving = false;
        },
      });
    } else if (this.modalMode === 'edit' && this.selectedUser) {
      this.userService
        .updateUser(this.selectedUser.id, {
          firstName: formValues.firstName,
          lastName: formValues.lastName,
          role: formValues.role,
          status: formValues.status,
        })
        .subscribe({
          next: () => {
            this.toastService.show(`User "${this.selectedUser?.email}" updated successfully`, 'success', 3000);
            this.closeModal();
            this.loadData();
            this.isSaving = false;
          },
          error: (err) => {
            this.formError = err?.error?.message || 'Failed to update user.';
            this.isSaving = false;
          },
        });
    }
  }

  promptDelete(user: ManagedUser): void {
    if (user.id === this.currentUser?.id || user.email === this.currentUser?.email) {
      this.toastService.show('You cannot delete your own active account.', 'error', 3000);
      return;
    }
    this.userToDelete = user;
    this.isDeleteModalOpen = true;
  }

  confirmDelete(): void {
    if (!this.userToDelete) return;

    this.isDeleting = true;
    this.userService.deleteUser(this.userToDelete.id).subscribe({
      next: () => {
        this.toastService.show(`User "${this.userToDelete?.email}" removed`, 'info', 2500);
        this.isDeleteModalOpen = false;
        this.userToDelete = null;
        this.isDeleting = false;
        this.loadData();
      },
      error: (err) => {
        this.toastService.show(err?.error?.message || 'Failed to delete user.', 'error', 3000);
        this.isDeleting = false;
      },
    });
  }

  cancelDelete(): void {
    this.isDeleteModalOpen = false;
    this.userToDelete = null;
  }

  getUserInitials(user: ManagedUser): string {
    const f = user.first_name ? user.first_name.charAt(0).toUpperCase() : '';
    const l = user.last_name ? user.last_name.charAt(0).toUpperCase() : '';
    return f + l || user.email.charAt(0).toUpperCase();
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'super_admin':
        return 'badge-super-admin';
      case 'org_admin':
        return 'badge-org-admin';
      default:
        return 'badge-standard';
    }
  }

  getRoleDisplay(role: string): string {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'org_admin':
        return 'Org Admin';
      case 'product_manager':
        return 'Product Manager';
      case 'compliance':
        return 'Compliance Lead';
      case 'viewer':
        return 'Auditor / Viewer';
      default:
        return role;
    }
  }

  isCurrentUser(user: ManagedUser): boolean {
    return user.id === this.currentUser?.id || user.email === this.currentUser?.email;
  }
}
