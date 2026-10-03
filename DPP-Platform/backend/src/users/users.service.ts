import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['organization'],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['organization'],
    });
  }

  async findByOrganization(orgId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { organization_id: orgId },
      order: { created_at: 'DESC' },
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, updateData as any);
    const updated = await this.findById(id);
    if (!updated) {
      throw new NotFoundException('User not found');
    }
    return updated;
  }

  async updateRole(userId: string, role: UserRole): Promise<User> {
    return this.update(userId, { role });
  }

  async remove(userId: string): Promise<void> {
    await this.userRepository.delete(userId);
  }
}
