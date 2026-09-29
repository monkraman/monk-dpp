export interface Organization {
  id: string;
  name: string;
  slug: string;
  contactEmail?: string;
  contactPhone?: string;
  country?: string;
  industry?: string;
  plan?: string;
  timezone?: string;
  settings?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'member' | 'viewer' | 'supplier';
  phone?: string;
  organization: Organization;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  category: 'ev_battery' | 'lmt_battery' | 'industrial_battery' | 'other';
  gtin?: string;
  serialNumber?: string;
  status: 'draft' | 'published' | 'archived';
  qrCodeData?: string;
  qrCodeImage?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface Dpp {
  id: string;
  productId: string;
  organizationId: string;
  version: number;
  data: Record<string, unknown>;
  accessLevel: 'public' | 'professional' | 'authority';
  status: 'draft' | 'submitted' | 'approved' | 'published';
  createdAt: string;
  updatedAt: string;
  product?: Product;
}

export interface Document {
  id: string;
  organizationId: string;
  productId?: string;
  dppId?: string;
  uploadedBy: string;
  filename: string;
  originalName: string;
  fileType: 'pdf' | 'image' | 'spreadsheet' | 'document';
  fileSize: number;
  storagePath: string;
  visibility: 'public' | 'professional' | 'authority';
  documentType: 'declaration' | 'certificate' | 'test_report' | 'manual' | 'other';
  description?: string;
  createdAt: string;
  product?: Product;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  entityType: 'product' | 'dpp' | 'document' | 'user' | 'organization' | 'supplier_request';
  entityId: string;
  action: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: User;
}

export interface SupplierRequest {
  id: string;
  productId: string;
  productName?: string;
  supplierEmail: string;
  supplierName?: string;
  dataFields: string[];
  status: 'pending' | 'sent' | 'responded' | 'completed' | 'expired';
  dueDate?: string;
  sentAt?: string;
  respondedAt?: string;
  createdAt: string;
}
