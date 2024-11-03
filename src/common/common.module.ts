import { Global, Module } from '@nestjs/common';
import { ValidationService } from './validation.service';
import { APP_FILTER } from '@nestjs/core';
import { ErrorFilter } from './errors';
import { AccessTokenStrategy, RefreshTokenStrategy } from './strategies';

@Global()
@Module({
  providers: [
    ValidationService,
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
    AccessTokenStrategy,
    RefreshTokenStrategy,
  ],
  exports: [ValidationService, AccessTokenStrategy, RefreshTokenStrategy],
})
export class CommonModule {}
