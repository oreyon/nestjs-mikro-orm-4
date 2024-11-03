import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import { User } from '../auth/user.entity';
import { Address } from '../address/address.entity';

@Entity({ tableName: 'contacts' })
export class Contact {
  @PrimaryKey()
  id!: number;

  @Property({ length: 100 })
  firstName!: string;

  @Property({ length: 100, nullable: true })
  lastName?: string;

  @Property({ length: 100, nullable: true })
  email?: string;

  @Property({ length: 20, nullable: true })
  phone?: string;

  @ManyToOne(() => User)
  user!: User;

  @OneToMany(() => Address, (address) => address.contact)
  address = new Collection<Address>(this);
}
