import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import mikroOrmConfig from '../mikro-orm.config';
import { MikroService } from './mikro.service';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

@Module({
  imports: [
    MikroOrmModule.forRoot(mikroOrmConfig),
    WinstonModule.forRoot({
      level: 'debug',
      format: winston.format.combine(
        winston.format.prettyPrint({ colorize: true }),
      ),
      transports: [new winston.transports.Console()],
    }),
  ],
  providers: [MikroService],
  exports: [MikroModule, MikroService],
})
export class MikroModule {}
