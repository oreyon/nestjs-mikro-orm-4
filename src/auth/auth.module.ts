import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { NodemailerModule } from '../nodemailer/nodemailer.module';

@Module({
  imports: [JwtModule.register({}), NodemailerModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [],
})
export class AuthModule {}
