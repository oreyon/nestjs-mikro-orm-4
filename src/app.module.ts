import { Module } from '@nestjs/common';
import { MikroModule } from './mikro/mikro.module';
import { AuthModule } from './auth/auth.module';
import { ContactModule } from './contact/contact.module';
import { AddressModule } from './address/address.module';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { MikroService } from './mikro/mikro.service';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { NodemailerModule } from './nodemailer/nodemailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // in milliseconds (60 seconds)
        limit: 60, // limit each IP to 60 requests per ttl
      },
    ]),
    MikroModule,
    CommonModule,
    AuthModule,
    ContactModule,
    AddressModule,
    NodemailerModule,
  ],
  controllers: [],
  providers: [
    MikroService,
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
