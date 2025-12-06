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
import { AdjustCreditDto, RejectApplicationDto } from './dtos/credit.dto';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { UserWithCreditResponse } from './dtos/admin-response.dto';
import {
  CreditApplicationResponse,
  CreditRequestResponse,
  CreditResponse,
  CreditTransactionResponse,
} from '@/credit/dtos/credit-response.dto';

@Controller('admin')
@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOkResponse({
    description: 'All users with credit info',
    type: [UserWithCreditResponse],
  })
  @ApiOperation({ summary: 'Get all users' })
  async getAllUsers() {
    const data = await this.adminService.getAllUsers();
    return createResponse({
      success: true,
      message: 'Users retrieved successfully',
      data,
    });
  }

  @Patch('credit/:id/suspend')
  @ApiOkResponse({
    description: 'Credit account suspended',
    type: CreditResponse,
  })
  @ApiOperation({ summary: 'Suspend credit account' })
  async suspendCreditAccount(@Param('id') creditId: string) {
    const data = await this.adminService.suspendCreditAccount(creditId);
    return createResponse({
      success: true,
      message: 'Credit account suspended successfully',
      data,
    });
  }

  @Patch('credit/:id/activate')
  @ApiOkResponse({
    description: 'Credit account activated',
    type: CreditResponse,
  })
  @ApiOperation({ summary: 'Activate credit account' })
  async activateCreditAccount(@Param('id') creditId: string) {
    const data = await this.adminService.activateCreditAccount(creditId);
    return createResponse({
      success: true,
      message: 'Credit account activated successfully',
      data,
    });
  }

  @Get('credit/applications')
  @ApiOkResponse({
    description: 'All credit applications',
    type: [CreditApplicationResponse],
  })
  @ApiOperation({ summary: 'Get all credit applications' })
  async getAllCreditApplications() {
    const data = await this.adminService.getAllCreditApplications();
    return createResponse({
      success: true,
      message: 'Credit applications retrieved successfully',
      data,
    });
  }

  @Get('credit/transactions')
  @ApiOkResponse({
    description: 'All credit transactions',
    type: [CreditTransactionResponse],
  })
  @ApiOperation({ summary: 'Get all credit transactions' })
  async getAllTransactions() {
    const data = await this.adminService.getAllTransactions();
    return createResponse({
      success: true,
      message: 'Credit transactions retrieved successfully',
      data,
    });
  }

  @Get('credit/requests')
  @ApiOkResponse({
    description: 'All credit requests',
    type: [CreditRequestResponse],
  })
  @ApiOperation({ summary: 'Get all credit requests' })
  async getAllCreditRequests() {
    const data = await this.adminService.getAllCreditRequests();
    return createResponse({
      success: true,
      message: 'Credit requests retrieved successfully',
      data,
    });
  }

  @Patch('credit/request/:id/approve')
  @ApiOkResponse({
    description: 'Credit request approved',
    type: CreditRequestResponse,
  })
  @ApiOperation({ summary: 'Approve credit request' })
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
  @ApiOkResponse({
    description: 'Credit request rejected',
    type: CreditRequestResponse,
  })
  @ApiOperation({ summary: 'Reject credit request' })
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
  @ApiOkResponse({
    description: 'Credit application approved',
    type: CreditApplicationResponse,
  })
  @ApiOperation({ summary: 'Approve credit application' })
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
  @ApiOkResponse({
    description: 'Credit application rejected',
    type: CreditApplicationResponse,
  })
  @ApiOperation({ summary: 'Reject credit application' })
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

  @Patch('credit/:id/adjust')
  @ApiOkResponse({
    description: 'Credit adjusted',
    type: CreditTransactionResponse,
  })
  @ApiOperation({ summary: 'Adjust credit account' })
  async adjustCredit(
    @Param('id') creditId: string,
    @Req() req,
    @Body() body: AdjustCreditDto,
  ) {
    const data = await this.adminService.adjustCredit(
      creditId,
      body,
      req.user.id,
    );
    return createResponse({
      success: true,
      message: 'Credit adjusted successfully',
      data,
    });
  }
}
