import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log(process.env.TEST);
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);

  app.use(cookieParser());
  app.useLogger(logger);
  await app.listen(3000);
}
bootstrap();
