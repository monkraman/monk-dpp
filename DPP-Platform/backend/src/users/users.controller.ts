import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  // TODO: Inject UsersService
  // GET    /users           - List users (within org)
  // GET    /users/:id       - Get user by ID
  // PUT    /users/:id       - Update user
  // DELETE /users/:id       - Remove user
  // PATCH  /users/:id/role  - Change user role
}
