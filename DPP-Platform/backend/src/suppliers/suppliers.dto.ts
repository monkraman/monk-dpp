export interface CreateSupplierRequestDto {
  productId: string;
  supplierEmail: string;
  supplierName?: string;
  dataFields: string[];  // List of field names needed from supplier
  dueDate?: string;      // ISO date string
  message?: string;      // Custom message to supplier
  status?: 'pending' | 'sent' | 'responded' | 'completed' | 'expired';
}
