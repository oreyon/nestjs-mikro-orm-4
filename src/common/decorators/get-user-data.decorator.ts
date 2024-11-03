import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../strategies';

export const UserData = createParamDecorator(
  (data: string | number | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    if (!request.user) {
      throw new HttpException('Unauthenticated', 401);
    }

    if (!request.user.jti) {
      // const accessToken = request.headers['accesstoken'] as string;
      const accessToken = request.cookies['accesstoken'] as string;
      if (accessToken) {
        const jwtService = new JwtService();
        const payload = jwtService.decode(accessToken) as JwtPayload;
        if (payload && payload.jti) {
          request.user.jti = payload.jti;
        }
      }
    }

    if (data) {
      return request.user[data];
    }

    return request.user;
  },
);
