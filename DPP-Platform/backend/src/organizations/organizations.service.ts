import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepository: Repository<Organization>,
  ) {}

  async findOne(id: string): Promise<Organization | null> {
    return this.orgRepository.findOne({
      where: { id },
      relations: ['users'],
    });
  }

  async findByEmail(email: string): Promise<Organization | null> {
    return this.orgRepository.findOne({
      where: { email },
    });
  }

  async create(orgData: Partial<Organization>): Promise<Organization> {
    const org = this.orgRepository.create(orgData);
    return this.orgRepository.save(org);
  }

  async update(id: string, updateData: Partial<Organization>): Promise<Organization> {
    await this.orgRepository.update(id, updateData as any);
    const updated = await this.findOne(id);
    if (!updated) {
      throw new NotFoundException('Organization not found');
    }
    return updated;
  }
}
