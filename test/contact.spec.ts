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

describe('ContactController', () => {
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
    await app.close();
  });

  describe('POST /api/v1/contacts', () => {
    beforeEach(async () => {
      await testService.deleteManyContact();
      await testService.deleteUser();
      await testService.createUser();
      await testService.verifyEmail();
    });

    afterEach(async () => {
      await testService.deleteManyContact();
      await testService.deleteUser();
    });

    it('should be reject if request is invalid', async () => {
      const tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .post('/api/v1/contacts')
        .send({
          firstName: '',
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to create a contact', async () => {
      const tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .post('/api/v1/contacts')
        .send({
          firstName: 'John',
          lastName: 'Smilga',
          email: 'example@example.com',
          phone: '082134567890',
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(201);
      expect(response.body.data.firstName).toBe('John');
      expect(response.body.data.lastName).toBe('Smilga');
      expect(response.body.data.email).toBe('example@example.com');
      expect(response.body.data.phone).toBe('082134567890');
    });
  });

  describe('GET /api/v1/contacts/:contactId', () => {
    beforeEach(async () => {
      await testService.deleteManyContact();
      await testService.deleteUser();
      await testService.createUser();
      await testService.verifyEmail();
      await testService.createContact();
    });

    afterEach(async () => {
      await testService.deleteManyContact();
      await testService.deleteUser();
    });

    it('should be rejected if access token is invalid', async () => {
      const contact = await testService.getContactId();
      const response = await request(app.getHttpServer())
        .get(`/api/v1/contacts/${contact.id}`)
        .set('Cookie', [`accesstoken=wrongtoken`]);

      console.log(`CONTACT ID: ${contact.id}`);
      logger.info(response.body);
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should be rejected if contact is not found', async () => {
      const token = await testService.login(app);
      const contact = await testService.getContactId();
      const response = await request(app.getHttpServer())
        .get(`/api/v1/contacts/${contact.id + 1}`)
        .set(`Cookie`, [`${token.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to get current user', async () => {
      const tokens = await testService.login(app);
      const contact = await testService.getContactId();

      console.log(`Contact Id: ${contact.id}`);
      const response = await request(app.getHttpServer())
        .get(`/api/v1/contacts/${contact.id}`)
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.firstName).toBe('example');
      expect(response.body.data.lastName).toBe('example');
      expect(response.body.data.email).toBe('example@example.com');
      expect(response.body.data.phone).toBeDefined();
    });
  });

  describe('DELETE /api/v1/contacts/:contactId', () => {
    beforeEach(async () => {
      await testService.deleteManyContact();
      await testService.deleteUser();
      await testService.createUser();
      await testService.verifyEmail();
      await testService.createContact();
    });

    afterEach(async () => {
      await testService.deleteManyContact();
      await testService.deleteUser();
    });

    it('should be rejected if contact did not exist', async () => {
      const token = await testService.login(app);
      const contact = await testService.getContactId();

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/contacts/${contact.id}+1`)
        .set('Cookie', [`${token.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to delete contact', async () => {
      const token = await testService.login(app);
      const contact = await testService.getContactId();

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/contacts/${contact.id}`)
        .set('Cookie', [`${token.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data).toBe(true);
    });
  });

  describe('PATCH /api/v1/contacts/:contactId', () => {
    beforeEach(async () => {
      await testService.deleteManyContact();
      await testService.deleteUser();
      await testService.createUser();
      await testService.verifyEmail();
      await testService.createContact();
    });

    afterEach(async () => {
      await testService.deleteManyContact();
      await testService.deleteUser();
    });

    it('should be reject if request is invalid', async () => {
      const tokens = await testService.login(app);
      const contact = await testService.getContactId();

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/contacts/${contact.id}`)
        .send({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be reject if contact does not exist', async () => {
      const tokens = await testService.login(app);
      const contact = await testService.getContactId();

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/contacts/${contact.id + 1}`)
        .send({
          firstName: 'updateExample',
          lastName: 'updateExample',
          email: 'updateExample@example.com',
          phone: '082109876543',
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to update contact', async () => {
      const tokens = await testService.login(app);
      const contact = await testService.getContactId();

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/contacts/${contact.id}`)
        .send({
          firstName: 'updateExample',
          lastName: 'updateExample',
          email: 'updateExample@example.com',
          phone: '082109876543',
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.firstName).toBe('updateExample');
      expect(response.body.data.lastName).toBe('updateExample');
      expect(response.body.data.email).toBe('updateExample@example.com');
      expect(response.body.data.phone).toBe('082109876543');
    });
  });

  describe('GET /api/v1/contacts', () => {
    beforeEach(async () => {
      await testService.deleteManyContact();
      await testService.deleteUser();
      await testService.createUser();
      await testService.verifyEmail();
      await testService.createContact();
      await testService.createManyContacts();
    });

    afterEach(async () => {
      await testService.deleteManyContact();
      await testService.deleteUser();
    });

    it('should be able to get all contacts', async () => {
      const tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .get('/api/v1/contacts')
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(10);
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.total_page).toBe(2);
      expect(response.body.paging.current_page).toBe(1);
    });

    it('should be able to search contact by username', async () => {
      const tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .get('/api/v1/contacts')
        .query({
          username: 'example',
          page: 1,
          size: 10,
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.total_page).toBe(1);
    });

    it('should be able to search contact by email', async () => {
      const tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .get('/api/v1/contacts')
        .query({
          email: 'example@example.com',
          page: 1,
          size: 10,
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.total_page).toBe(1);
      expect(response.body.paging.current_page).toBe(1);
    });

    it('should be able to search contact by phone', async () => {
      const tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .get('/api/v1/contacts')
        .query({
          phone: '081234567904',
          page: 1,
          size: 10,
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.total_page).toBe(1);
      expect(response.body.paging.current_page).toBe(1);
    });

    it('should be able to search contact by username, email, and phone', async () => {
      const tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .get('/api/v1/contacts')
        .query({
          username: 'example',
          email: 'example@example.com',
          phone: '082109876543',
          page: 1,
          size: 10,
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.paging.current_page).toBe(1);
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.total_page).toBe(1);
    });

    it('should be able to search contact by username not found', async () => {
      const tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .get('/api/v1/contacts')
        .query({
          username: 'notfound',
          page: 1,
          size: 10,
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);
    });

    it('should be able to search contact by email not found', async () => {
      const tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .get('/api/v1/contacts')
        .query({
          email: 'wrongemail@wrongemail.com',
          page: 1,
          size: 10,
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);
    });

    it('should be able to search contact by phone not found', async () => {
      const tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .get('/api/v1/contacts')
        .query({
          phone: '969696',
          page: 1,
          size: 10,
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);
    });

    it('should be able to search contach with page', async () => {
      const tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .get('/api/v1/contacts/')
        .query({
          page: 2,
          size: 1,
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.paging.size).toBe(1);
      expect(response.body.paging.current_page).toBe(2);
      expect(response.body.paging.total_page).toBe(16);
    });
  });
});
