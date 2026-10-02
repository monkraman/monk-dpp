/**
 * DPP Platform Angular Models
 * Based on EU Battery Regulation 2023/1542
 */

// Base entity interface
export interface BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// User model
export interface User extends BaseModel {
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'org_admin' | 'product_manager' | 'compliance' | 'viewer';
  status: 'active' | 'inactive';
  mfaEnabled: boolean;
}

// Organization model
export interface Organization extends BaseModel {
  name: string;
  email: string;
  logoUrl?: string;
  tenantId: string;
  userCount?: number;
}

// Product model - Battery specific (71 fields split by visibility)
export interface Product extends BaseModel {
  organizationId: string;
  
  // Public Fields (Annex VI)
  productIdentifier: string;  // GS1 Digital Link URI
  batteryCategory: 'EV' | 'LMT' | 'Industrial';
  massKg: number;
  energyCapacityWh: number;
  chemistry: string;  // NMC, LFP, Li-ion, etc.
  hazardousSubstances: string[];  // Cd, Pb, etc.
  manufactureDate: string;  // ISO date
  gtin: string;
  serialNumber: string;
  brandName: string;
  modelName: string;
  
  // Professional Fields (Annex XIII)
  nominalVoltage: number;
  maxVoltage: number;
  originalPowerWatts: number;
  cycleLifeCycles?: number;
  roundTripEfficiency?: number;
  batteryLifetimeYears?: number;
  partsMaterials: string;
  sparePartsSupplier: string;  // GLN/contact
  
  // Authority Fields
  manufacturerName: string;
  manufacturerPlantLocation: string;
  euConformityDocs?: string[];  // URLs
  productLifeInstructions?: string;  // Download URL
  
  // Metadata
  version: number;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  createdById: string;
}

// DPP (Digital Product Passport) model
export interface Dpp extends BaseModel {
  productId: string;
  organizationId: string;
  
  // Tiered Data
  publicData: {
    name: string;
    description: string;
    productIdentifier: string;
    batteryCategory: string;
    mass: number;
    energyCapacity: number;
    chemistry: string;
    manufactureDate: string;
    recyclingInformation: string;
  };
  
  professionalData: {
    nominalVoltage: number;
    maxVoltage: number;
    originalPower: number;
    cycleLife: number;
    roundTripEfficiency: number;
    batteryLifetime: number;
    partsAndMaterials: string;
    sparePartsSupplier: string;
  };
  
  authorityData: {
    manufacturer: string;
    plantLocation: string;
    conformityDocuments: string[];
  };
  
  // Publication
  qrCodeUrl: string;
  gs1DigitalLink: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  eidasSigned: boolean;
  
  // Versioning
  version: number;
  history?: DppHistoryEntry[];
}

// DPP History entry
export interface DppHistoryEntry {
  version: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  changes?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
}

// Audit Log entry
export interface AuditLog extends BaseModel {
  organizationId: string;
  userId: string;
  entityType: 'product' | 'dpp' | 'document' | 'user' | 'organization';
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'publish' | 'view' | 'login' | 'logout' | 'export';
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// JWT Token response
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// JWT Payload
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  organizationId: string;
  firstName?: string;
  lastName?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Document model
export interface Document extends BaseModel {
  productId: string;
  dppId?: string;
  type: 'certificate' | 'manual' | 'image' | 'pdf' | 'other';
  name: string;
  url: string;
  size: number;
  mimeType: string;
}

// Create product DTO
export interface CreateProductDto {
  batteryCategory: string;
  gtin: string;
  serialNumber: string;
  brandName: string;
  modelName: string;
  massKg: number;
  energyCapacityWh: number;
  chemistry: string;
  hazardousSubstances: string[];
  manufactureDate?: string;
  nominalVoltage?: number;
  maxVoltage?: number;
  originalPowerWatts?: number;
  cycleLifeCycles?: number;
  roundTripEfficiency?: number;
  batteryLifetimeYears?: number;
  partsMaterials?: string;
  sparePartsSupplier?: string;
  manufacturerName?: string;
  manufacturerPlantLocation?: string;
}

// Create DPP DTO
export interface CreateDppDto {
  productId: string;
  publicData: Record<string, any>;
  professionalData: Record<string, any>;
  authorityData: Record<string, any>;
  accessLevel: 'public' | 'professional' | 'authority';
}

// Export config
export interface ExportConfig {
  format: 'jsonld' | 'csv' | 'pdf';
  includeHistory?: boolean;
  includeDocuments?: boolean;
}