import {
  Entity,
  PrimaryKey,
  Property,
  Enum,
  OneToMany,
  Unique,
  Collection,
} from '@mikro-orm/core';
import { Contact } from '../contact/contact.entity';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey()
  id!: number;

  @Property({ length: 100 })
  @Unique()
  email!: string;

  @Property({ length: 100 })
  @Unique()
  username!: string;

  @Property({ length: 100 })
  password!: string;

  @Enum(() => Role)
  role: Role;

  @Property({ length: 255, nullable: true })
  refreshToken?: string;

  @Property({ default: false })
  isVerified: boolean = false;

  @Property({ nullable: true, columnType: 'datetime' })
  verifiedTime?: Date;

  @Property({ length: 255, nullable: true })
  emailVerificationToken?: string;

  @Property({ length: 255, nullable: true })
  passwordResetToken?: string;

  @Property({ nullable: true, columnType: 'datetime' })
  passwordResetTokenExpirationTime?: Date;

  @Property({
    onCreate: () => new Date(),
    columnType: 'datetime',
  })
  createdAt: Date;

  @Property({
    onCreate: () => new Date(),
    onUpdate: () => new Date(),
    columnType: 'datetime',
  })
  updatedAt: Date;

  @OneToMany(() => Contact, (contact) => contact.user)
  contacts = new Collection<Contact>(this);
}
