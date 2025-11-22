import { CreateUserDto } from '@/users/dtos/user.dto';
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthOkResponse,
  AuthResponse,
  LoginDto,
  ResendCodeDto,
  VerifyEmailDto,
} from './dtos/auth.dto';
import { JwtAuthGuard } from '@/core/guards';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserResponseDto } from '@/users/dtos/user-response.dto';
import { createResponse } from '@/core/utils/helpers';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('me')
  @ApiOkResponse({
    description: 'User data',
    type: UserResponseDto,
  })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Req() req) {
    return createResponse({
      success: true,
      message: 'Get user successfully',
      data: req.user,
    });
  }

  @Post('register')
  @ApiOkResponse({
    description: 'Success auth response',
    type: AuthResponse,
  })
  @ApiOperation({ summary: 'Register user' })
  async register(@Body() body: CreateUserDto, @Res() res) {
    const data = await this.authService.register(body);

    res.cookie('access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000,
    });

    return res.json({
      success: true,
      message: 'User created successfully',
      data,
    });
  }

  @Post('login')
  @ApiOkResponse({
    description: 'Success auth response',
    type: AuthResponse,
  })
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() body: LoginDto, @Res() res) {
    const user = await this.authService.validateLogin(body);
    const data = await this.authService.login(user);

    res.cookie('access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1hr
    });

    return res.json({
      success: true,
      message: 'User logged in successfully',
      data,
    });
  }

  @Post('logout')
  async logout(@Res() res) {
    res.clearCookie('access_token');
    return res.send({ message: 'Logout successful' });
  }

  @Post('resend-code')
  @ApiOkResponse({
    description: 'Ok Response',
    type: AuthOkResponse,
  })
  @ApiOperation({ summary: 'Resend verify code' })
  async resendVerificationCode(@Body() body: ResendCodeDto) {
    return await this.authService.resendVerificationCode(body);
  }

  @Put('verify-email')
  @ApiOkResponse({
    description: 'Ok Response',
    type: AuthOkResponse,
  })
  @ApiOperation({ summary: 'Verify user email' })
  async verifyEmail(@Body() body: VerifyEmailDto) {
    return await this.authService.verifyEmail(body);
  }
}
