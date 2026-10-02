import { Organization } from '../organizations/entities/organization.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Dpp } from '../dpps/entities/dpp.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';

export { Organization, User, Product, Dpp, AuditLog };

export const ALL_ENTITIES = [
  Organization,
  User,
  Product,
  Dpp,
  AuditLog,
];
