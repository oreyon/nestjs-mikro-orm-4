import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
// import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';
import { EntityManager, MikroORM } from '@mikro-orm/mysql';
import { User } from '../../auth/user.entity';

export class JwtPayload {
  jti: string;
  sub: number;
  iat: number;
}

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'accessTokenGuard',
) {
  constructor(
    readonly configService: ConfigService,
    // readonly prismaService: PrismaService,
    readonly em: EntityManager,
    readonly orm: MikroORM,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        // check if the token is in the headers
        // const tokenFromHeaders = req.headers['accesstoken'];
        // if (tokenFromHeaders) {
        //   return tokenFromHeaders as string;
        // }

        // check if the token is in the cookies
        const tokenFromCookies = req.cookies['accesstoken'];
        if (tokenFromCookies) {
          return tokenFromCookies as string;
        }

        return null;
      },
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const jti = payload.jti;
    if (!jti) {
      throw new HttpException('Invalid access token', 401);
    }

    // const user = await this.prismaService.user.findFirst({
    //   where: {
    //     id: payload.sub,
    //   },
    // });

    const user = await this.em.findOne(User, { id: payload.sub });

    if (!user) {
      throw new HttpException('Invalid access token', 401);
    }

    return user;
  }
}
