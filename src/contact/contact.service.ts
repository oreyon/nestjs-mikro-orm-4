import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ValidationService } from '../common/validation.service';
import {
  CreateContactRequest,
  CreateContactResponse,
  GetContactResponse,
  SearchContactReq,
  SearchContactRes,
  UpdateContactReq,
  UpdateContactRes,
} from './contact.dto';
import { ContactValidation } from './contact.validation';
import { Paging } from '../model/web.model';
import { EntityManager, MikroORM } from '@mikro-orm/mysql';
import { User } from '../auth/user.entity';
import { Contact } from './contact.entity';

@Injectable()
export class ContactService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private validationService: ValidationService,
    private em: EntityManager,
    private orm: MikroORM,
  ) {}

  async create(
    user: User,
    request: CreateContactRequest,
  ): Promise<CreateContactResponse> {
    this.logger.debug(`CREATE CONTACT: ${JSON.stringify(request)}`);

    const createRequest: CreateContactRequest = this.validationService.validate(
      ContactValidation.CREATE,
      request,
    );

    const contact = this.em.create(Contact, {
      firstName: createRequest.firstName,
      lastName: createRequest.lastName,
      email: createRequest.email,
      phone: createRequest.phone,
      user: user, // assuming user is a reference entity (not user.id)
    });

    await this.em.persistAndFlush(contact);

    return {
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
    };
  }

  async getContact(user: User, contactId: number): Promise<GetContactResponse> {
    this.logger.debug(`GET CONTACT: ${JSON.stringify(contactId)}`);

    const contact = await this.em.findOne(Contact, { id: contactId });

    if (!contact) {
      throw new HttpException(`Contact is not found`, 404);
    }

    return {
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
    };
  }

  async checkContactExist(userId: number, contactId: number): Promise<Contact> {
    const contact = await this.em.findOne(Contact, {
      id: contactId,
      user: userId,
    });

    if (!contact) {
      throw new HttpException(`Contact is not found`, 404);
    }

    return contact;
  }

  async deleteContact(user: User, contactId: number): Promise<boolean> {
    this.logger.debug(`DELETE CONTACT: ${JSON.stringify(contactId)}`);

    const contact = await this.checkContactExist(user.id, contactId);

    if (contact.user.id !== user.id) {
      throw new HttpException(`Forbidden`, 403);
    }

    await this.em.removeAndFlush(contact);

    return true;
  }

  async updateContact(
    user: User,
    request: UpdateContactReq,
  ): Promise<UpdateContactRes> {
    this.logger.debug(`UPDATE CONTACT: ${JSON.stringify(request)}`);

    const update: UpdateContactReq = this.validationService.validate(
      ContactValidation.UPDATE,
      request,
    );

    const checkContact = await this.checkContactExist(user.id, update.id);

    if (checkContact.user.id !== user.id) {
      throw new HttpException(`Forbidden`, 403);
    }

    checkContact.firstName = update.firstName;
    checkContact.lastName = update.lastName;
    checkContact.email = update.email;
    checkContact.phone = update.phone;
    await this.em.flush();

    return {
      id: update.id,
      firstName: update.firstName,
      lastName: update.lastName,
      email: update.email,
      phone: update.phone,
    };
  }

  async searchContact(
    user: User,
    request: SearchContactReq,
  ): Promise<{ data: SearchContactRes[]; paging: Paging }> {
    this.logger.debug(`SEARCH CONTACT: ${JSON.stringify(request)}`);

    const searchReq: SearchContactReq = this.validationService.validate(
      ContactValidation.SEARCH,
      request,
    );

    const filters = [];

    if (searchReq.username) {
      filters.push({
        OR: [
          {
            firstName: {
              contains: searchReq.username,
            },
          },
          {
            lastName: {
              contains: searchReq.username,
            },
          },
        ],
      });
    }

    if (searchReq.email) {
      filters.push({
        email: {
          contains: searchReq.email,
        },
      });
    }

    if (searchReq.phone) {
      filters.push({
        phone: {
          contains: searchReq.phone,
        },
      });
    }

    const skip = (searchReq.page - 1) * searchReq.size;

    const contacts = await this.em.find(
      Contact,
      {
        user: user,
        $and: filters,
      },
      {
        limit: searchReq.size, // `take` in Prisma corresponds to `limit` in MikroORM
        offset: skip, // `skip` in Prisma corresponds to `offset` in MikroORM
      },
    );

    const totalPages = await this.em.count(Contact, {
      user: user,
      $and: filters,
    });

    return {
      data: contacts.map((contact) => {
        return {
          id: contact.id,
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          phone: contact.phone,
        };
      }),
      paging: {
        current_page: searchReq.page,
        size: searchReq.size,
        total_page: Math.ceil(totalPages / searchReq.size),
      },
    };
  }
}
