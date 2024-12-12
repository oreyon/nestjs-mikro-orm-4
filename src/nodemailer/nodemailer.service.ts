import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NodemailerService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: `${configService.get('NODEMAILER_HOST')}`,
      port: parseInt(`${configService.get('NODEMAILER_PORT')}`),
      auth: {
        user: `${configService.get('NODEMAILER_USER')}`,
        pass: `${configService.get('NODEMAILER_PASSWORD')}`,
      },
    });
  }

  async sendEmail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    try {
      const info = await this.transporter.sendMail({
        from: `<do-not-reply@example.com>`,
        to,
        subject,
        html,
      });

      console.log('Message sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendVerificationEmail({
    name,
    email,
    verificationToken,
    origin,
  }: {
    name: string;
    email: string;
    verificationToken: string;
    origin: string;
  }) {
    const verifyEmailURL = `${origin}/user/verify-email?token=${verificationToken}&email=${email}`;

    const message = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #4CAF50;">Email Verification</h2>
      <p>Thank you for signing up! Please confirm your email address by clicking the button below:</p>
      <a href="${verifyEmailURL}" 
         style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">
        Verify Email
      </a>
      <p>If the button above doesn’t work, you can also verify your email by copying and pasting the following link into your browser:</p>
      <p><a href="${verifyEmailURL}" style="color: #4CAF50;">${verifyEmailURL}</a></p>
      <p style="font-size: 12px; color: #888;">If you did not request this email, please ignore it.</p>
    </div>
  `;

    return this.sendEmail({
      to: email,
      subject: 'Email Confirmation',
      html: `<h4>Hello ${name},</h4> ${message}`,
    });
  }

  async sendResetPasswordEmail({
    name,
    email,
    token,
    origin,
  }: {
    name: string;
    email: string;
    token: string;
    origin: string;
  }) {
    const resetURL = `${origin}/user/reset-password?token=${token}&email=${email}`;
    const message = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #FF5722;">Reset Your Password</h2>
      <p>We received a request to reset your password. Click the button below to proceed:</p>
      <a href="${resetURL}" 
         style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #FF5722; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
      <p>If the button above doesn’t work, copy and paste the following link into your browser:</p>
      <p><a href="${resetURL}" style="color: #FF5722;">${resetURL}</a></p>
      <p style="font-size: 12px; color: #888;">If you didn’t request a password reset, you can safely ignore this email.</p>
    </div>
  `;

    return this.sendEmail({
      to: email,
      subject: 'Reset Password',
      html: `<h4>Hello ${name},</h4> ${message}`,
    });
  }

  generateVerificationToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }
}
