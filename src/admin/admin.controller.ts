import { AdminGuard } from '@/core/guards';
import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { createResponse } from '@/core/utils/helpers';

@Controller('admin')
@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getAllUsers() {
    const data = await this.adminService.getAllUsers();
    return createResponse({
      success: true,
      message: 'Users retrieved successfully',
      data,
    });
  }

  @Patch('credit/:id/suspend')
  async suspendCreditAccount() {
    // Implementation for suspending a credit
  }

  @Patch('credit/:id/activate')
  async activateCreditAccount() {
    // Implementation for activating a credit
  }

  @Get('credit/applications')
  async getAllCreditApplications() {
    // Implementation for retrieving all credit applications
  }

  @Get('credit/transactions')
  async getAllTransactions() {
    // Implementation for retrieving all transactions
  }

  @Get('credit/requests')
  async getAllCreditRequests() {
    // Implementation for retrieving all credit requests
  }

  @Patch('credit/request/:id/approve')
  async approveCreditRequest() {
    // Implementation for approving a credit request
  }

  @Patch('credit/request/:id/reject')
  async rejectCreditRequest() {
    // Implementation for rejecting a credit request
  }

  @Patch('credit/application/:id/approve')
  async approveCreditApplication() {
    // Implementation for approving a credit application
  }

  @Patch('credit/application/:id/reject')
  async rejectCreditApplication() {
    // Implementation for rejecting a credit application
  }
}
