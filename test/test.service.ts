import { INestApplication, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import * as request from 'supertest';
import { EntityManager } from '@mikro-orm/mysql';
import { Role, User } from '../src/auth/user.entity';
import { Contact } from '../src/contact/contact.entity';
import { Address } from '../src/address/address.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TestService {
  constructor(private readonly em: EntityManager) {}

  async deleteUser() {
    const em = this.em.fork(); // Fork EntityManager for isolated context
    await em.nativeDelete(User, {}); // Deletes all users
  }

  async createUser() {
    const em = this.em.fork(); // Fork EntityManager for isolated context
    const user = em.create(User, {
      email: 'example@example.com',
      password: await argon2.hash('example'),
      username: 'example',
      role: Role.ADMIN,
      emailVerificationToken: 'secret',
    });
    await em.persistAndFlush(user);
  }

  async verifyEmail() {
    const em = this.em.fork(); // Fork EntityManager for isolated context
    const user = await em.findOne(User, { email: 'example@example.com' });
    if (user) {
      user.isVerified = true;
      user.verifiedTime = new Date();
      user.emailVerificationToken = '';
      await em.flush(); // Persist changes
    }
  }

  async login(app: INestApplication) {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'example@example.com',
        password: 'example',
      });

    const cookies = response.header['set-cookie'];
    expect(cookies).toBeDefined();
    console.log(cookies);

    return {
      accessToken: response.body.data.accessToken,
      refreshToken: response.body.data.refreshToken,
      signedAccessToken: cookies[0],
      signedRefreshToken: cookies[1],
    };
  }

  async forgotPassword(app: INestApplication) {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/forgot-password')
      .send({
        email: 'example@example.com',
      });

    return {
      email: response.body.data.email,
      passwordResetToken: response.body.data.passwordResetToken,
    };
  }

  async getUserId(): Promise<User | null> {
    const em = this.em.fork(); // Fork EntityManager for isolated context
    return await em.findOne(User, { username: 'example' });
  }

  async deleteManyContact() {
    const em = this.em.fork(); // Fork EntityManager for isolated context
    await em.nativeDelete(Contact, {});
    await em.flush();
  }

  async createContact() {
    const em = this.em.fork(); // Fork EntityManager for isolated context
    const user = await this.getUserId();
    if (user) {
      const contact = em.create(Contact, {
        firstName: 'example',
        lastName: 'example',
        email: 'example@example.com',
        phone: '082109876543',
        user: user,
      });
      await em.persistAndFlush(contact);
    }
  }

  async getContactId(): Promise<Contact | null> {
    const em = this.em.fork(); // Fork EntityManager for isolated context
    const user = await this.getUserId();
    if (user) {
      return await em.findOne(Contact, { user: user.id });
    }
    return null;
  }

  async deleteManyAddress() {
    const em = this.em.fork(); // Fork EntityManager for isolated context
    await em.nativeDelete(Address, {});
    await em.flush();
  }

  async getAddressId() {
    const em = this.em.fork(); // Fork EntityManager for isolated context
    const contact = await this.getContactId();
    if (contact) {
      return await em.findOne(Address, { contact: contact.id });
    }
    return null;
  }

  async createManyAddress() {
    const em = this.em.fork(); // Fork EntityManager for isolated context
    const contact = await this.getContactId();
    if (contact) {
      const addresses = [
        {
          street: 'example street',
          city: 'example city',
          province: 'example province',
          country: 'example country',
          postalCode: '12345',
          contact: contact,
        },
        {
          street: 'example street 2',
          city: 'example city 2',
          province: 'example province 2',
          country: 'example country 2',
          postalCode: '54321',
          contact: contact,
        },
      ];

      for (const addressData of addresses) {
        const address = em.create(Address, addressData);
        await em.persistAndFlush(address);
      }
    }
  }

  async createManyContacts() {
    const em = this.em.fork(); // Fork EntityManager for isolated context
    const user = await this.getUserId();
    if (user) {
      const contacts = [
        {
          firstName: 'Muhammad',
          lastName: 'Faisal',
          email: 'faisal@example.com',
          phone: '082134567890',
        },
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '081234567891',
        },
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '081234567892',
        },
        {
          firstName: 'Alice',
          lastName: 'Johnson',
          email: 'alice.johnson@example.com',
          phone: '081234567893',
        },
        {
          firstName: 'Bob',
          lastName: 'Brown',
          email: 'bob.brown@example.com',
          phone: '081234567894',
        },
        {
          firstName: 'Charlie',
          lastName: 'Wilson',
          email: 'charlie.wilson@example.com',
          phone: '081234567895',
        },
        {
          firstName: 'David',
          lastName: 'Lee',
          email: 'david.lee@example.com',
          phone: '081234567896',
        },
        {
          firstName: 'Eve',
          lastName: 'Kim',
          email: 'eve.kim@example.com',
          phone: '081234567897',
        },
        {
          firstName: 'Frank',
          lastName: 'Garcia',
          email: 'frank.garcia@example.com',
          phone: '081234567898',
        },
        {
          firstName: 'Grace',
          lastName: 'Martinez',
          email: 'grace.martinez@example.com',
          phone: '081234567899',
        },
        {
          firstName: 'Hank',
          lastName: 'Lopez',
          email: 'hank.lopez@example.com',
          phone: '081234567900',
        },
        {
          firstName: 'Ivy',
          lastName: 'Gonzalez',
          email: 'ivy.gonzalez@example.com',
          phone: '081234567901',
        },
        {
          firstName: 'Jake',
          lastName: 'Perez',
          email: 'jake.perez@example.com',
          phone: '081234567902',
        },
        {
          firstName: 'Karen',
          lastName: 'Sanchez',
          email: 'karen.sanchez@example.com',
          phone: '081234567903',
        },
        {
          firstName: 'Leo',
          lastName: 'Clark',
          email: 'leo.clark@example.com',
          phone: '081234567904',
        },
      ];

      for (const contactData of contacts) {
        const contact = em.create(Contact, { ...contactData, user: user });
        await em.persistAndFlush(contact);
      }
      console.log('15 contacts created');
    }
  }
}
