import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Organizations')
@Controller('orgs')
export class OrganizationsController {
  // TODO: Inject OrganizationsService
  // GET    /orgs          - Get current org
  // PUT    /orgs          - Update org settings
  // GET    /orgs/members  - List members
  // POST   /orgs/members  - Invite member
  // DELETE /orgs/members/:id - Remove member
}
