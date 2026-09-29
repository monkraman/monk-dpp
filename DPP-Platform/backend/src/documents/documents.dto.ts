export interface CreateDocumentDto {
  productId?: string;
  dppId?: string;
  filename: string;
  originalName: string;
  fileType: 'pdf' | 'image' | 'spreadsheet' | 'document';
  fileSize: number;
  visibility: 'public' | 'professional' | 'authority';
  documentType: 'declaration' | 'certificate' | 'test_report' | 'manual' | 'other';
  description?: string;
}
