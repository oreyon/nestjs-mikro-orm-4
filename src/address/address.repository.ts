// address.repository.ts
import { Injectable } from '@nestjs/common';
import { Address } from './address.entity';
import { EntityManager } from '@mikro-orm/mysql';
import { Contact } from '../contact/contact.entity';

@Injectable()
export class AddressRepository {
  constructor(private readonly em: EntityManager) {}

  async createAddress(data: Partial<Address>): Promise<Address> {
    const contact = await this.em.findOneOrFail(Contact, {
      id: data.contact.id,
    });

    const address = this.em.create(Address, {
      street: data.street,
      city: data.city,
      province: data.province,
      country: data.country,
      postalCode: data.postalCode,
      contact: contact,
    });

    await this.em.persistAndFlush(address);
    return address;
  }

  async findAddressByIdAndContactId(
    addressId: number,
    contactId: number,
  ): Promise<Address | null> {
    return await this.em.findOne(Address, {
      id: addressId,
      contact: contactId,
    });
  }

  async updateAddress(
    addressId: number,
    data: Partial<Address>,
  ): Promise<Address> {
    const address = await this.findAddressByIdAndContactId(
      addressId,
      data.contact.id,
    );
    if (address) {
      this.em.assign(address, data); // Update the address entity with the new data
      await this.em.flush(); // Save changes
    }
    return address;
  }

  async deleteAddress(
    addressId: number,
    contactId: number,
  ): Promise<Address | null> {
    const address = await this.findAddressByIdAndContactId(
      addressId,
      contactId,
    );
    if (address) {
      await this.em.removeAndFlush(address);
    }
    return address;
  }

  async findAddressesByContactId(contactId: number): Promise<Address[]> {
    return await this.em.find(Address, { contact: contactId });
  }
}
