// address.service.ts
import { Injectable, Inject, HttpException } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { AddressRepository } from './address.repository';
import { ValidationService } from '../common/validation.service';
import { ContactService } from '../contact/contact.service';
import { User } from '../auth/user.entity';
import {
  CreateAddressReq,
  CreateAddressRes,
  GetAddressReq,
  GetAddressRes,
  RemoveAddressReq,
  RemoveAddressRes,
  UpdateAddressReq,
  UpdateAddressRes,
} from './address.dto';
import { AddressValidation } from './address.validation';

@Injectable()
export class AddressService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly validationService: ValidationService,
    private readonly contactService: ContactService,
    private readonly addressRepository: AddressRepository,
  ) {}

  async create(
    user: User,
    request: CreateAddressReq,
  ): Promise<CreateAddressRes> {
    this.logger.debug(`CREATE ADDRESS: ${JSON.stringify(request)}`);

    const create: CreateAddressReq = this.validationService.validate(
      AddressValidation.CREATE,
      request,
    );

    const contact = await this.contactService.checkContactExist(
      user.id,
      create.contactId,
    );

    const address = await this.addressRepository.createAddress({
      street: create.street,
      city: create.city,
      province: create.province,
      country: create.country,
      postalCode: create.postalCode,
      contact: contact,
    });

    return {
      id: address.id,
      street: address.street,
      city: address.city,
      province: address.province,
      country: address.country,
      postalCode: address.postalCode,
    };
  }

  async getAddress(user: User, request: GetAddressReq): Promise<GetAddressRes> {
    this.logger.debug(`GET ADDRESS: ${JSON.stringify(request)}`);

    const get: GetAddressReq = this.validationService.validate(
      AddressValidation.GET,
      request,
    );

    await this.contactService.checkContactExist(user.id, get.contactId);

    const address = await this.addressRepository.findAddressByIdAndContactId(
      get.addressId,
      get.contactId,
    );

    if (!address) {
      throw new HttpException(`Address not found`, 404);
    }

    return {
      id: address.id,
      street: address.street,
      city: address.city,
      province: address.province,
      country: address.country,
      postalCode: address.postalCode,
    };
  }

  async updateAddress(
    user: User,
    request: UpdateAddressReq,
  ): Promise<UpdateAddressRes> {
    this.logger.debug(`UPDATE ADDRESS: ${JSON.stringify(request)}`);

    const update: UpdateAddressReq = this.validationService.validate(
      AddressValidation.UPDATE,
      request,
    );

    const contact = await this.contactService.checkContactExist(
      user.id,
      update.contactId,
    );

    const address = await this.addressRepository.updateAddress(update.id, {
      contact: contact,
      street: update.street,
      city: update.city,
      province: update.province,
      country: update.country,
      postalCode: update.postalCode,
    });

    if (!address) {
      throw new HttpException(`Address not found`, 404);
    }

    return {
      id: address.id,
      street: address.street,
      city: address.city,
      province: address.province,
      country: address.country,
      postalCode: address.postalCode,
    };
  }

  async deleteAddress(
    user: User,
    request: RemoveAddressReq,
  ): Promise<RemoveAddressRes> {
    this.logger.debug(`DELETE ADDRESS: ${JSON.stringify(request)}`);

    const remove: RemoveAddressReq = this.validationService.validate(
      AddressValidation.REMOVE,
      request,
    );

    await this.contactService.checkContactExist(user.id, remove.contactId);

    const address = await this.addressRepository.deleteAddress(
      remove.addressId,
      remove.contactId,
    );

    if (!address) {
      throw new HttpException(`Address not found`, 404);
    }

    return {
      id: address.id,
      street: address.street,
      city: address.city,
      province: address.province,
      country: address.country,
      postalCode: address.postalCode,
    };
  }

  async listAddresses(user: User, contactId: number): Promise<GetAddressRes[]> {
    this.logger.debug(`LIST ADDRESSES: ${contactId}`);

    await this.contactService.checkContactExist(user.id, contactId);

    const addresses =
      await this.addressRepository.findAddressesByContactId(contactId);

    return addresses.map((address) => ({
      id: address.id,
      street: address.street,
      city: address.city,
      province: address.province,
      country: address.country,
      postalCode: address.postalCode,
    }));
  }
}
