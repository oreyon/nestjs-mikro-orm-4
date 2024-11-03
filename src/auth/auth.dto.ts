// import { Role } from '@prisma/client';

import { Role } from './user.entity';

export class RegisterUserRequest {
  email: string;
  password: string;
  username: string;
  // role: Role;
  // emailVerificationToken: string;
}

export class RegisterUserResponse {
  email: string;
  username: string;
  emailVerificationToken: string;
}

export class EmailVerificationRequest {
  email: string;
  emailVerificationToken: string;
}

export class EmailVerificationResponse {
  email: string;
  role: Role;
  isVerified: boolean;
  verifiedTime: Date;
}

export class LoginRequest {
  email: string;
  password: string;
}

export class LoginResponse {
  email: string;
  username: string;
  accessToken: string;
  refreshToken: string;
}

export class CurrentUserResponse {
  email: string;
  username: string;
  role: Role;
}

export class RefreshTokenRequest {
  refreshToken: string;
}

export class RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export class ForgotPasswordRequest {
  email: string;
}

export class ForgotPasswordResponse {
  email: string;
  passwordResetToken: string;
}

export class ResetPasswordRequest {
  email: string;
  newPassword: string;
  repeatNewPassword: string;
  resetPasswordToken: string;
}

export class ResetPasswordResponse {
  email: string;
  username: string;
}
