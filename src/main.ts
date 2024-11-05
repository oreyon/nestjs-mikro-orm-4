import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const configService = new ConfigService();
  const app = await NestFactory.create(AppModule);
  console.log(process.env.TEST);
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);

  app.use(cookieParser());
  app.useLogger(logger);
  app.enableCors({
    origin: [configService.get('IP_FRONTEND_ORIGIN')],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders:
      'Content-Type, Accept, Authorization, accesstoken, refreshtoken', // allow custom header
    credentials: true, // enable set cookie
  });

  // enable shutdown hooks for SIGTERM so mikroOrm connection will closed if process is terminated
  app.enableShutdownHooks();
  await app.listen(3000);
}
bootstrap();
