import { Injectable } from '@nestjs/common';

@Injectable()
export class SuppliersService {
  // TODO: Implement with TypeORM + email service
  
  async findAllRequests(orgId: string) {
    // Placeholder
    return [];
  }

  async findOneRequest(id: string, orgId: string) {
    // Placeholder
    return null;
  }

  async createRequest(createRequestDto: Record<string, unknown>, orgId: string, userId: string) {
    // Placeholder — creates request, sends email to supplier
    return null;
  }

  async updateRequestStatus(id: string, status: string, orgId: string) {
    // Placeholder
    return null;
  }

  async respondToRequest(requestId: string, responseData: Record<string, unknown>, token: string) {
    // Placeholder — supplier responds (public endpoint with token)
    return null;
  }

  async getSupplierResponses(requestId: string) {
    // Placeholder
    return [];
  }
}
