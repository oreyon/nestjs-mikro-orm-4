import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CurrentUserResponse,
  EmailVerificationRequest,
  EmailVerificationResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  RegisterUserRequest,
  RegisterUserResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from './auth.dto';
import { WebResponse } from '../model/web.model';
import { Request, Response } from 'express';
import { AccessTokenGuard, RefreshTokenGuard } from '../common/guards';
import { UserData } from '../common/decorators';
import { User } from './user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('/api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/register')
  async register(
    @Body() request: RegisterUserRequest,
  ): Promise<WebResponse<RegisterUserResponse>> {
    const result = await this.authService.register(request);
    return {
      code: HttpStatus.CREATED,
      status: 'User successfully registered',
      data: result,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('/verify-email')
  async verifyEmail(
    @Body() request: EmailVerificationRequest,
  ): Promise<WebResponse<EmailVerificationResponse>> {
    const result = await this.authService.verifyEmail(request);
    return {
      code: HttpStatus.OK,
      status: 'Email successfully verified',
      data: result,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async login(
    @Body() request: LoginRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<WebResponse<LoginResponse>> {
    const result = await this.authService.login(request, response);
    return {
      code: HttpStatus.OK,
      status: 'User successfully logged in',
      data: result,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/current')
  async getCurrentUser(
    @UserData() user: User,
  ): Promise<WebResponse<CurrentUserResponse>> {
    const result = await this.authService.getCurrentUser(user);
    return {
      code: HttpStatus.OK,
      status: 'User data successfully retrieved',
      data: result,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Delete('/logout')
  async logout(
    @UserData() user: User,
    @Res({ passthrough: true }) response: Response,
  ): Promise<WebResponse<boolean>> {
    await this.authService.logout(user, response);
    return {
      code: HttpStatus.OK,
      status: 'User successfully logged out',
      data: true,
    };
  }

  @ApiBearerAuth()
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/refresh-token')
  async refreshToken(
    @UserData('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<WebResponse<RefreshTokenResponse>> {
    const result = await this.authService.refreshToken(refreshToken, response);
    return {
      code: HttpStatus.OK,
      status: 'Token successfully refreshed',
      data: result,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('/forgot-password')
  async forgotPassword(
    @Body() request: ForgotPasswordRequest,
  ): Promise<WebResponse<ForgotPasswordResponse>> {
    const result = await this.authService.forgotPassword(request);
    return {
      code: HttpStatus.OK,
      status: 'Password reset email sent',
      data: result,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('/reset-password')
  async resetPassword(
    @Body() request: ResetPasswordRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<WebResponse<ResetPasswordResponse>> {
    const result = await this.authService.resetPassword(request, response);
    return {
      code: HttpStatus.OK,
      status: 'Password successfully reset',
      data: result,
    };
  }

  @Get('/check-ip')
  async checkIp(
    @Ip() ip: string, // Get the IP address
    @Headers('user-agent') userAgent: string, // Get the User-Agent header
    @Req() request: Request, // Access the full request object if needed
  ) {
    console.log('IP Address:', ip);
    console.log('User-Agent:', userAgent);

    return {
      code: HttpStatus.OK,
      status: 'IP Address and User Agent successfully retrieved',
      data: {
        ipAddress: ip,
        userAgent: userAgent,
      },
    };
  }
}
