import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../../../core/services/toast.service';

export interface FieldDef {
  label: string;
  type: 't' | 'n' | 'p' | 'f' | 's'; // text, number, percent, file, select
  unitOrOptions: string;
  required: boolean;
  why?: string;
}

export interface SectionDef {
  title: string;
  fields: FieldDef[];
}

export interface CategoryDef {
  id: string;
  name: string;
  icon: string;
  color: string;
  regulation: string;
  subcategories: string[];
  sections: SectionDef[];
  keywords: string;
}

export interface ProductCatalogItem {
  id: number;
  name: string;
  category: string;
  unit: string;
  usedCount: number;
  imgUrl?: string;
}

export interface PassportBOMItem {
  id: number;
  name: string;
  category: string;
  amount: string;
  unit: string;
  imgUrl?: string;
}

export interface ChainSourceItem {
  pid: string;
  productName: string;
  supplier: string;
  amount: string;
  unit: string;
  category: string;
  isNewDraft?: boolean;
}

export interface CustomFieldItem {
  id: number;
  sectionIndex: number;
  name: string;
  type: 't' | 'f';
  textValue: string;
  fileName: string;
  fileSize: number;
  visibility: number; // 0: Public, 1: Regulator, 2: Private
  error?: string;
}

export interface CreatedPassportResult {
  id: string;
  productName: string;
  category: string;
  industryCode: 'TEXTILES' | 'BATTERIES' | 'ELECTRONICS' | 'PACKAGING' | 'ALL';
  materialComposition: string;
  recycledContentPct: number;
  carbonKgCo2e: number;
  facilityOrigin: string;
  status: 'published' | 'draft';
  gtin: string;
  modelOrBatch: string;
  quantityStr: string;
  digitalLink: string;
}

@Component({
  selector: 'app-create-dpp-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './create-dpp-modal.component.html',
  styleUrls: ['./create-dpp-modal.component.scss'],
})
export class CreateDppModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() passportCreated = new EventEmitter<CreatedPassportResult>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      // Re-initialize to initial category selection screen if needed
      if (!this.selectedCategoryKey) {
        this.resetStudio();
      }
    }
  }

  // Categories Database
  categories: Record<string, CategoryDef> = {
    bat: {
      id: 'bat',
      name: 'Batteries & Storage',
      icon: '🔋',
      color: '#f59e0b',
      regulation: 'EU Battery Reg. 2023/1542',
      subcategories: ['EV battery', 'Industrial battery (>2 kWh)', 'Light means of transport', 'Portable battery'],
      keywords: 'battery cell lithium li-ion pack ev cobalt storage lfp nmc',
      sections: [
        {
          title: 'Electrochemical Performance',
          fields: [
            { label: 'Chemistry', type: 's', unitOrOptions: 'Li-ion NMC|Li-ion LFP|NiMH|Lead-acid|Solid-state|Sodium-ion', required: true, why: 'Cathode and anode active materials' },
            { label: 'Rated capacity', type: 'n', unitOrOptions: 'Ah', required: true },
            { label: 'Nominal voltage', type: 'n', unitOrOptions: 'V', required: true },
            { label: 'Expected cycle life', type: 'n', unitOrOptions: 'cycles', required: true, why: 'At 80% remaining capacity threshold' },
            { label: 'State of health (SoH)', type: 'p', unitOrOptions: '%', required: false, why: 'Dynamic operating state' },
          ],
        },
        {
          title: 'Carbon Footprint & Recycled Content',
          fields: [
            { label: 'Carbon footprint', type: 'n', unitOrOptions: 'kg CO₂e/kWh', required: true, why: 'Per kWh total lifecycle energy' },
            { label: 'Recycled cobalt share', type: 'p', unitOrOptions: '%', required: true, why: 'Mandatory EU recycled quota' },
            { label: 'Recycled lithium share', type: 'p', unitOrOptions: '%', required: true },
            { label: 'Recycled nickel share', type: 'p', unitOrOptions: '%', required: true },
            { label: 'Substances of concern', type: 't', unitOrOptions: '', required: true, why: 'Hazardous chemicals & SVHC location' },
          ],
        },
        {
          title: 'Safety & Dismantling Documents',
          fields: [
            { label: 'Dismantling manual', type: 'f', unitOrOptions: '', required: true, why: 'Safe extraction guide for recyclers' },
            { label: 'Safety instructions (MSDS)', type: 'f', unitOrOptions: '', required: true },
            { label: 'Due diligence supply chain report', type: 'f', unitOrOptions: '', required: true, why: 'OECD raw material traceability' },
          ],
        },
      ],
    },
    tex: {
      id: 'tex',
      name: 'Textiles & Apparel',
      icon: '👕',
      color: '#ec4899',
      regulation: 'ESPR Textile Delegated Act',
      subcategories: ['Apparel & Garments', 'Footwear', 'Home Textiles', 'Technical Textiles'],
      keywords: 'shirt jacket cotton fabric garment shoe apparel textile denim polyester wool',
      sections: [
        {
          title: 'Fibre Composition & Chemicals',
          fields: [
            { label: 'Fibre composition', type: 't', unitOrOptions: '', required: true, why: 'e.g. 70% GOTS Organic Cotton, 30% Recycled Polyester' },
            { label: 'Recycled fibre content', type: 'p', unitOrOptions: '%', required: true },
            { label: 'Dyes & finishing processes', type: 't', unitOrOptions: '', required: true, why: 'Chemical treatment and non-toxic certification' },
            { label: 'Substances of concern (REACH)', type: 't', unitOrOptions: '', required: true },
          ],
        },
        {
          title: 'Durability, Care & Repair',
          fields: [
            { label: 'Colour-fastness grade', type: 's', unitOrOptions: '1|2|3|4|5', required: false },
            { label: 'Care & washing instructions', type: 't', unitOrOptions: '', required: true },
            { label: 'Repair & alterations network', type: 't', unitOrOptions: '', required: false, why: 'Authorized local repair partners' },
            { label: 'Microplastic shedding rate', type: 'n', unitOrOptions: 'mg/wash', required: false },
          ],
        },
        {
          title: 'Environmental Footprint & Social Audit',
          fields: [
            { label: 'Water footprint', type: 'n', unitOrOptions: 'L/kg', required: true },
            { label: 'Carbon footprint (PEF)', type: 'n', unitOrOptions: 'kg CO₂e', required: true },
            { label: 'Social compliance audit (SA8000/BSCI)', type: 'f', unitOrOptions: '', required: true, why: 'Tier-1 and Tier-2 facility labor standard' },
            { label: 'Take-back scheme certificate', type: 'f', unitOrOptions: '', required: false },
          ],
        },
      ],
    },
    con: {
      id: 'con',
      name: 'Construction Products',
      icon: '🏗️',
      color: '#64748b',
      regulation: 'CPR (EU) 2024/3110 Mandate',
      subcategories: ['Cement and Concrete', 'Steel and Rebar', 'Insulation Materials', 'Windows and Doors', 'Timber & Wood'],
      keywords: 'cement concrete steel rebar brick insulation window timber wood structure',
      sections: [
        {
          title: 'Declared Performance & Compliance',
          fields: [
            { label: 'Declaration of performance ID', type: 't', unitOrOptions: '', required: true, why: 'Mandatory DoP reference' },
            { label: 'CE / UKCA marking status', type: 's', unitOrOptions: 'CE Marked|UKCA|Dual CE/UKCA|Pending', required: true },
            { label: 'Fire reaction class', type: 's', unitOrOptions: 'A1|A2|B|C|D|E|F', required: true },
            { label: 'Declared functional unit', type: 's', unitOrOptions: 'm³|m²|kg|tonne|piece', required: true },
            { label: 'Estimated design service life', type: 'n', unitOrOptions: 'years', required: false },
          ],
        },
        {
          title: 'Embodied Carbon & EPD',
          fields: [
            { label: 'Embodied carbon (A1-A3 stages)', type: 'n', unitOrOptions: 'kg CO₂e/unit', required: true, why: 'From verified Environmental Product Declaration' },
            { label: 'Recycled material content', type: 'p', unitOrOptions: '%', required: true },
            { label: 'Hazardous substances declaration', type: 't', unitOrOptions: '', required: true },
            { label: 'EPD verification document', type: 'f', unitOrOptions: '', required: true, why: 'ISO 14025 / EN 15804 compliant' },
          ],
        },
        {
          title: 'End-of-Life & Circularity',
          fields: [
            { label: 'Deconstruction & reuse route', type: 't', unitOrOptions: '', required: true },
            { label: 'Installation and maintenance guide', type: 'f', unitOrOptions: '', required: false },
          ],
        },
      ],
    },
    ele: {
      id: 'ele',
      name: 'Electronics & Appliances',
      icon: '💻',
      color: '#3b82f6',
      regulation: 'ESPR + Ecodesign Directives',
      subcategories: ['Smartphone', 'Tablet', 'Laptop / PC', 'Home Appliance', 'Display & Monitor'],
      keywords: 'phone laptop tablet electronic screen charger pcb chip computer appliance',
      sections: [
        {
          title: 'Repairability & Lifetime',
          fields: [
            { label: 'EU repairability score index', type: 'n', unitOrOptions: '/10', required: true, why: 'Official 1-10 index' },
            { label: 'Spare parts guaranteed availability', type: 'n', unitOrOptions: 'years', required: true },
            { label: 'Security & OS updates commitment', type: 'n', unitOrOptions: 'years', required: true },
            { label: 'Battery replaceability', type: 's', unitOrOptions: 'Tool-free user replaceable|Commercial tools required|Authorized service only', required: true },
            { label: 'Ingress protection rating', type: 's', unitOrOptions: 'None|IP54|IP67|IP68', required: false },
          ],
        },
        {
          title: 'Energy & Critical Raw Materials',
          fields: [
            { label: 'Energy efficiency class', type: 's', unitOrOptions: 'A|B|C|D|E|F|G', required: true },
            { label: 'Critical raw materials listed', type: 't', unitOrOptions: '', required: true, why: 'e.g. Cobalt, Neodymium, Tantalum, Gold' },
            { label: 'Post-consumer recycled plastic', type: 'p', unitOrOptions: '%', required: false },
            { label: 'Total carbon footprint', type: 'n', unitOrOptions: 'kg CO₂e', required: true },
          ],
        },
        {
          title: 'Conformity & Repair Manuals',
          fields: [
            { label: 'Official repair & schematics manual', type: 'f', unitOrOptions: '', required: true },
            { label: 'EU declaration of conformity', type: 'f', unitOrOptions: '', required: true },
            { label: 'Cryptographic data-wipe guide', type: 'f', unitOrOptions: '', required: false },
          ],
        },
      ],
    },
    ict: {
      id: 'ict',
      name: 'ICT & Network Infrastructure',
      icon: '📡',
      color: '#14b8a6',
      regulation: 'ESPR Enterprise ICT Standards',
      subcategories: ['Enterprise Server', 'Router / Core Switch', 'SAN Storage Array', 'Telecom Transceiver'],
      keywords: 'server router switch storage network rack ict datacenter telecom',
      sections: [
        {
          title: 'Power Efficiency & Data Security',
          fields: [
            { label: 'Typical operating power draw', type: 'n', unitOrOptions: 'W', required: true },
            { label: 'Low-power idle draw', type: 'n', unitOrOptions: 'W', required: true },
            { label: 'Guaranteed firmware support date', type: 't', unitOrOptions: 'YYYY-MM', required: true },
            { label: 'Secure data erasure standard', type: 's', unitOrOptions: 'NIST SP 800-88 Built-in|DoD 5220.22-M|External Tool Required|None', required: true },
          ],
        },
        {
          title: 'Materials & Hazardous Restrictions',
          fields: [
            { label: 'Critical raw materials declaration', type: 't', unitOrOptions: '', required: true },
            { label: 'Recycled metal content', type: 'p', unitOrOptions: '%', required: false },
            { label: 'RoHS / REACH non-use certificate summary', type: 't', unitOrOptions: '', required: true },
            { label: 'Manufacturing carbon footprint', type: 'n', unitOrOptions: 'kg CO₂e', required: true },
          ],
        },
        {
          title: 'Conformity & Disassembly',
          fields: [
            { label: 'EU Declaration of Conformity', type: 'f', unitOrOptions: '', required: true },
            { label: 'Datacenter disassembly instructions', type: 'f', unitOrOptions: '', required: true },
            { label: 'Vulnerability disclosure policy', type: 'f', unitOrOptions: '', required: false },
          ],
        },
      ],
    },
    fur: {
      id: 'fur',
      name: 'Furniture & Timber',
      icon: '🪑',
      color: '#d97706',
      regulation: 'ESPR + EU Deforestation Reg (EUDR)',
      subcategories: ['Ergonomic Seating', 'Workstations & Tables', 'Modular Storage', 'Contract Furniture'],
      keywords: 'chair table desk sofa wood timber furniture shelf cabinet office',
      sections: [
        {
          title: 'Materials & Timber Origin (EUDR)',
          fields: [
            { label: 'Primary material composition', type: 't', unitOrOptions: '', required: true, why: 'e.g. FSC Solid Oak, Powder-coated Steel, Wool' },
            { label: 'Wood botanical species', type: 't', unitOrOptions: '', required: true, why: 'Latin botanical genus & species' },
            { label: 'Harvest geo-location / country', type: 't', unitOrOptions: '', required: true, why: 'Mandatory EUDR deforestation polygon/country' },
            { label: 'FSC / PEFC Chain-of-Custody license', type: 't', unitOrOptions: '', required: false },
            { label: 'Formaldehyde emission class', type: 's', unitOrOptions: 'E0 (Zero)|E1 (Standard)|E2|CARB P2 Certified', required: true },
          ],
        },
        {
          title: 'Durability & Disassembly',
          fields: [
            { label: 'Complete disassembly time', type: 'n', unitOrOptions: 'min', required: false },
            { label: 'Modular replaceable components', type: 't', unitOrOptions: '', required: false },
            { label: 'Recycled content share', type: 'p', unitOrOptions: '%', required: true },
            { label: 'Flame retardant formulation', type: 's', unitOrOptions: 'None (Natural)|Halogen-free Bio-retardant|Halogenated (Restricted)', required: true },
          ],
        },
        {
          title: 'Care & Certification Documents',
          fields: [
            { label: 'Assembly, maintenance & care guide', type: 'f', unitOrOptions: '', required: true },
            { label: 'FSC / PEFC chain of custody certificate', type: 'f', unitOrOptions: '', required: true },
          ],
        },
      ],
    },
    mat: {
      id: 'mat',
      name: 'Mattresses & Bedding',
      icon: '🛏️',
      color: '#8b5cf6',
      regulation: 'ESPR Mattress Circularity Mandate',
      subcategories: ['Pocket Spring', 'Natural Latex', 'High-Resilience PU Foam', 'Circular Hybrid'],
      keywords: 'mattress bed foam sleep latex spring bedding',
      sections: [
        {
          title: 'Construction & Material Architecture',
          fields: [
            { label: 'Core architecture material', type: 's', unitOrOptions: 'PU Eco-Foam|Natural Organic Latex|Pocket Springs (Recycled Steel)|Memory Foam', required: true },
            { label: 'Core foam density', type: 'n', unitOrOptions: 'kg/m³', required: true },
            { label: 'Firmness index', type: 's', unitOrOptions: 'Soft|Medium|Firm|Extra-Firm', required: false },
            { label: 'Removable cover fabric composition', type: 't', unitOrOptions: '', required: true },
          ],
        },
        {
          title: 'Fire Safety & Chemical Emissions',
          fields: [
            { label: 'Flammability compliance standard', type: 's', unitOrOptions: 'EN 597 (EU)|BS 7177 (UK)|16 CFR 1633 (US)', required: true },
            { label: 'VOC & chemical emission class', type: 't', unitOrOptions: '', required: true, why: 'e.g. CertiPUR / OEKO-TEX Standard 100' },
            { label: 'Eco-labels & certifications', type: 't', unitOrOptions: '', required: false },
            { label: 'Chemical safety data sheet', type: 'f', unitOrOptions: '', required: true },
          ],
        },
        {
          title: 'Circularity & Lifetime Warranty',
          fields: [
            { label: 'End-of-life recyclability percentage', type: 'p', unitOrOptions: '%', required: true },
            { label: 'Recycled material percentage', type: 'p', unitOrOptions: '%', required: false },
            { label: 'National take-back programme partner', type: 't', unitOrOptions: '', required: false },
            { label: 'Manufacturer warranty period', type: 'n', unitOrOptions: 'years', required: true },
          ],
        },
      ],
    },
    chem: {
      id: 'chem',
      name: 'Chemicals & Polymers',
      icon: '🧪',
      color: '#10b981',
      regulation: 'REACH + CLP + ESPR Substances',
      subcategories: ['Specialty Industrial Chemical', 'Surface Coating & Paint', 'Bio-Polymer / Resin', 'Eco Solvent'],
      keywords: 'paint resin solvent chemical polymer coating liquid reach cas',
      sections: [
        {
          title: 'Substance Identity & Registration',
          fields: [
            { label: 'CAS Registry number', type: 't', unitOrOptions: '000-00-0', required: true },
            { label: 'EC / List number', type: 't', unitOrOptions: '', required: true },
            { label: 'EU REACH registration number', type: 't', unitOrOptions: '', required: true },
            { label: 'Active chemical purity', type: 'p', unitOrOptions: '%', required: true },
          ],
        },
        {
          title: 'Hazard Classification & Safe Use',
          fields: [
            { label: 'GHS signal word', type: 's', unitOrOptions: 'None|Warning|Danger', required: true },
            { label: 'GHS Hazard statements', type: 't', unitOrOptions: '', required: true, why: 'e.g. H315, H319, H411' },
            { label: 'SVHC candidate presence (>0.1% w/w)', type: 's', unitOrOptions: 'No SVHC present|Yes (Documented in SDS)', required: true },
            { label: 'Safe handling & storage protocol', type: 't', unitOrOptions: '', required: true },
            { label: '16-Section Safety Data Sheet (SDS)', type: 'f', unitOrOptions: '', required: true },
          ],
        },
        {
          title: 'Carbon Footprint & End of Life',
          fields: [
            { label: 'Product carbon footprint', type: 'n', unitOrOptions: 'kg CO₂e/kg', required: false },
            { label: 'Bio-based carbon share', type: 'p', unitOrOptions: '%', required: false },
            { label: 'Prescribed disposal & neutralisation route', type: 't', unitOrOptions: '', required: true },
          ],
        },
      ],
    },
  };

  // State Management
  selectedCategoryKey: string | null = null;
  selectedSubcategory = '';
  categorySearchQuery = '';

  currentStepIndex = 0; // 0: BOM, 1: Identity, 2..N: Sector sections, N+1: Chain of Custody, N+2: Review
  activeLens: number = 2; // 0: Public Visitor, 1: Regulator, 2: Our Team
  lensLabels = ['Public visitor', 'Regulator', 'Our team'];
  visibilityLabels = ['Public', 'Authority', 'Private'];
  visibilityIcons = ['🌐', '🏛', '🔒'];

  // Smart Fill
  smartFillOpen = false;
  smartFillText = '';
  smartFillMessage = '';

  // Values storage
  fieldValues: Record<string, string> = {};
  fieldVisibilities: Record<string, number> = {}; // 0: Public, 1: Authority, 2: Private

  // Custom fields
  customFields: CustomFieldItem[] = [];
  customFieldSeq = 100;

  // Step 0: Products & Quantities (BOM)
  productCatalog: ProductCatalogItem[] = [
    { id: 1, name: 'Zenith EV UltraPack Cell 75Ah', category: 'bat', unit: 'unit', usedCount: 4 },
    { id: 2, name: 'High-Purity Battery Grade Lithium Hydroxide', category: 'bat', unit: 'kg', usedCount: 2 },
    { id: 3, name: 'Recycled Cobalt Sulphate (99.8%)', category: 'bat', unit: 'kg', usedCount: 3 },
    { id: 4, name: 'GOTS Certified Organic Raw Cotton', category: 'tex', unit: 'kg', usedCount: 5 },
    { id: 5, name: 'Post-Consumer Recycled Polyester Fibre', category: 'tex', unit: 'kg', usedCount: 6 },
    { id: 6, name: 'Low-Carbon Structural Steel Rebar B500B', category: 'con', unit: 't', usedCount: 8 },
    { id: 7, name: 'Recycled Aggregates Concrete Matrix C30/37', category: 'con', unit: 'm³', usedCount: 3 },
    { id: 8, name: 'Recycled Aluminum Housing Alloy 6063-T6', category: 'ele', unit: 'kg', usedCount: 2 },
    { id: 9, name: 'Halogen-Free Multi-Layer PCB Assembly', category: 'ele', unit: 'unit', usedCount: 3 },
    { id: 10, name: 'FSC Certified Solid European White Oak', category: 'fur', unit: 'm³', usedCount: 4 },
    { id: 11, name: '100% Post-Consumer rPET Circular Polymer', category: 'chem', unit: 'kg', usedCount: 7 },
  ];
  bomSearchQuery = '';
  bomFilterAll = false;
  passportBom: PassportBOMItem[] = [];
  showNewProductForm = false;
  newProductName = '';
  newProductType = 'Unit';
  newProductCategory = 'bat';
  newProductError = '';

  // Unit categories
  unitTypes: Record<string, string[]> = {
    Mass: ['kg', 't', 'g', 'mg'],
    Unit: ['unit', 'piece', 'set'],
    Volume: ['l', 'm³', 'ml'],
    Area: ['m²', 'cm²'],
    Length: ['m', 'cm', 'mm', 'km'],
  };

  // Step 5: Chain of Custody
  publishedPassportsCatalog = [
    { pid: 'DPP-BAT-8842', p: 'Monk Cathode Active Material NMC-811', f: 'Nordic Minerals AB (Kiruna, SE)', q: '2,500 kg', c: 'bat' },
    { pid: 'DPP-BAT-1290', p: 'Raw Synthetic Graphite Anode Material', f: 'SGL Carbon GmbH (DE)', q: '1,200 kg', c: 'bat' },
    { pid: 'DPP-TXT-0104', p: 'Organic Ring-Spun Cotton Yarn 30/1', f: 'EcoSpun Fibers (Braga, PT)', q: '5,000 kg', c: 'tex' },
    { pid: 'DPP-CON-4410', p: 'Green Hydrogen Direct Reduced Iron (DRI)', f: 'SSAB Zero Steel (Luleå, SE)', q: '500 t', c: 'con' },
    { pid: 'DPP-PKG-9102', p: 'Food-Grade Recycled Polyethylene Pellets', f: 'Circular Polymers Europe (Lyon, FR)', q: '10,000 kg', c: 'chem' },
  ];
  chainSearchQuery = '';
  chainSources: ChainSourceItem[] = [];
  chainVisibility = 0; // 0: Public, 1: Authority, 2: Private
  showNewChainForm = false;
  newChainProduct = '';
  newChainSupplier = 'Nordic Minerals AB';
  newChainQuantity = '';
  newChainUnit = 'kg';
  newChainError = '';

  supplierDirectory = [
    'Nordic Minerals AB (Kiruna, SE)',
    'SGL Carbon Technologies (Wiesbaden, DE)',
    'BlueCycle Spinning & Weaving (Valencia, ES)',
    'SSAB Zero Green Steel (Luleå, SE)',
    'Monkspaces Eco-Refining (Munich, DE)',
    'EcoContainer Circular Polymers (Lyon, FR)',
    'Alpine Timber Forest Products (Innsbruck, AT)',
  ];

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    // Reset state
    this.resetStudio();
  }

  resetStudio(): void {
    this.selectedCategoryKey = null;
    this.selectedSubcategory = '';
    this.currentStepIndex = 0;
    this.fieldValues = {};
    this.fieldVisibilities = {};
    this.customFields = [];
    this.passportBom = [];
    this.chainSources = [];
    this.activeLens = 2;
    this.smartFillOpen = false;
  }

  // --- Category Selection Stage ---
  get categoryList(): CategoryDef[] {
    const q = this.categorySearchQuery.toLowerCase().trim();
    return Object.values(this.categories).filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.keywords.toLowerCase().includes(q) ||
        c.regulation.toLowerCase().includes(q)
    );
  }

  selectCategory(catKey: string): void {
    this.selectedCategoryKey = catKey;
    const cat = this.categories[catKey];
    this.selectedSubcategory = cat.subcategories[0] || '';
    this.currentStepIndex = 0;

    // Seed default product into BOM if empty
    const matchingProduct = this.productCatalog.find((p) => p.category === catKey);
    if (matchingProduct && this.passportBom.length === 0) {
      this.passportBom.push({
        id: matchingProduct.id,
        name: matchingProduct.name,
        category: matchingProduct.category,
        amount: '100',
        unit: matchingProduct.unit,
      });
    }

    // Set default core product name if blank
    if (!this.fieldValues['1_name']) {
      this.fieldValues['1_name'] = matchingProduct ? matchingProduct.name : `New ${cat.name} Product`;
      this.fieldValues['1_batch'] = `LOT-${catKey.toUpperCase()}-${new Date().getFullYear()}-001`;
      this.fieldValues['1_facility'] = 'Monkspaces Eco-Facility 01 (Munich, DE)';
      this.fieldValues['1_gtin'] = `040${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    }
  }

  backToCategorySelect(): void {
    this.selectedCategoryKey = null;
  }

  // --- Stepper Navigation & Steps Calculation ---
  get activeCategory(): CategoryDef | null {
    return this.selectedCategoryKey ? this.categories[this.selectedCategoryKey] : null;
  }

  get workflowSteps(): Array<{ title: string; subtitle: string; isComplete: boolean; isOptional: boolean }> {
    if (!this.activeCategory) return [];

    const steps = [
      {
        title: 'Products & Quantities',
        subtitle: this.passportBom.length ? `${this.passportBom.length} materials selected` : '1 legal field needed',
        isComplete: this.passportBom.length > 0 && this.passportBom.every((b) => +b.amount > 0),
        isOptional: false,
      },
      {
        title: 'Product Identity & Origin',
        subtitle: this.getSectionCompletionSubtitle(1, this.getCoreIdentityFields()),
        isComplete: this.isSectionComplete(1, this.getCoreIdentityFields()),
        isOptional: false,
      },
    ];

    this.activeCategory.sections.forEach((sec, idx) => {
      const stepIdx = idx + 2;
      steps.push({
        title: sec.title,
        subtitle: this.getSectionCompletionSubtitle(stepIdx, sec.fields),
        isComplete: this.isSectionComplete(stepIdx, sec.fields),
        isOptional: sec.fields.every((f) => !f.required),
      });
    });

    const chainStepIdx = this.activeCategory.sections.length + 2;
    steps.push({
      title: 'Chain of Custody',
      subtitle: this.chainSources.length ? `${this.chainSources.length} upstream sources` : 'Optional traceability',
      isComplete: true,
      isOptional: true,
    });

    steps.push({
      title: 'Review & Publish',
      subtitle: 'Multi-audience lens preview',
      isComplete: this.isAllLegalComplete(),
      isOptional: false,
    });

    return steps;
  }

  get totalWorkflowStepsCount(): number {
    return this.workflowSteps.length;
  }

  goToStep(index: number): void {
    if (index >= 0 && index < this.totalWorkflowStepsCount) {
      this.currentStepIndex = index;
    }
  }

  nextStep(): void {
    if (this.currentStepIndex < this.totalWorkflowStepsCount - 1) {
      this.currentStepIndex++;
    }
  }

  prevStep(): void {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
    }
  }

  // --- Field Key & Identity Helpers ---
  getCoreIdentityFields(): FieldDef[] {
    return [
      { label: 'Product name', type: 't', unitOrOptions: '', required: true, why: 'Shown at the top of the public GS1 page' },
      { label: 'Serial / lot batch number', type: 't', unitOrOptions: '', required: true, why: 'Uniquely identifies this production run or unit' },
      { label: 'Manufacturing facility & country', type: 't', unitOrOptions: '', required: true, why: 'Origin plant name, city and ISO country code' },
      { label: 'GTIN / Model identification', type: 't', unitOrOptions: '', required: false, why: 'GS1 Global Trade Item Number for retail matching' },
    ];
  }

  getFieldKey(stepIndex: number, field: FieldDef): string {
    return `${this.selectedCategoryKey}_${stepIndex}_${field.label.replace(/\W/g, '_').toLowerCase()}`;
  }

  getFieldValue(stepIndex: number, field: FieldDef): string {
    const k = this.getFieldKey(stepIndex, field);
    return this.fieldValues[k] || '';
  }

  setFieldValue(stepIndex: number, field: FieldDef, value: string): void {
    const k = this.getFieldKey(stepIndex, field);
    this.fieldValues[k] = value;
  }

  getFieldVisibility(stepIndex: number, field: FieldDef): number {
    const k = this.getFieldKey(stepIndex, field);
    return this.fieldVisibilities[k] !== undefined ? this.fieldVisibilities[k] : 0;
  }

  toggleFieldVisibility(stepIndex: number, field: FieldDef): void {
    const k = this.getFieldKey(stepIndex, field);
    const curr = this.getFieldVisibility(stepIndex, field);
    this.fieldVisibilities[k] = (curr + 1) % 3;
  }

  handleFileUpload(stepIndex: number, field: FieldDef): void {
    const k = this.getFieldKey(stepIndex, field);
    const current = this.fieldValues[k];
    if (current) {
      this.fieldValues[k] = '';
    } else {
      this.fieldValues[k] = `${field.label.replace(/\W/g, '_').toLowerCase()}_verified.pdf`;
      this.toastService.show(`Attached document: "${this.fieldValues[k]}"`, 'info', 2000);
    }
  }

  // --- Completion Counters & Calculations ---
  isSectionComplete(stepIndex: number, fields: FieldDef[]): boolean {
    const reqs = fields.filter((f) => f.required);
    return reqs.every((f) => !!this.getFieldValue(stepIndex, f));
  }

  getSectionCompletionSubtitle(stepIndex: number, fields: FieldDef[]): string {
    const reqs = fields.filter((f) => f.required);
    if (!reqs.length) return 'Optional fields';
    const filled = reqs.filter((f) => !!this.getFieldValue(stepIndex, f)).length;
    return `${filled}/${reqs.length} legal fields`;
  }

  isAllLegalComplete(): boolean {
    if (!this.passportBom.length || !this.passportBom.every((b) => +b.amount > 0)) return false;
    if (!this.isSectionComplete(1, this.getCoreIdentityFields())) return false;
    if (!this.activeCategory) return true;

    for (let i = 0; i < this.activeCategory.sections.length; i++) {
      const sec = this.activeCategory.sections[i];
      if (!this.isSectionComplete(i + 2, sec.fields)) return false;
    }
    return true;
  }

  get overallCompletionPercentage(): number {
    if (!this.activeCategory) return 0;
    let totalReq = 1 + this.getCoreIdentityFields().filter((f) => f.required).length;
    let filledReq = (this.passportBom.length && this.passportBom.every((b) => +b.amount > 0)) ? 1 : 0;
    filledReq += this.getCoreIdentityFields().filter((f) => f.required && !!this.getFieldValue(1, f)).length;

    this.activeCategory.sections.forEach((sec, idx) => {
      const stepIdx = idx + 2;
      sec.fields.forEach((f) => {
        if (f.required) {
          totalReq++;
          if (this.getFieldValue(stepIdx, f)) filledReq++;
        }
      });
    });

    return totalReq ? Math.round((filledReq / totalReq) * 100) : 100;
  }

  // --- Smart Fill AI Parser ---
  toggleSmartFill(): void {
    this.smartFillOpen = !this.smartFillOpen;
  }

  applySmartFill(): void {
    if (!this.smartFillText.trim()) {
      this.smartFillMessage = 'Please paste spec text first.';
      return;
    }

    let matchCount = 0;
    const lines = this.smartFillText.split('\n');

    // Parse all sections & fields
    const allFieldPairs: Array<{ stepIdx: number; field: FieldDef }> = [
      ...this.getCoreIdentityFields().map((f) => ({ stepIdx: 1, field: f })),
    ];
    if (this.activeCategory) {
      this.activeCategory.sections.forEach((sec, idx) => {
        sec.fields.forEach((f) => allFieldPairs.push({ stepIdx: idx + 2, field: f }));
      });
    }

    allFieldPairs.forEach(({ stepIdx, field }) => {
      if (field.type === 'f') return; // skip file uploads

      const escapedLabel = field.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const reg = new RegExp(`${escapedLabel}\\s*[:=]\\s*([^\\n]+)`, 'i');
      const match = this.smartFillText.match(reg);

      if (match && match[1]) {
        const rawVal = match[1].trim();
        if (field.type === 's') {
          const opts = field.unitOrOptions.split('|');
          const foundOpt = opts.find((o) => rawVal.toLowerCase().includes(o.toLowerCase()));
          if (foundOpt) {
            this.setFieldValue(stepIdx, field, foundOpt);
            matchCount++;
          }
        } else if (field.type === 'n' || field.type === 'p') {
          const numMatch = rawVal.match(/-?\d+(\.\d+)?/);
          if (numMatch) {
            this.setFieldValue(stepIdx, field, numMatch[0]);
            matchCount++;
          }
        } else {
          this.setFieldValue(stepIdx, field, rawVal);
          matchCount++;
        }
      }
    });

    if (matchCount > 0) {
      this.smartFillMessage = `✨ Successfully auto-populated ${matchCount} specification fields!`;
      this.toastService.show(`Smart Fill: Populated ${matchCount} fields`, 'success', 2500);
    } else {
      this.smartFillMessage = 'No matching field names found. Format like: "Carbon footprint: 12.4" or "Rated capacity: 75"';
    }
  }

  loadSampleSmartFill(): void {
    if (!this.activeCategory) return;
    const samples: string[] = [
      `Product name: ${this.activeCategory.name} Pro Reference Model`,
      `Serial / lot batch number: LOT-${this.selectedCategoryKey?.toUpperCase()}-2026-X99`,
      `Manufacturing facility & country: Monkspaces Smart Hub (Munich, DE)`,
    ];

    this.activeCategory.sections.forEach((sec, idx) => {
      sec.fields.forEach((f) => {
        if (f.type === 'n') samples.push(`${f.label}: ${20 + f.label.length * 2}`);
        else if (f.type === 'p') samples.push(`${f.label}: ${Math.min(95, 30 + f.label.length * 3)}`);
        else if (f.type === 's') samples.push(`${f.label}: ${f.unitOrOptions.split('|')[0]}`);
        else if (f.type === 't') samples.push(`${f.label}: Certified compliant ${f.label.toLowerCase()}`);
      });
    });

    this.smartFillText = samples.join('\n');
    this.smartFillMessage = 'Sample data generated. Click "Auto-Fill Fields" to populate.';
  }

  // --- Step 0: BOM / Product Bag Logic ---
  get filteredProductCatalog(): ProductCatalogItem[] {
    const q = this.bomSearchQuery.toLowerCase().trim();
    return this.productCatalog.filter((p) => {
      const matchesCategory = this.bomFilterAll || p.category === this.selectedCategoryKey || p.category === 'oth';
      const matchesSearch = !q || p.name.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }

  isInBom(productId: number): boolean {
    return this.passportBom.some((b) => b.id === productId);
  }

  addToBom(product: ProductCatalogItem): void {
    if (!this.isInBom(product.id)) {
      this.passportBom.push({
        id: product.id,
        name: product.name,
        category: product.category,
        amount: '1',
        unit: product.unit,
        imgUrl: product.imgUrl,
      });
    }
  }

  removeFromBom(productId: number): void {
    this.passportBom = this.passportBom.filter((b) => b.id !== productId);
  }

  getUnitOptionsFor(unit: string): string[] {
    for (const [typeKey, units] of Object.entries(this.unitTypes)) {
      if (units.includes(unit)) return units;
    }
    return [unit];
  }

  get bomTotalSummary(): string[] {
    const totals: Record<string, number> = {};
    this.passportBom.forEach((b) => {
      const n = +b.amount;
      if (n > 0) {
        totals[b.unit] = (totals[b.unit] || 0) + n;
      }
    });
    return Object.entries(totals).map(([u, val]) => `${+val.toFixed(2)} ${u}`);
  }

  createNewProductInLibrary(): void {
    if (!this.newProductName.trim()) {
      this.newProductError = 'Please enter a product name.';
      return;
    }

    const defaultUnit = this.unitTypes[this.newProductType]?.[0] || 'unit';
    const newId = Date.now();
    const newProd: ProductCatalogItem = {
      id: newId,
      name: this.newProductName.trim(),
      category: this.selectedCategoryKey || 'bat',
      unit: defaultUnit,
      usedCount: 0,
    };

    this.productCatalog.unshift(newProd);
    this.addToBom(newProd);
    this.newProductName = '';
    this.newProductError = '';
    this.showNewProductForm = false;
    this.toastService.show(`Created & added "${newProd.name}" to library`, 'success', 2500);
  }

  // --- Step 5: Chain of Custody Logic ---
  get filteredPublishedPassports() {
    const q = this.chainSearchQuery.toLowerCase().trim();
    return this.publishedPassportsCatalog.filter(
      (p) => !q || p.pid.toLowerCase().includes(q) || p.p.toLowerCase().includes(q) || p.f.toLowerCase().includes(q)
    );
  }

  isChainConnected(pid: string): boolean {
    return this.chainSources.some((c) => c.pid === pid);
  }

  connectChainSource(item: any): void {
    if (!this.isChainConnected(item.pid)) {
      const u = item.q.split(' ')[1] || 'kg';
      const a = item.q.split(' ')[0] || '100';
      this.chainSources.push({
        pid: item.pid,
        productName: item.p,
        supplier: item.f,
        amount: a,
        unit: u,
        category: item.c,
      });
    }
  }

  disconnectChainSource(pid: string): void {
    this.chainSources = this.chainSources.filter((c) => c.pid !== pid);
  }

  toggleChainVisibility(): void {
    this.chainVisibility = (this.chainVisibility + 1) % 3;
  }

  createDraftChainPassport(): void {
    if (!this.newChainProduct.trim()) {
      this.newChainError = 'Please specify the source product or component name.';
      return;
    }
    if (!+this.newChainQuantity) {
      this.newChainError = 'Please enter a valid quantity amount.';
      return;
    }

    const draftId = `DPP-SRC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSource: ChainSourceItem = {
      pid: draftId,
      productName: this.newChainProduct.trim(),
      supplier: this.newChainSupplier,
      amount: this.newChainQuantity.trim(),
      unit: this.newChainUnit,
      category: this.selectedCategoryKey || 'bat',
      isNewDraft: true,
    };

    this.chainSources.push(newSource);
    this.showNewChainForm = false;
    this.newChainProduct = '';
    this.newChainQuantity = '';
    this.newChainError = '';
    this.toastService.show(`Connected draft upstream source: ${draftId}`, 'success', 2500);
  }

  // --- Custom Fields Logic ---
  getCustomFieldsForSection(stepIndex: number): CustomFieldItem[] {
    return this.customFields.filter((c) => c.sectionIndex === stepIndex);
  }

  addCustomField(stepIndex: number, type: 't' | 'f'): void {
    this.customFields.push({
      id: ++this.customFieldSeq,
      sectionIndex: stepIndex,
      name: '',
      type,
      textValue: '',
      fileName: '',
      fileSize: 0,
      visibility: 0,
    });
  }

  removeCustomField(id: number): void {
    this.customFields = this.customFields.filter((c) => c.id !== id);
  }

  toggleCustomFieldVisibility(cf: CustomFieldItem): void {
    cf.visibility = (cf.visibility + 1) % 3;
  }

  // --- Live Passport Preview Multi-Audience Masking ---
  get currentProductName(): string {
    return this.fieldValues['1_name'] || (this.passportBom[0] ? this.passportBom[0].name : 'Untitled Passport');
  }

  get visibleFieldsForCurrentLens(): { visibleCount: number; totalCount: number } {
    let visible = 0;
    let total = 0;

    // Core fields
    this.getCoreIdentityFields().forEach((f) => {
      const val = this.getFieldValue(1, f);
      if (val) {
        total++;
        const vis = this.getFieldVisibility(1, f);
        if (vis <= this.activeLens) visible++;
      }
    });

    // Dynamic section fields
    if (this.activeCategory) {
      this.activeCategory.sections.forEach((sec, idx) => {
        const stepIdx = idx + 2;
        sec.fields.forEach((f) => {
          const val = this.getFieldValue(stepIdx, f);
          if (val) {
            total++;
            const vis = this.getFieldVisibility(stepIdx, f);
            if (vis <= this.activeLens) visible++;
          }
        });
      });
    }

    return { visibleCount: visible, totalCount: total };
  }

  // --- Final Publish & Save Actions ---
  publishPassport(): void {
    if (!this.isAllLegalComplete()) {
      this.toastService.show('Please fill in all mandatory legal fields before publishing.', 'error', 3000);
      return;
    }

    const newId = `DPP-${(this.selectedCategoryKey || 'GEN').toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const result: CreatedPassportResult = {
      id: newId,
      productName: this.currentProductName,
      category: this.activeCategory?.name || 'General',
      industryCode: (this.selectedCategoryKey === 'tex'
        ? 'TEXTILES'
        : this.selectedCategoryKey === 'bat'
        ? 'BATTERIES'
        : this.selectedCategoryKey === 'ele'
        ? 'ELECTRONICS'
        : this.selectedCategoryKey === 'chem'
        ? 'PACKAGING'
        : 'ALL') as any,
      materialComposition: this.passportBom.length
        ? this.passportBom.map((b) => `${b.name} (${b.amount} ${b.unit})`).join(', ')
        : 'Standard Verified Composition',
      recycledContentPct: parseInt(this.fieldValues[`${this.selectedCategoryKey}_3_recycled_cobalt_share`] || '35', 10),
      carbonKgCo2e: parseFloat(this.fieldValues[`${this.selectedCategoryKey}_3_carbon_footprint`] || '14.2'),
      facilityOrigin: this.fieldValues['1_facility'] || 'Monkspaces Verified Facility',
      status: 'published',
      gtin: this.fieldValues['1_gtin'] || '0401234567899',
      modelOrBatch: this.fieldValues['1_batch'] || 'LOT-2026-X1',
      quantityStr: this.passportBom[0] ? `${this.passportBom[0].amount} ${this.passportBom[0].unit}` : '1 unit',
      digitalLink: `https://dpp.monkspaces.com/id/01/${this.fieldValues['1_gtin'] || '0401234567899'}`,
    };

    this.passportCreated.emit(result);
    this.toastService.show(`Passport ${newId} published successfully!`, 'success', 3500);
    this.closeModal();
  }

  saveAsDraft(): void {
    const draftId = `DPP-${(this.selectedCategoryKey || 'GEN').toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const result: CreatedPassportResult = {
      id: draftId,
      productName: this.currentProductName,
      category: this.activeCategory?.name || 'General',
      industryCode: 'ALL',
      materialComposition: this.passportBom.length ? this.passportBom.map((b) => b.name).join(', ') : 'Draft Materials',
      recycledContentPct: 0,
      carbonKgCo2e: 0,
      facilityOrigin: this.fieldValues['1_facility'] || 'Draft Facility',
      status: 'draft',
      gtin: this.fieldValues['1_gtin'] || '0400000000000',
      modelOrBatch: this.fieldValues['1_batch'] || 'DRAFT-RUN',
      quantityStr: this.passportBom[0] ? `${this.passportBom[0].amount} ${this.passportBom[0].unit}` : '1 unit',
      digitalLink: `https://dpp.monkspaces.com/id/01/draft-${draftId}`,
    };

    this.passportCreated.emit(result);
    this.toastService.show(`Saved ${draftId} as draft`, 'info', 3000);
    this.closeModal();
  }

  closeModal(): void {
    this.isOpen = false;
    this.close.emit();
  }
}
