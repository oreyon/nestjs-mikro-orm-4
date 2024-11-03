import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Contact } from '../contact/contact.entity';

@Entity({ tableName: 'addresses' })
export class Address {
  @PrimaryKey()
  id!: number;

  @Property({ length: 255, nullable: true })
  street?: string;

  @Property({ length: 100, nullable: true })
  city?: string;

  @Property({ length: 100, nullable: true })
  province?: string;

  @Property({ length: 100 })
  country!: string;

  @Property({ length: 10, nullable: true })
  postalCode?: string;

  @ManyToOne(() => Contact)
  contact!: Contact;
}
