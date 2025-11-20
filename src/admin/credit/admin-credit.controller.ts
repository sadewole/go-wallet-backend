import { AdminGuard } from '@/core/guards';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('admin/credit')
@ApiTags('Admin / Credit')
@ApiBearerAuth()
@UseGuards(AdminGuard)
export class AdminCreditController {
  constructor() {}

  @Get()
  someAdminEndpoint() {
    return 'Hello Admin Credit';
  }
}
