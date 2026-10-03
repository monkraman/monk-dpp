import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dpp } from './entities/dpp.entity';
import { Product } from '../products/entities/product.entity';
import { QrGeneratorHelper } from '../common/helpers/qr-generator.helper';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class DppsService {
  constructor(
    @InjectRepository(Dpp)
    private readonly dppRepository: Repository<Dpp>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly qrGenerator: QrGeneratorHelper,
    private readonly auditService: AuditService,
  ) {}

  async findAll(orgId: string): Promise<Dpp[]> {
    return this.dppRepository.find({
      where: { organization_id: orgId },
      order: { created_at: 'DESC' },
      relations: ['product'],
    });
  }

  async findOne(id: string, orgId: string): Promise<Dpp> {
    const dpp = await this.dppRepository.findOne({
      where: { id, organization_id: orgId },
      relations: ['product', 'organization'],
    });
    if (!dpp) {
      throw new NotFoundException(`DPP with ID ${id} not found`);
    }
    return dpp;
  }

  async findByProductId(productId: string): Promise<Dpp | null> {
    return this.dppRepository.findOne({
      where: { product_id: productId },
      relations: ['product'],
    });
  }

  async getByProduct(productId: string, orgId?: string): Promise<Dpp | null> {
    const where: { product_id: string; organization_id?: string } = { product_id: productId };
    if (orgId) {
      where.organization_id = orgId;
    }
    return this.dppRepository.findOne({
      where,
      relations: ['product'],
    });
  }

  async create(createDppDto: Record<string, unknown>, productId: string, orgId: string, userId: string): Promise<Dpp> {
    const product = await this.productRepository.findOne({
      where: { id: productId, organization_id: orgId },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const existing = await this.findByProductId(productId);
    if (existing) {
      throw new BadRequestException('A Digital Product Passport already exists for this product');
    }

    // Build GS1 Digital Link
    const gs1DigitalLink = this.qrGenerator.buildDigitalLink(product.id, product.gtin, product.serial_number);
    const qrCodeDataUrl = await this.qrGenerator.generateQrDataUrl(gs1DigitalLink);

    // Segment tiered data
    const public_data: Record<string, unknown> = {
      model_name: product.model_name,
      brand_name: product.brand_name,
      battery_category: product.battery_category,
      chemistry: product.chemistry,
      mass_kg: product.mass_kg,
      energy_capacity_wh: product.energy_capacity_wh,
      manufacture_date: product.manufacture_date,
      gtin: product.gtin,
      serial_number: product.serial_number,
      hazardous_substances: product.hazardous_substances,
      manufacturer_name: product.manufacturer_name,
    };

    const professional_data: Record<string, unknown> = {
      nominal_voltage: product.nominal_voltage,
      max_voltage: product.max_voltage,
      original_power_watts: product.original_power_watts,
      cycle_life_cycles: product.cycle_life_cycles,
      round_trip_efficiency: product.round_trip_efficiency,
      battery_lifetime_years: product.battery_lifetime_years,
      parts_materials: product.parts_materials,
      spare_parts_supplier: product.spare_parts_supplier,
    };

    const authority_data: Record<string, unknown> = {
      manufacturer_plant_location: product.manufacturer_plant_location,
      eu_conformity_docs: product.eu_conformity_docs,
      product_life_instructions: product.product_life_instructions,
    };

    const dpp = this.dppRepository.create({
      product_id: productId,
      organization_id: orgId,
      created_by: userId,
      public_data,
      professional_data,
      authority_data,
      qr_code_url: qrCodeDataUrl,
      gs1_digital_link: gs1DigitalLink,
      status: 'draft',
      version: 1,
    });

    const saved = await this.dppRepository.save(dpp);

    await this.auditService.logDpp(orgId, userId, saved.id, 'create', undefined, saved as unknown as Record<string, unknown>);

    return saved;
  }

  async update(id: string, updateDppDto: Record<string, unknown>, orgId: string, userId?: string): Promise<Dpp> {
    const oldDpp = await this.findOne(id, orgId);

    await this.dppRepository.update(id, {
      ...updateDppDto,
      version: (oldDpp.version || 1) + 1,
    } as any);

    const updated = await this.findOne(id, orgId);

    if (userId) {
      await this.auditService.logDpp(orgId, userId, id, 'update', oldDpp as unknown as Record<string, unknown>, updated as unknown as Record<string, unknown>);
    }

    return updated;
  }

  async publish(id: string, orgId: string, userId?: string): Promise<Dpp> {
    const dpp = await this.findOne(id, orgId);
    dpp.status = 'published';
    dpp.published_at = new Date();
    dpp.version = (dpp.version || 1) + 1;

    const saved = await this.dppRepository.save(dpp);

    // Also update linked product status
    if (dpp.product_id) {
      await this.productRepository.update(dpp.product_id, {
        status: 'published',
        published_at: dpp.published_at,
      } as any);
    }

    if (userId) {
      await this.auditService.logDpp(orgId, userId, id, 'publish', undefined, saved as unknown as Record<string, unknown>);
    }

    return saved;
  }

  async getHistory(id: string, orgId: string) {
    return this.auditService.findByEntity('dpp', id, orgId);
  }

  async getPublicData(id: string): Promise<Record<string, unknown> | null> {
    const dpp = await this.dppRepository.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!dpp) {
      return null;
    }

    return {
      id: dpp.id,
      status: dpp.status,
      published_at: dpp.published_at,
      version: dpp.version,
      gs1_digital_link: dpp.gs1_digital_link,
      data: dpp.public_data,
    };
  }
}
