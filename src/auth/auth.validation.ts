import { z, ZodType } from 'zod';

export class AuthValidation {
  static readonly REGISTER: ZodType = z.object({
    email: z.string().email().min(6).max(100),
    password: z.string().min(6).max(100),
    username: z.string().min(6).max(100),
  });

  static readonly EMAIL_VERIFICATION: ZodType = z.object({
    email: z.string().email().min(6).max(100),
    emailVerificationToken: z.string().min(6).max(100),
  });

  static readonly LOGIN: ZodType = z.object({
    email: z.string().email().min(6).max(100),
    password: z.string().min(6).max(100),
  });

  static readonly REFRESH_TOKEN: ZodType = z.string().min(6).max(255);

  static readonly FORGOT_PASSWORD: ZodType = z.object({
    email: z.string().email().min(6).max(100),
  });

  static readonly RESET_PASSWORD: ZodType = z.object({
    email: z.string().email().min(6).max(100),
    newPassword: z.string().min(6).max(100),
    repeatNewPassword: z.string().min(6).max(100),
    resetPasswordToken: z.string().min(6).max(100),
  });
}
