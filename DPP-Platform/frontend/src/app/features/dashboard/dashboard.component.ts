import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../core/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ToastService } from '../../core/services/toast.service';
import { ThemePreset } from '../../core/config/theme.config';
import { FilterTabItem } from '../../shared/components/filter-tabs/filter-tabs.component';
import { CreatedPassportResult } from '../passports/create-dpp-modal/create-dpp-modal.component';

export type IndustryCategory = 'ALL' | 'TEXTILES' | 'BATTERIES' | 'ELECTRONICS' | 'PACKAGING';

export interface UniversalDppItem {
  id: string;
  gtin: string;
  productName: string;
  modelOrBatch: string;
  industry: 'Textiles' | 'Batteries' | 'Electronics' | 'Packaging';
  industryCode: IndustryCategory;
  materialComposition: string;
  recycledContentPct: number;
  carbonKgCo2e: number;
  facilityOrigin: string;
  status: 'published' | 'pending' | 'draft' | 'archived';
  lastUpdated: string;
  digitalLink: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  activeTheme!: ThemePreset;
  showThemePicker = false;

  // Create DPP Studio Modal State
  isCreateModalOpen = false;

  // Search & Filter state
  searchQuery = '';
  activeIndustryFilter: IndustryCategory = 'ALL';
  activeStatusFilter = 'ALL';

  // Industry Filter Tabs (Reusable app-filter-tabs)
  industryTabs: FilterTabItem[] = [
    { id: 'ALL', label: 'All Sectors', count: 6, icon: 'category' },
    { id: 'TEXTILES', label: 'Textiles & Apparel', count: 2, icon: 'checkroom' },
    { id: 'BATTERIES', label: 'Batteries & Storage', count: 2, icon: 'battery_charging_full' },
    { id: 'ELECTRONICS', label: 'Electronics & ICT', count: 1, icon: 'devices' },
    { id: 'PACKAGING', label: 'Packaging & Plastics', count: 1, icon: 'inventory_2' },
  ];

  // Status Filter Tabs (Reusable app-filter-tabs)
  statusTabs: FilterTabItem[] = [
    { id: 'ALL', label: 'All Statuses' },
    { id: 'published', label: 'Published (4)' },
    { id: 'pending', label: 'In Review (1)' },
    { id: 'draft', label: 'Draft (1)' },
  ];

  // Industry Sector Distribution (Universal ESPR Breakdown)
  sectorDistributions = [
    { label: 'Textiles & Garments', value: 38, target: 50, color: 'var(--brand-accent)', subtext: 'EU ESPR Priority 1' },
    { label: 'Batteries & EV Storage', value: 29, target: 30, color: '#3b82f6', subtext: 'EU 2023/1542 Mandate' },
    { label: 'Electronics & ICT', value: 19, target: 20, color: '#f59e0b', subtext: 'Right to Repair & Circularity' },
    { label: 'Packaging & Circular Polymers', value: 14, target: 15, color: '#8b5cf6', subtext: 'PPWR Conformity' },
  ];

  // Multi-Industry DPP Registry (Generic Digital Product Passports)
  passports: UniversalDppItem[] = [
    {
      id: 'DPP-TXT-0104',
      gtin: '0401234567801',
      productName: 'Circular Wool & Hemp Utility Parka',
      modelOrBatch: 'LOT-TX-2026-A1',
      industry: 'Textiles',
      industryCode: 'TEXTILES',
      materialComposition: '60% Recycled Wool, 40% Organic Hemp',
      recycledContentPct: 60,
      carbonKgCo2e: 11.4,
      facilityOrigin: 'Monk Eco Mills (Braga, Portugal)',
      status: 'published',
      lastUpdated: '10m ago',
      digitalLink: 'https://dpp.monkspaces.com/id/01/0401234567801',
    },
    {
      id: 'DPP-BAT-8842',
      gtin: '0401234567802',
      productName: 'Zenith EV UltraPack 75kWh',
      modelOrBatch: 'MOD-EV75-NMC811',
      industry: 'Batteries',
      industryCode: 'BATTERIES',
      materialComposition: 'NMC 811 Lithium-Ion Chemistry',
      recycledContentPct: 24,
      carbonKgCo2e: 42.1,
      facilityOrigin: 'Monk Gigafactory (Munich, DE)',
      status: 'published',
      lastUpdated: '2h ago',
      digitalLink: 'https://dpp.monkspaces.com/id/01/0401234567802',
    },
    {
      id: 'DPP-ELE-5520',
      gtin: '0401234567803',
      productName: 'Modular Smart Climate Sensor Hub',
      modelOrBatch: 'REV-HUB-V3',
      industry: 'Electronics',
      industryCode: 'ELECTRONICS',
      materialComposition: 'Recycled Aluminum & Halogen-free PCB',
      recycledContentPct: 48,
      carbonKgCo2e: 6.8,
      facilityOrigin: 'Monk IoT Labs (Eindhoven, NL)',
      status: 'published',
      lastUpdated: 'Yesterday',
      digitalLink: 'https://dpp.monkspaces.com/id/01/0401234567803',
    },
    {
      id: 'DPP-TXT-0288',
      gtin: '0401234567804',
      productName: 'Zero-Waste Denim Over-Shirt',
      modelOrBatch: 'LOT-DNM-2026',
      industry: 'Textiles',
      industryCode: 'TEXTILES',
      materialComposition: '98% GOTS Certified Cotton, 2% Elastane',
      recycledContentPct: 35,
      carbonKgCo2e: 8.2,
      facilityOrigin: 'BlueCycle Weaving (Valencia, ES)',
      status: 'pending',
      lastUpdated: 'Sep 16, 2026',
      digitalLink: 'https://dpp.monkspaces.com/id/01/0401234567804',
    },
    {
      id: 'DPP-PKG-9102',
      gtin: '0401234567805',
      productName: 'Bio-Polymer Circular Beverage Pack',
      modelOrBatch: 'LOT-RPET-500',
      industry: 'Packaging',
      industryCode: 'PACKAGING',
      materialComposition: '100% Post-Consumer Recycled rPET',
      recycledContentPct: 100,
      carbonKgCo2e: 1.6,
      facilityOrigin: 'EcoContainer S.A. (Lyon, FR)',
      status: 'published',
      lastUpdated: 'Sep 15, 2026',
      digitalLink: 'https://dpp.monkspaces.com/id/01/0401234567805',
    },
    {
      id: 'DPP-BAT-1290',
      gtin: '0401234567806',
      productName: 'Stationary Sodium-Ion Grid Cell',
      modelOrBatch: 'MOD-NA-ESS40',
      industry: 'Batteries',
      industryCode: 'BATTERIES',
      materialComposition: 'Sodium-Ion Zero Critical Raw Materials',
      recycledContentPct: 38,
      carbonKgCo2e: 18.2,
      facilityOrigin: 'Monk Advanced Storage R&D',
      status: 'draft',
      lastUpdated: 'Sep 14, 2026',
      digitalLink: 'https://dpp.monkspaces.com/id/01/0401234567806',
    },
  ];

  constructor(
    private authService: AuthService,
    public themeService: ThemeService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.activeTheme = this.themeService.currentTheme;

    this.themeService.currentTheme$.subscribe((theme) => {
      this.activeTheme = theme;
    });
  }

  get filteredPassports(): UniversalDppItem[] {
    return this.passports.filter((p) => {
      // 1. Industry Category filter
      const matchesIndustry =
        this.activeIndustryFilter === 'ALL' || p.industryCode === this.activeIndustryFilter;

      // 2. Status filter
      const matchesStatus =
        this.activeStatusFilter === 'ALL' || p.status === this.activeStatusFilter;

      // 3. Search query
      const q = this.searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.id.toLowerCase().includes(q) ||
        p.productName.toLowerCase().includes(q) ||
        p.modelOrBatch.toLowerCase().includes(q) ||
        p.materialComposition.toLowerCase().includes(q) ||
        p.gtin.toLowerCase().includes(q);

      return matchesIndustry && matchesStatus && matchesSearch;
    });
  }

  onIndustryTabChange(tabId: string): void {
    this.activeIndustryFilter = tabId as IndustryCategory;
  }

  onStatusTabChange(tabId: string): void {
    this.activeStatusFilter = tabId;
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
  }

  toggleThemePicker(): void {
    this.showThemePicker = !this.showThemePicker;
  }

  applyTheme(themeId: string): void {
    this.themeService.setTheme(themeId);
    this.toastService.show(`Active Theme: "${this.themeService.currentTheme.name}"`, 'success', 2500);
    this.showThemePicker = false;
  }

  createNewPassport(): void {
    this.isCreateModalOpen = true;
  }

  onPassportCreated(result: CreatedPassportResult): void {
    const industryLabel: 'Textiles' | 'Batteries' | 'Electronics' | 'Packaging' =
      result.industryCode === 'TEXTILES'
        ? 'Textiles'
        : result.industryCode === 'BATTERIES'
        ? 'Batteries'
        : result.industryCode === 'ELECTRONICS'
        ? 'Electronics'
        : 'Packaging';

    const newItem: UniversalDppItem = {
      id: result.id,
      gtin: result.gtin,
      productName: result.productName,
      modelOrBatch: result.modelOrBatch,
      industry: industryLabel,
      industryCode: result.industryCode,
      materialComposition: result.materialComposition,
      recycledContentPct: result.recycledContentPct,
      carbonKgCo2e: result.carbonKgCo2e,
      facilityOrigin: result.facilityOrigin,
      status: result.status,
      lastUpdated: 'Just now',
      digitalLink: result.digitalLink,
    };

    this.passports.unshift(newItem);
    this.updateTabCounts();
  }

  private updateTabCounts(): void {
    const publishedCount = this.passports.filter((p) => p.status === 'published').length;
    const pendingCount = this.passports.filter((p) => p.status === 'pending').length;
    const draftCount = this.passports.filter((p) => p.status === 'draft').length;

    this.statusTabs = [
      { id: 'ALL', label: 'All Statuses' },
      { id: 'published', label: `Published (${publishedCount})` },
      { id: 'pending', label: `In Review (${pendingCount})` },
      { id: 'draft', label: `Draft (${draftCount})` },
    ];
  }

  exportAuditReport(): void {
    this.toastService.show('Exporting Universal ESPR Audit Pack (JSON-LD & CSV)...', 'info', 2500);
  }

  copyDigitalLink(link: string, event: Event): void {
    event.stopPropagation();
    navigator.clipboard.writeText(link);
    this.toastService.show('GS1 Digital Link copied to clipboard', 'success', 2000);
  }

  viewPassportDetails(passport: UniversalDppItem): void {
    this.toastService.show(`Opening ${passport.id} — ${passport.productName}`, 'info', 2000);
  }
}

