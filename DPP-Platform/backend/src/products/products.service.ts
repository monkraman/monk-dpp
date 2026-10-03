import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Product } from './entities/product.entity';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly auditService: AuditService,
  ) {}

  async findAll(orgId: string, query?: Record<string, unknown>) {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit) || 10));
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Product> = { organization_id: orgId };
    if (query?.status) {
      where.status = String(query.status);
    }
    if (query?.battery_category) {
      where.battery_category = String(query.battery_category);
    }
    if (query?.search) {
      where.model_name = Like(`%${query.search}%`);
    }

    const [items, total] = await this.productRepository.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip,
      take: limit,
      relations: ['dpps'],
    });

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, orgId: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, organization_id: orgId },
      relations: ['dpps', 'organization'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async create(createProductDto: Partial<Product>, orgId: string, userId: string): Promise<Product> {
    const product = this.productRepository.create({
      ...createProductDto,
      organization_id: orgId,
      created_by: userId,
      status: createProductDto.status || 'draft',
      version: 1,
    });

    const saved = await this.productRepository.save(product);

    await this.auditService.logProduct(orgId, userId, saved.id, 'create', undefined, saved as unknown as Record<string, unknown>);

    return saved;
  }

  async update(id: string, updateProductDto: Partial<Product>, orgId: string, userId?: string): Promise<Product> {
    const oldProduct = await this.findOne(id, orgId);

    await this.productRepository.update(id, {
      ...updateProductDto,
      version: (oldProduct.version || 1) + 1,
    } as any);

    const updated = await this.findOne(id, orgId);

    if (userId) {
      await this.auditService.logProduct(orgId, userId, id, 'update', oldProduct as unknown as Record<string, unknown>, updated as unknown as Record<string, unknown>);
    }

    return updated;
  }

  async remove(id: string, orgId: string, userId?: string): Promise<void> {
    const oldProduct = await this.findOne(id, orgId);
    await this.productRepository.delete({ id, organization_id: orgId });

    if (userId) {
      await this.auditService.logProduct(orgId, userId, id, 'delete', oldProduct as unknown as Record<string, unknown>, undefined);
    }
  }

  async publish(id: string, orgId: string, userId?: string): Promise<Product> {
    const product = await this.findOne(id, orgId);
    product.status = 'published';
    product.published_at = new Date();
    const saved = await this.productRepository.save(product);

    if (userId) {
      await this.auditService.logProduct(orgId, userId, id, 'publish', undefined, saved as unknown as Record<string, unknown>);
    }
    return saved;
  }

  async getForDpp(productId: string): Promise<Product | null> {
    return this.productRepository.findOne({
      where: { id: productId },
      relations: ['organization'],
    });
  }
}
