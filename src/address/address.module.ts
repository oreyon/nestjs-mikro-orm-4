import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { ContactModule } from '../contact/contact.module';
import { AddressRepository } from './address.repository';

@Module({
  imports: [ContactModule],
  controllers: [AddressController],
  providers: [AddressService, AddressRepository],
})
export class AddressModule {}
