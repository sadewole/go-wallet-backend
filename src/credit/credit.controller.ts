import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreditService } from './credit.service';
import { JwtAuthGuard } from '@/core/guards';
import { CreditApplicationDto, CreditRequestDto } from './dtos/credit.dto';
import { createResponse } from '@/core/utils/helpers';

@Controller('credit')
@ApiTags('Credit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  @Get()
  async getCredit(@Req() req) {
    const data = await this.creditService.getCredit(req.user.id);
    return createResponse({
      success: true,
      message: 'Credit retrieved successfully',
      data,
    });
  }

  @Post('apply')
  async creditApplication(@Body() body: CreditApplicationDto, @Req() red) {
    const data = await this.creditService.createCreditApplication(
      body,
      red.user.id,
    );
    return createResponse({
      success: true,
      message: 'Credit application created successfully',
      data,
    });
  }

  @Patch('apply/:id')
  async updateCreditApplication(
    @Param('id') id: string,
    @Body() body: CreditApplicationDto,
  ) {
    const data = await this.creditService.updateCreditApplication(body, id);
    return createResponse({
      success: true,
      message: 'Credit application updated successfully',
      data,
    });
  }

  @Post('request')
  async creditRequest(@Body() body: CreditRequestDto, @Req() req) {
    const data = await this.creditService.creditRequest(body, req.user.id);
    return createResponse({
      success: true,
      message: 'Credit request created successfully',
      data,
    });
  }

  @Get('timeline')
  async getCreditTimeline() {}

  @Get('transactions/:creditId')
  async getCreditTransactions(@Param('creditId') creditId: string) {
    const data = await this.creditService.getCreditTransactions(creditId);
    return createResponse({
      success: true,
      message: 'Credit transactions retrieved successfully',
      data,
    });
  }
}
