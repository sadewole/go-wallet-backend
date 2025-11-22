import { AdminGuard } from '@/core/guards';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { createResponse } from '@/core/utils/helpers';
import { RejectApplicationDto } from './dtos/credit.dto';

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
  async suspendCreditAccount(@Param('id') creditId: string) {
    const data = await this.adminService.suspendCreditAccount(creditId);
    return createResponse({
      success: true,
      message: 'Credit account suspended successfully',
      data,
    });
  }

  @Patch('credit/:id/activate')
  async activateCreditAccount(@Param('id') creditId: string) {
    const data = await this.adminService.activateCreditAccount(creditId);
    return createResponse({
      success: true,
      message: 'Credit account activated successfully',
      data,
    });
  }

  @Get('credit/applications')
  async getAllCreditApplications() {
    const data = await this.adminService.getAllCreditApplications();
    return createResponse({
      success: true,
      message: 'Credit applications retrieved successfully',
      data,
    });
  }

  @Get('credit/transactions')
  async getAllTransactions() {
    const data = await this.adminService.getAllTransactions();
    return createResponse({
      success: true,
      message: 'Credit transactions retrieved successfully',
      data,
    });
  }

  @Get('credit/requests')
  async getAllCreditRequests() {
    const data = await this.adminService.getAllCreditRequests();
    return createResponse({
      success: true,
      message: 'Credit requests retrieved successfully',
      data,
    });
  }

  @Patch('credit/request/:id/approve')
  async approveCreditRequest(@Param('id') requestId: string, @Req() req) {
    const data = await this.adminService.approveCreditRequest(
      requestId,
      req.user.id,
    );
    return createResponse({
      success: true,
      message: 'Credit request approved successfully',
      data,
    });
  }

  @Patch('credit/request/:id/reject')
  async rejectCreditRequest(
    @Param('id') requestId: string,
    @Req() req,
    @Body() body: RejectApplicationDto,
  ) {
    const data = await this.adminService.rejectCreditRequest(
      requestId,
      req.user.id,
      body.note,
    );
    return createResponse({
      success: true,
      message: 'Credit request rejected successfully',
      data,
    });
  }

  @Patch('credit/application/:id/approve')
  async approveCreditApplication(
    @Param('id') applicationId: string,
    @Req() req,
  ) {
    const data = await this.adminService.approveCreditApplication(
      applicationId,
      req.user.id,
    );
    return createResponse({
      success: true,
      message: 'Credit application approved successfully',
      data,
    });
  }

  @Patch('credit/application/:id/reject')
  async rejectCreditApplication(
    @Param('id') applicationId: string,
    @Req() req,
    @Body() body: RejectApplicationDto,
  ) {
    const data = await this.adminService.rejectCreditApplication(
      applicationId,
      req.user.id,
      body.note,
    );
    return createResponse({
      success: true,
      message: 'Credit application rejected successfully',
      data,
    });
  }
}
