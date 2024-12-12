import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as cookieParser from 'cookie-parser';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

const startTest = async (testService: TestService) => {
  await testService.deleteManyAddress();
  await testService.deleteManyContact();
  await testService.deleteUser();

  await testService.createUser();
  await testService.verifyEmail();
  await testService.createContact();
  await testService.createManyContacts();
  await testService.createManyAddress();
};

const endTest = async (testService: TestService) => {
  await testService.deleteManyAddress();
  await testService.deleteManyContact();
  await testService.deleteUser();
};

describe('AddressController', () => {
  let app: INestApplication;
  let logger: Logger;
  let testService: TestService;
  const configService = new ConfigService();

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [await ConfigModule.forRoot(), AppModule, TestModule],
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

  describe('POST /api/v1/contacts/:contactId/addresses', () => {
    beforeEach(async () => {
      await testService.deleteManyContact();
      await testService.deleteUser();
      await testService.createUser();
      await testService.verifyEmail();
      await testService.createContact();
      await testService.createManyContacts();
    });

    afterEach(async () => {
      await testService.deleteManyAddress();
      await testService.deleteManyContact();
      await testService.deleteUser();
    });

    it('should be rejected if request is invalid', async () => {
      const tokens = await testService.login(app);
      const contact = await testService.getContactId();

      const response = await request(app.getHttpServer())
        .post(`/api/v1/contacts/${contact.id}/addresses`)
        .send({
          street: '',
          city: '',
          province: '',
          country: '',
          postalCode: '',
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to create address', async () => {
      const tokens = await testService.login(app);
      const contact = await testService.getContactId();

      const response = await request(app.getHttpServer())
        .post(`/api/v1/contacts/${contact.id}/addresses`)
        .send({
          street: 'example street',
          city: 'example city',
          province: 'example province',
          country: 'example country',
          postalCode: '12345',
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(201);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.street).toBe('example street');
      expect(response.body.data.city).toBe('example city');
      expect(response.body.data.province).toBe('example province');
      expect(response.body.data.country).toBe('example country');
      expect(response.body.data.postalCode).toBe('12345');
    });
  });

  describe('GET /api/v1/contacts/:contactId/addresses/:addressId', () => {
    beforeEach(async () => {
      await startTest(testService);
    });

    afterEach(async () => {
      await endTest(testService);
    });

    it('should be rejected if contact is not found', async () => {
      const tokens = await testService.login(app);
      const contact = await testService.getContactId();
      const address = await testService.getAddressId();

      console.info(contact.id);
      console.info(address.id);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/contacts/${contact.id + 9999}/addresses/${address.id}`)
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should be rejected if address is not found', async () => {
      const contact = await testService.getContactId();
      const address = await testService.getAddressId();
      const tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/contacts/${contact.id}/addresses/${address.id + 9999}`)
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to get address', async () => {
      const contact = await testService.getContactId();
      const address = await testService.getAddressId();
      const tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/contacts/${contact.id}/addresses/${address.id}`)
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.street).toBe('example street');
      expect(response.body.data.city).toBe('example city');
      expect(response.body.data.province).toBe('example province');
      expect(response.body.data.country).toBe('example country');
      expect(response.body.data.postalCode).toBe('12345');
    });
  });

  describe('PATCH /api/v1/contacts/:contactId/addresses/:addressId', () => {
    beforeEach(async () => {
      await startTest(testService);
    });

    afterEach(async () => {
      await startTest(testService);
    });

    it('should be rejected if request is invalid', async () => {
      const contact = await testService.getContactId();
      const address = await testService.getAddressId();
      const tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/contacts/${contact.id}/addresses/${address.id}`)
        .send({
          street: '',
          city: '',
          province: '',
          country: '',
          postalCode: '',
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be rejected if contact was not found', async () => {
      const contact = await testService.getContactId();
      const address = await testService.getAddressId();
      const tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/contacts/${contact.id + 999}/addresses/${address.id}`)
        .send({
          street: 'new example street',
          city: 'new example city',
          province: 'new example province',
          country: 'new example country',
          postalCode: '09876',
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should be rejected if address was not found', async () => {
      const contact = await testService.getContactId();
      const address = await testService.getAddressId();
      const tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/contacts/${contact.id}/addresses/${address.id + 9999}`)
        .send({
          street: 'new example street',
          city: 'new example city',
          province: 'new example province',
          country: 'new example country',
          postalCode: '09876',
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to update address', async () => {
      const contact = await testService.getContactId();
      const address = await testService.getAddressId();
      const tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/contacts/${contact.id}/addresses/${address.id}`)
        .send({
          street: 'new example street',
          city: 'new example city',
          province: 'new example province',
          country: 'new example country',
          postalCode: '09876',
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.street).toBe('new example street');
      expect(response.body.data.city).toBe('new example city');
      expect(response.body.data.province).toBe('new example province');
      expect(response.body.data.country).toBe('new example country');
      expect(response.body.data.postalCode).toBe('09876');
    });
  });

  describe('DELETE /api/v1/contacts/:contactId/addresses/:addressId', () => {
    beforeEach(async () => {
      await startTest(testService);
    });

    afterEach(async () => {
      await endTest(testService);
    });

    it('should be rejected if contact does not exist', async () => {
      const contact = await testService.getContactId();
      const address = await testService.getAddressId();
      const tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/contacts/${contact.id + 999}/addresses/${address.id}`)
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should be rejected if address does not exist', async () => {
      const contact = await testService.getContactId();
      const address = await testService.getAddressId();
      const tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/contacts/${contact.id}/addresses/${address.id + 9999}`)
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to delete address', async () => {
      const contact = await testService.getContactId();
      const address = await testService.getAddressId();
      const tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/contacts/${contact.id}/addresses/${address.id}`)
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBeDefined();
    });
  });

  describe('GET /api/v1/contacts/:contactId/addresses', () => {
    beforeEach(async () => {
      await startTest(testService);
    });

    afterEach(async () => {
      await endTest(testService);
    });

    it('should be able to get all addresses', async () => {
      const contact = await testService.getContactId();
      const tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/contacts/${contact.id}/addresses`)
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0].id).toBeDefined();
      expect(response.body.data[0].street).toBe('example street');
      expect(response.body.data[0].city).toBe('example city');
      expect(response.body.data[0].province).toBe('example province');
      expect(response.body.data[0].country).toBe('example country');
      expect(response.body.data[0].postalCode).toBe('12345');
    });
  });
});
