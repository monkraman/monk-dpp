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

export class PresignedUploadDto {
  fileName: string;
  fileType: string;
  category?: 'public' | 'compliance';
  productId?: string;
}

export class ConfirmUploadDto {
  fileKey: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  documentType: string;
  productId?: string;
  visibility?: 'public' | 'professional' | 'authority';
}
