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
import { JwtAuthGuard } from '@/core/guards';
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
@UseGuards(JwtAuthGuard)
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
    description: 'Credit application',
    type: CreditApplicationResponse,
  })
  @ApiOperation({ summary: 'Create credit application' })
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

  @Get('apply')
  @ApiOkResponse({
    description: 'Credit applications',
    type: [CreditApplicationResponse],
  })
  @ApiOperation({ summary: 'Get all credit application' })
  async getAllCreditApplication(@Req() req) {
    const data = await this.creditService.getAllCreditApplications(req.user.id);
    return createResponse({
      success: true,
      message: 'Credit applications retrieved successfully',
      data,
    });
  }

  @Get('apply/:id')
  @ApiOkResponse({
    description: 'Credit application',
    type: CreditApplicationWithTimelineResponse,
  })
  @ApiOperation({ summary: 'Get credit application' })
  async getCreditApplication(@Param('id') id: string) {
    const data = await this.creditService.getCreditApplicationById(id);
    return createResponse({
      success: true,
      message: 'Credit application retrieved successfully',
      data,
    });
  }

  @Patch('apply/:id')
  @ApiOkResponse({
    description: 'Credit application updated',
    type: CreditApplicationResponse,
  })
  @ApiOperation({ summary: 'Update credit application' })
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
