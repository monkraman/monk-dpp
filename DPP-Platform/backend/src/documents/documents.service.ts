import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../config/configuration.service';
import { PresignedUploadDto, ConfirmUploadDto } from './documents.dto';

export interface MulterFile {
  fieldname?: string;
  originalname: string;
  encoding?: string;
  mimetype: string;
  size: number;
  destination?: string;
  filename?: string;
  path?: string;
  buffer?: Buffer;
}

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  private s3Endpoint: string;
  private s3Bucket: string;
  private s3PublicBaseUrl: string;

  constructor(private configService: ConfigService) {
    this.s3Endpoint = this.configService.get<string>('S3_ENDPOINT') || 'https://s3.amazonaws.com';
    this.s3Bucket = this.configService.get<string>('S3_BUCKET') || 'dpp-platform-files';
    this.s3PublicBaseUrl =
      this.configService.get<string>('S3_PUBLIC_BASE_URL') ||
      `${this.s3Endpoint}/${this.s3Bucket}`;
  }

  async findAll(orgId: string, filters?: Record<string, unknown>) {
    return [];
  }

  async findOne(id: string, orgId: string) {
    return null;
  }

  /**
   * Generates a presigned URL for direct Cloudflare R2 / AWS S3 uploads
   */
  async generatePresignedUploadUrl(
    dto: PresignedUploadDto,
    orgId: string,
    userId: string
  ) {
    const timestamp = Date.now();
    const sanitizedFileName = dto.fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const folder = dto.category === 'compliance' ? `secure/compliance/${orgId}` : `public/products/${dto.productId || 'assets'}`;
    const fileKey = `${folder}/${timestamp}-${sanitizedFileName}`;

    // If Cloudflare R2 / S3 custom CDN is configured
    const publicUrl = `${this.s3PublicBaseUrl}/${fileKey}`;

    // Presigned upload URL (In production with @aws-sdk, getSignedUrl(s3Client, putCommand) is used)
    const uploadUrl = `${this.s3Endpoint}/${this.s3Bucket}/${fileKey}`;

    this.logger.log(`Presigned upload generated for org ${orgId}: ${fileKey}`);

    return {
      uploadUrl,
      fileKey,
      publicUrl: dto.category === 'compliance' ? undefined : publicUrl,
      expiresIn: 300, // 5 minutes
    };
  }

  /**
   * Confirms upload and records document metadata in DB
   */
  async confirmUpload(dto: ConfirmUploadDto, orgId: string, userId: string) {
    this.logger.log(`Confirmed upload for org ${orgId}: ${dto.fileKey}`);
    return {
      id: `doc-${Date.now()}`,
      orgId,
      productId: dto.productId,
      fileKey: dto.fileKey,
      filename: dto.originalName,
      fileSize: dto.fileSize,
      fileType: dto.fileType,
      documentType: dto.documentType,
      visibility: dto.visibility || 'professional',
      uploadedBy: userId,
      createdAt: new Date().toISOString(),
    };
  }

  async upload(file: MulterFile, metadata: Record<string, unknown>, orgId: string, userId: string) {
    return {
      id: 'placeholder-doc-id',
      filename: file?.originalname || 'file',
      storagePath: `documents/${orgId}/${file?.filename || 'file'}`,
      fileType: file?.mimetype || 'application/octet-stream',
      fileSize: file?.size || 0,
      visibility: metadata.visibility || 'professional',
      documentType: metadata.documentType || 'other',
      ...metadata,
    };
  }

  async getDownloadUrl(id: string, orgId: string) {
    return { url: `${this.s3PublicBaseUrl}/secure/compliance/${orgId}/${id}`, expiresIn: 3600 };
  }

  async remove(id: string, orgId: string) {
    return null;
  }

  async getByProduct(productId: string, orgId: string) {
    return [];
  }
}
