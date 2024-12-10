import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as cookieParser from 'cookie-parser';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  let app: INestApplication;
  let logger: Logger;
  let testService: TestService;
  const configService = new ConfigService();

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    logger = app.get(WINSTON_MODULE_PROVIDER);
    testService = app.get(TestService);

    app.use(
      cookieParser([
        `${configService.get('JWT_ACCESS_TOKEN_SECRET')}`,
        `${configService.get('JWT_REFRESH_TOKEN_SECRET')}`,
      ]),
    );
    app.enableShutdownHooks();
    await app.init();
  });

  afterEach(async () => {
    app.close();
  });

  describe('POST /api/v1/auth/register', () => {
    beforeEach(async () => {
      await testService.deleteUser();
    });

    afterEach(async () => {
      await testService.deleteUser();
    });

    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: '',
          password: '',
          username: '',
        });

      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to register a user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'example@example.com',
          password: 'example',
          username: 'example',
        });

      logger.info(response.body);
      expect(response.status).toBe(201);
      expect(response.body.data.email).toBe('example@example.com');
      expect(response.body.data.username).toBe('example');
      expect(response.body.data.emailVerificationToken).toBe('secret');
    });

    it('should be rejected if username is already taken', async () => {
      await testService.createUser();

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'example@exampple.com',
          password: 'example',
          username: 'example',
        });

      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/verify-email', () => {
    beforeEach(async () => {
      await testService.deleteUser();
      await testService.createUser();
    });

    afterEach(async () => {
      await testService.deleteUser();
    });

    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/verify-email')
        .send({
          email: '',
          emailVerificationToken: '',
        });

      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be rejected if token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/verify-email')
        .send({
          email: 'example@example.com',
          emailVerificationToken: '',
        });

      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be rejected if email is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/verify-email')
        .send({
          email: '',
          emailVerificationToken: 'secret',
        });

      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to verify email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/verify-email')
        .send({
          email: 'example@example.com',
          emailVerificationToken: 'secret',
        });

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe('example@example.com');
      expect(response.body.data.role).toBe('ADMIN');
      expect(response.body.data.isVerified).toBe(true);
      expect(response.body.data.verifiedTime).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await testService.deleteUser();
      await testService.createUser();
      await testService.verifyEmail();
    });

    afterEach(async () => {
      await testService.deleteUser();
    });

    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: '',
          password: '',
        });

      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be rejected if email is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: '',
          password: 'example',
        });

      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be rejected if password is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'example@example.com',
          password: '',
        });

      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to login', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'example@example.com',
          password: 'example',
        });

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe('example@example.com');
      expect(response.body.data.username).toBe('example');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });
  });

  describe('GET /api/v1/auth/current', () => {
    beforeEach(async () => {
      await testService.deleteUser();
      await testService.createUser();
      await testService.verifyEmail();
    });

    afterEach(async () => {
      await testService.deleteUser();
    });

    it('should be rejected if access token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/current')
        .set('Cookie', [`accesstoken=wrongtoken`]);

      logger.info(response.body);
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to get current user', async () => {
      const tokens = await testService.login(app);
      console.log(tokens.signedAccessToken);
      console.log(tokens.signedRefreshToken);

      // Pass signed token to cookie
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/current')
        // .set('Authorization', `Bearer ${tokens.accessToken}`);
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      console.log('Response:', response);

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe('example@example.com');
      expect(response.body.data.username).toBe('example');
      expect(response.body.data.role).toBeDefined();
    });
  });

  describe('DELETE /api/v1/auth/logout', () => {
    beforeEach(async () => {
      await testService.deleteUser();
      await testService.createUser();
      await testService.verifyEmail();
    });

    afterEach(async () => {
      await testService.deleteUser();
    });

    it('should be rejected if access token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/v1/auth/logout')
        .set('Cookie', [`accesstoken=wrongtoken`]);

      logger.info(response.body);
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to logout', async () => {
      const tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .delete('/api/v1/auth/logout')
        .set('Cookie', [`${tokens.signedAccessToken}`]);
      // .set('Authorization', `Bearer ${tokens.accessToken}`);

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data).toBe(true);
    });
  });

  describe('POST /api/v1/auth/refresh-token', () => {
    beforeEach(async () => {
      await testService.deleteUser();
      await testService.createUser();
      await testService.verifyEmail();
    });

    afterEach(async () => {
      await testService.deleteUser();
    });

    it('should be rejected if refresh token is invalid', async () => {
      const tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh-token')
        .set('Cookie', [`refreshtoken=a${tokens.refreshToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to refresh token', async () => {
      const tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh-token')
        // .set('Cookie', [`refreshtoken=${tokens.refreshToken}`]);
        .set('Authorization', `Bearer ${tokens.refreshToken}`);

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    beforeEach(async () => {
      await testService.deleteUser();
      await testService.createUser();
      await testService.verifyEmail();
    });

    afterEach(async () => {
      await testService.deleteUser();
    });

    it('should be rejected if email is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'wrongexample@example.com',
        });

      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to send secret token to reset password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'example@example.com',
        });

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe('example@example.com');
      expect(response.body.data.passwordResetToken).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/reset-password', () => {
    beforeEach(async () => {
      await testService.deleteUser();
      await testService.createUser();
      await testService.verifyEmail();
    });

    afterEach(async () => {
      await testService.deleteUser();
    });

    it('should be rejected if input is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({
          email: '',
          newPassword: '',
          repeatNewPassword: '',
          resetPasswordToken: '',
        });

      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be rejected if token is wrong', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({
          email: 'example@example.com',
          newPassword: 'newexample',
          repeatNewPassword: 'newexample',
          resetPasswordToken: 'wrongsecret',
        });

      logger.info(response.body);
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to reset password', async () => {
      const forgotPassword = await testService.forgotPassword(app);

      console.info(forgotPassword.passwordResetToken);
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({
          email: 'example@example.com',
          newPassword: 'newexample',
          repeatNewPassword: 'newexample',
          resetPasswordToken: `secret`,
        });

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe('example@example.com');
      expect(response.body.data.username).toBeDefined();
    });
  });
});
