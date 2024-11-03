import { Module } from '@nestjs/common';
import { MikroModule } from './mikro/mikro.module';
import { AuthModule } from './auth/auth.module';
import { ContactModule } from './contact/contact.module';
import { AddressModule } from './address/address.module';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MikroModule,
    CommonModule,
    AuthModule,
    ContactModule,
    AddressModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
