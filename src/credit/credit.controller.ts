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
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreditService } from './credit.service';
import { JwtAuthGuard, VerifiedUserGuard } from '@/core/guards';
import { CreditApplicationDto, CreditRequestDto } from './dtos/credit.dto';
import { createResponse } from '@/core/utils/helpers';
import {
  CreditApplicationResponse,
  CreditApplicationWithTimelineResponse,
  CreditRequestResponse,
  CreditResponse,
  CreditTransactionResponse,
} from './dtos/credit-response.dto';

@Controller('credit')
@ApiTags('Credit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, VerifiedUserGuard)
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  @Get()
  @ApiOkResponse({
    description: 'Get credit account',
    type: CreditResponse,
  })
  @ApiOperation({ summary: 'Retrieve credit account' })
  async getCredit(@Req() req) {
    const data = await this.creditService.getCredit(req.user.id);
    return createResponse({
      success: true,
      message: 'Credit retrieved successfully',
      data,
    });
  }

  @Post('apply')
  @ApiOkResponse({
    description: 'Credit limit increase application created',
    type: CreditApplicationResponse,
  })
  @ApiOperation({ summary: 'Apply for credit limit increase' })
  async creditApplication(@Body() body: CreditApplicationDto, @Req() req) {
    const data = await this.creditService.createCreditLimit(
      body,
      req.user.creditId,
    );
    return createResponse({
      success: true,
      message: 'Credit limit increased successfully',
      data,
    });
  }

  @Get('apply')
  @ApiOkResponse({
    description: 'Credit limit applications',
    type: [CreditApplicationResponse],
  })
  @ApiOperation({ summary: 'Get all credit limit applications' })
  async getAllCreditLimits(@Req() req) {
    const data = await this.creditService.getAllCreditLimits(req.user.creditId);
    return createResponse({
      success: true,
      message: 'Credit limit applications retrieved successfully',
      data,
    });
  }

  @Get('apply/:id')
  @ApiOkResponse({
    description: 'Credit limit application',
    type: CreditApplicationWithTimelineResponse,
  })
  @ApiOperation({ summary: 'Get credit limit application' })
  async getCreditLimit(@Param('id') id: string) {
    const data = await this.creditService.getCreditLimitById(id);
    return createResponse({
      success: true,
      message: 'Credit limit application retrieved successfully',
      data,
    });
  }

  @Patch('apply/:id')
  @ApiOkResponse({
    description: 'Credit limit updated sucessfully',
    type: CreditApplicationResponse,
  })
  @ApiOperation({ summary: 'Update credit limit application' })
  async updateCreditLimit(
    @Param('id') id: string,
    @Body() body: CreditApplicationDto,
  ) {
    const data = await this.creditService.updateCreditLimit(body, id);
    return createResponse({
      success: true,
      message: 'Credit limit updated successfully',
      data,
    });
  }

  @Post('request')
  @ApiOkResponse({
    description: 'Credit requested',
    type: CreditRequestResponse,
  })
  @ApiOperation({ summary: 'Create credit request' })
  async creditRequest(@Body() body: CreditRequestDto, @Req() req) {
    const data = await this.creditService.creditRequest(body, req.user.id);
    return createResponse({
      success: true,
      message: 'Credit request created successfully',
      data,
    });
  }

  @Get('transactions')
  @ApiOkResponse({
    description: 'All credit transactions',
    type: [CreditTransactionResponse],
  })
  @ApiOperation({ summary: 'Get credit transactions' })
  async getCreditTransactions(@Req() req) {
    const data = await this.creditService.getCreditTransactions(req.user.id);
    return createResponse({
      success: true,
      message: 'Credit transactions retrieved successfully',
      data,
    });
  }
}
