import { CreateUserDto } from '@/users/dtos/user.dto';
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, ResendCodeDto, VerifyEmailDto } from './dtos/auth.dto';
import { JwtAuthGuard } from '@/core/guards';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Req() req) {
    return req.user;
  }

  @Post('register')
  async register(@Body() body: CreateUserDto) {
    return await this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateLogin(body);
    return await this.authService.login(user);
  }

  @Post('resend-code')
  async resendVerificationCode(@Body() body: ResendCodeDto) {
    return await this.authService.resendVerificationCode(body);
  }

  @Put('verify-email')
  async verifyEmail(@Body() body: VerifyEmailDto) {
    return await this.authService.verifyEmail(body);
  }
}
