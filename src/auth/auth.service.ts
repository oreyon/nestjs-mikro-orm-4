import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ValidationService } from '../common/validation.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokensResponse } from '../model/tokens.model';
import { v7 as uuidv7 } from 'uuid';
import * as argon2 from 'argon2';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

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
import { AuthValidation } from './auth.validation';
import { Response } from 'express';
import { EntityManager } from '@mikro-orm/mysql';
import { Role, User } from './user.entity';
import { NodemailerService } from '../nodemailer/nodemailer.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private validationService: ValidationService,
    private em: EntityManager,
    private jwtService: JwtService,
    private configService: ConfigService,
    private nodeMailerService: NodemailerService,
  ) {}

  async createTokens(userId: number): Promise<TokensResponse> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          jti: uuidv7(),
          sub: userId,
          iat: Math.floor(Date.now() / 1000),
        },
        {
          secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
          expiresIn: 60 * 2,
        },
      ),
      this.jwtService.signAsync(
        {
          jti: uuidv7(),
          sub: userId,
          iat: Math.floor(Date.now() / 1000),
        },
        {
          secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
          expiresIn: 60 * 60 * 24,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async createAccessToken(userId: number): Promise<string> {
    return await this.jwtService.signAsync(
      {
        jti: uuidv7(),
        sub: userId,
        iat: Math.floor(Date.now() / 1000),
      },
      {
        secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: 60 * 2,
      },
    );
  }

  async updateRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    const hashRefreshToken = await bcrypt.hash(refreshToken, 10);
    // const hashRefreshToken = await argon2.hash(refreshToken);
    const user = await this.em.findOne(User, { id: userId });
    user.refreshToken = hashRefreshToken;
    await this.em.flush();
  }

  async register(request: RegisterUserRequest): Promise<RegisterUserResponse> {
    this.logger.debug(`REGISTER USER: ${JSON.stringify(request)}`);

    const registerRequest = this.validationService.validate(
      AuthValidation.REGISTER,
      request,
    );

    // Check if email or username already exists
    const emailAlreadyExists = await this.em.findOne(User, {
      email: registerRequest.email,
    });
    if (emailAlreadyExists) {
      throw new HttpException('Email already exists', 400);
    }

    const usernameAlreadyExists = await this.em.count(User, {
      username: registerRequest.username,
    });
    if (usernameAlreadyExists > 0) {
      throw new HttpException('Username already exists', 400);
    }

    const isFirstAccount = (await this.em.count(User)) === 0;
    const role = isFirstAccount ? Role.ADMIN : Role.USER;

    // if dev token is secret, if prod token is random
    const emailVerificationToken =
      this.configService.get('NODE_ENV') === 'development'
        ? 'secret'
        : crypto.randomBytes(40).toLocaleString('hex');

    // hash the password
    registerRequest.password = await argon2.hash(registerRequest.password);

    const user = this.em.create(User, {
      email: registerRequest.email,
      password: registerRequest.password,
      username: registerRequest.username,
      role,
      emailVerificationToken,
    });

    await this.em.persistAndFlush(user);

    // front-end URL origin
    const frontEndOrigin = this.configService.get('IP_FRONTEND_ORIGIN');

    // send verification email
    // make method sendVerificationEmail
    await this.nodeMailerService.sendVerificationEmail({
      email: user.email,
      name: user.username,
      verificationToken: user.emailVerificationToken,
      origin: frontEndOrigin,
    });

    return {
      email: user.email,
      username: user.username,
      emailVerificationToken: user.emailVerificationToken,
    };
  }

  async verifyEmail(
    request: EmailVerificationRequest,
  ): Promise<EmailVerificationResponse> {
    this.logger.debug(`VERIFY EMAIL: ${JSON.stringify(request)}`);

    const verifyEmailRequest: EmailVerificationRequest =
      this.validationService.validate(
        AuthValidation.EMAIL_VERIFICATION,
        request,
      );

    const user = await this.em.findOne(User, {
      email: verifyEmailRequest.email,
    });

    if (!user) {
      throw new HttpException('Invalid email address', 400);
    }

    if (
      verifyEmailRequest.emailVerificationToken !== user.emailVerificationToken
    ) {
      throw new HttpException('Invalid token', 400);
    }

    user.isVerified = true;
    user.verifiedTime = new Date();
    user.emailVerificationToken = '';

    await this.em.flush();

    return {
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      verifiedTime: user.verifiedTime,
    };
  }

  async login(
    request: LoginRequest,
    response: Response,
  ): Promise<LoginResponse> {
    this.logger.debug(`LOGIN USER: ${JSON.stringify(request)}`);

    const loginRequest = this.validationService.validate(
      AuthValidation.LOGIN,
      request,
    );
    const user = await this.em.findOne(User, { email: loginRequest.email });

    if (!user) throw new HttpException('Invalid email or password', 400);
    if (!user.isVerified) throw new HttpException('Email is not verified', 400);

    const isPasswordValid = await argon2.verify(
      user.password,
      loginRequest.password,
    );
    if (!isPasswordValid)
      throw new HttpException('Invalid email or password', 400);

    const tokens = await this.createTokens(user.id);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    response.cookie('accesstoken', tokens.accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'none',
      signed: true,
    });

    response.cookie('refreshtoken', tokens.refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'none',
      signed: true,
    });

    return {
      email: user.email,
      username: user.username,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async getCurrentUser(user: User): Promise<CurrentUserResponse> {
    this.logger.debug(`CURRENT USER DATA: ${JSON.stringify(user)}`);

    return {
      email: user.email,
      username: user.username,
      role: user.role,
    };
  }

  async logout(user: User, response: Response): Promise<void> {
    this.logger.debug(`LOGOUT USER: ${JSON.stringify(user)}`);

    const userWithRefreshToken = await this.em.findOne(User, { id: user.id });
    userWithRefreshToken.refreshToken = '';
    await this.em.flush();

    response.clearCookie('accesstoken');
    response.clearCookie('refreshtoken');

    return null;
  }

  async refreshToken(
    refreshToken: string,
    response: Response,
  ): Promise<RefreshTokenResponse> {
    this.logger.debug(`REFRESH TOKEN: ${refreshToken}`);

    // Step 1: Validate the format of the refresh token
    const validatedToken = this.validationService.validate(
      AuthValidation.REFRESH_TOKEN,
      refreshToken,
    );

    if (!validatedToken) {
      throw new HttpException('Invalid refresh token format', 400);
    }

    // Step 2: Decode token to get user ID or other identifier
    const decodedToken = this.jwtService.decode(refreshToken) as {
      sub: number;
    };
    const userId = decodedToken?.sub;
    if (!userId) {
      throw new HttpException('Invalid token payload', 400);
    }

    // Step 3: Find user by ID
    const user = await this.em.findOne(User, { id: userId });
    if (!user || !user.refreshToken) {
      throw new HttpException('Invalid refresh token', 400);
    }

    // Step 4: Compare the provided refresh token with the hashed token in the database
    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!isRefreshTokenValid) {
      throw new HttpException('Invalid refresh token', 400);
    }

    // Step 5: Generate a new access token
    const newAccessToken = await this.createAccessToken(user.id);

    // Set the new access token in a secure HTTP-only cookie
    response.cookie('accesstoken', newAccessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'none',
      signed: true,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: user.refreshToken,
    };
  }

  async forgotPassword(
    request: ForgotPasswordRequest,
  ): Promise<ForgotPasswordResponse> {
    this.logger.debug(`FORGOT PASSWORD: ${JSON.stringify(request)}`);

    const forgotRequest = this.validationService.validate(
      AuthValidation.FORGOT_PASSWORD,
      request,
    );
    const user = await this.em.findOne(User, { email: forgotRequest.email });

    if (!user) throw new HttpException('Invalid email address', 400);
    if (!user.isVerified) throw new HttpException('Email is not verified', 400);

    const forgotToken =
      this.configService.get('NODE_ENV') === 'development'
        ? 'secret'
        : crypto.randomBytes(40).toString('hex');
    const hashForgotToken = await argon2.hash(forgotToken);

    const frontEndOrigin = this.configService.get('IP_FRONTEND_ORIGIN');
    //send reset password via email
    await this.nodeMailerService.sendResetPasswordEmail({
      email: user.email,
      name: user.username,
      token: forgotToken,
      origin: frontEndOrigin,
    });

    const expirationTime = new Date(Date.now() + 30 * 1000);

    user.passwordResetToken = hashForgotToken;
    user.passwordResetTokenExpirationTime = expirationTime;
    await this.em.flush();

    return {
      email: user.email,
      passwordResetToken: user.passwordResetToken,
    };
  }

  async resetPassword(
    request: ResetPasswordRequest,
    response: Response,
  ): Promise<ResetPasswordResponse> {
    this.logger.debug(`RESET PASSWORD: ${JSON.stringify(request)}`);

    const resetRequest = this.validationService.validate(
      AuthValidation.RESET_PASSWORD,
      request,
    );
    const user = await this.em.findOne(User, { email: resetRequest.email });

    if (!user || !user.passwordResetToken)
      throw new HttpException('Invalid request', 401);
    if (user.passwordResetTokenExpirationTime < new Date())
      throw new HttpException('Token expired', 401);

    const isTokenValid = await argon2.verify(
      user.passwordResetToken,
      resetRequest.resetPasswordToken,
    );
    if (!isTokenValid) throw new HttpException('Invalid token', 401);

    const newPasswordHash = await argon2.hash(resetRequest.newPassword);
    user.password = newPasswordHash;
    user.passwordResetToken = '';
    user.passwordResetTokenExpirationTime = null;

    await this.em.flush();

    response.clearCookie('accesstoken');
    response.clearCookie('refreshtoken');

    return {
      email: user.email,
      username: user.username,
    };
  }
}
