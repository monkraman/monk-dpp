import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth.service';

export type CompanyRole = 'issuer' | 'supplier' | 'recipient' | 'recycler' | 'internal';

export interface CompanyPartner {
  id: string;
  name: string;
  legalName?: string;
  email: string;
  country: string;
  countryCode: string;
  countryFlag: string;
  role: CompanyRole;
  roleLabel: string;
  sector: string;
  registrationNumber: string;
  contactPerson: string;
  contactPhone?: string;
  activePassportsCount: number;
  verificationStatus: 'verified' | 'active' | 'pending';
  logoUrl?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private orgsApiUrl = `${environment.apiUrl}/orgs`;

  // Curated supply-chain network for Monk Spaces "From & To" DPP operations
  private defaultCompanies: CompanyPartner[] = [
    {
      id: 'c6c5485c-9e10-4bae-b298-72ec331daf91',
      name: 'Monkspaces Technologies',
      legalName: 'Monkspaces Technologies Pvt. Ltd.',
      email: 'admin@monkspaces.com',
      country: 'India',
      countryCode: 'IN',
      countryFlag: '🇮🇳',
      role: 'internal',
      roleLabel: 'Internal / Manufacturer',
      sector: 'Batteries & Energy Storage',
      registrationNumber: 'CIN-U72900DL2024PTC11234',
      contactPerson: 'Raman Thakur',
      contactPhone: '+91 98100 23456',
      activePassportsCount: 5,
      verificationStatus: 'verified',
      logoUrl: '',
      createdAt: '2026-08-01',
    },
    {
      id: 'comp-cascarine-01',
      name: 'Cascarine Polymers Pvt. Ltd.',
      legalName: 'Cascarine Polymers & Packaging Ltd.',
      email: 'supply@cascarine-polymers.com',
      country: 'India',
      countryCode: 'IN',
      countryFlag: '🇮🇳',
      role: 'supplier',
      roleLabel: 'Component Supplier (From)',
      sector: 'Polymers & Packaging',
      registrationNumber: 'CIN-U25200MH2021PTC88219',
      contactPerson: 'Arunav Sengupta',
      contactPhone: '+91 98221 44556',
      activePassportsCount: 4,
      verificationStatus: 'verified',
      logoUrl: '',
      createdAt: '2026-08-15',
    },
    {
      id: 'comp-fenbrolt-02',
      name: 'Fenbrolt Specialty Chemicals',
      legalName: 'Fenbrolt Chemicals Europe BV',
      email: 'compliance@fenbrolt.eu',
      country: 'Netherlands',
      countryCode: 'NL',
      countryFlag: '🇳🇱',
      role: 'supplier',
      roleLabel: 'Chemical Supplier (From)',
      sector: 'Specialty Chemicals & Electrolytes',
      registrationNumber: 'KVK-88192019',
      contactPerson: 'Dr. Pieter van Dijk',
      contactPhone: '+31 20 891 2200',
      activePassportsCount: 3,
      verificationStatus: 'verified',
      logoUrl: '',
      createdAt: '2026-08-20',
    },
    {
      id: 'comp-reckitt-03',
      name: 'Reckitt Benckiser Private Limited',
      legalName: 'Reckitt Benckiser Group PLC (India Division)',
      email: 'dpp-partner@reckitt.com',
      country: 'India / UK',
      countryCode: 'GB',
      countryFlag: '🇬🇧',
      role: 'recipient',
      roleLabel: 'Client Recipient (To)',
      sector: 'Consumer Healthcare & Formulations',
      registrationNumber: 'CIN-L24231DL1951PLC001923',
      contactPerson: 'Meera Deshmukh',
      contactPhone: '+91 124 498 7000',
      activePassportsCount: 2,
      verificationStatus: 'verified',
      logoUrl: '',
      createdAt: '2026-09-01',
    },
    {
      id: 'comp-msconstruction-04',
      name: 'MS Construction Infrastructure',
      legalName: 'MS Infrastructure & Civil Works Ltd.',
      email: 'procurement@msconstruction.eu',
      country: 'Germany',
      countryCode: 'DE',
      countryFlag: '🇩🇪',
      role: 'recipient',
      roleLabel: 'Client Recipient (To)',
      sector: 'Industrial Infrastructure & Steel',
      registrationNumber: 'HRB-71289-BERLIN',
      contactPerson: 'Hans-Peter Weber',
      contactPhone: '+49 30 5543 908',
      activePassportsCount: 3,
      verificationStatus: 'verified',
      logoUrl: '',
      createdAt: '2026-09-05',
    },
    {
      id: 'comp-bharatore-05',
      name: 'Bharat Ore Mines Pvt. Ltd.',
      legalName: 'Bharat Ore & Mineral Extraction Corporation',
      email: 'esg@bharatore.in',
      country: 'India',
      countryCode: 'IN',
      countryFlag: '🇮🇳',
      role: 'supplier',
      roleLabel: 'Raw Material Supplier (From)',
      sector: 'Mining & Metallurgical Minerals',
      registrationNumber: 'CIN-U13100OR2019PTC031200',
      contactPerson: 'Vikramjit Roy',
      contactPhone: '+91 674 250 8891',
      activePassportsCount: 2,
      verificationStatus: 'verified',
      logoUrl: '',
      createdAt: '2026-09-10',
    },
    {
      id: 'comp-suraksha-06',
      name: 'Suraksha Scrap Traders',
      legalName: 'Suraksha Circular Metal Recyclers',
      email: 'operations@surakshascrap.com',
      country: 'India',
      countryCode: 'IN',
      countryFlag: '🇮🇳',
      role: 'recycler',
      roleLabel: 'Circular Recycling Partner',
      sector: 'Metals & Battery Recycling',
      registrationNumber: 'GSTIN-07AABCS1429B1Z8',
      contactPerson: 'Sanjay Rawat',
      contactPhone: '+91 99118 76543',
      activePassportsCount: 2,
      verificationStatus: 'active',
      logoUrl: '',
      createdAt: '2026-09-12',
    },
  ];

  private companiesSubject = new BehaviorSubject<CompanyPartner[]>(this.defaultCompanies);
  public companies$ = this.companiesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {
    this.syncBackendOrganizations();
  }

  /**
   * Sync and merge organizations from PostgreSQL backend
   */
  public syncBackendOrganizations(): void {
    this.http
      .get<any[]>(this.orgsApiUrl, { headers: this.auth.getAuthHeaders() })
      .pipe(catchError(() => of([])))
      .subscribe((backendOrgs) => {
        if (!backendOrgs || !Array.isArray(backendOrgs) || backendOrgs.length === 0) return;

        const currentList = [...this.companiesSubject.getValue()];
        backendOrgs.forEach((bOrg) => {
          const exists = currentList.find((c) => c.id === bOrg.id || c.name.toLowerCase() === bOrg.name.toLowerCase());
          if (!exists) {
            currentList.push({
              id: bOrg.id,
              name: bOrg.name,
              legalName: bOrg.name,
              email: bOrg.email || 'contact@' + bOrg.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
              country: 'India',
              countryCode: 'IN',
              countryFlag: '🇮🇳',
              role: 'recipient',
              roleLabel: 'Registered Partner',
              sector: 'Manufacturing & Tech',
              registrationNumber: bOrg.tenant_id ? `TENANT-${bOrg.tenant_id.slice(0, 8)}` : 'REG-2026',
              contactPerson: 'Lead Administrator',
              activePassportsCount: 1,
              verificationStatus: 'active',
              createdAt: bOrg.createdAt || new Date().toISOString(),
            });
          }
        });
        this.companiesSubject.next(currentList);
      });
  }

  getCompanies(): Observable<CompanyPartner[]> {
    return this.companies$;
  }

  getCompany(id: string): CompanyPartner | undefined {
    return this.companiesSubject.getValue().find((c) => c.id === id);
  }

  addCompany(company: Partial<CompanyPartner>): Observable<CompanyPartner> {
    const newId = 'comp-' + Date.now();
    const newCompany: CompanyPartner = {
      id: newId,
      name: company.name || 'New Company',
      legalName: company.legalName || company.name || 'New Company Legal',
      email: company.email || 'info@company.com',
      country: company.country || 'India',
      countryCode: company.countryCode || 'IN',
      countryFlag: company.countryFlag || '🇮🇳',
      role: company.role || 'supplier',
      roleLabel: this.getRoleLabel(company.role || 'supplier'),
      sector: company.sector || 'General Manufacturing',
      registrationNumber: company.registrationNumber || `REG-${Math.floor(100000 + Math.random() * 900000)}`,
      contactPerson: company.contactPerson || 'Compliance Lead',
      contactPhone: company.contactPhone || '+91 98000 00000',
      activePassportsCount: 0,
      verificationStatus: 'verified',
      logoUrl: company.logoUrl || '',
      createdAt: new Date().toISOString(),
    };

    // Try posting to backend organization API if super_admin
    this.http
      .post(this.orgsApiUrl, { name: newCompany.name, email: newCompany.email }, { headers: this.auth.getAuthHeaders() })
      .pipe(catchError(() => of(null)))
      .subscribe();

    const updated = [newCompany, ...this.companiesSubject.getValue()];
    this.companiesSubject.next(updated);
    return of(newCompany);
  }

  updateCompany(id: string, data: Partial<CompanyPartner>): Observable<CompanyPartner | null> {
    const current = this.companiesSubject.getValue();
    const index = current.findIndex((c) => c.id === id);
    if (index === -1) return of(null);

    const updatedCompany = { ...current[index], ...data };
    if (data.role) {
      updatedCompany.roleLabel = this.getRoleLabel(data.role);
    }
    current[index] = updatedCompany;
    this.companiesSubject.next([...current]);
    return of(updatedCompany);
  }

  deleteCompany(id: string): Observable<boolean> {
    const current = this.companiesSubject.getValue().filter((c) => c.id !== id);
    this.companiesSubject.next(current);
    return of(true);
  }

  private getRoleLabel(role: CompanyRole): string {
    switch (role) {
      case 'supplier':
        return 'Component Supplier (From)';
      case 'recipient':
        return 'Client Recipient (To)';
      case 'internal':
        return 'Internal / Manufacturer';
      case 'recycler':
        return 'Circular Recycling Partner';
      default:
        return 'Supply Chain Partner';
    }
  }
}
