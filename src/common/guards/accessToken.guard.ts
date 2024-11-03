import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AccessTokenGuard extends AuthGuard('accessTokenGuard') {
  constructor(private reflector: Reflector) {
    super();
  }
}
