import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
// import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';
import { HttpException, Injectable } from '@nestjs/common';
import { JwtPayload } from './accessToken.strategy';
import { EntityManager, MikroORM } from '@mikro-orm/mysql';
import { User } from '../../auth/user.entity';
// import { User } from '@prisma/client';
@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refreshTokenGuard',
) {
  constructor(
    private readonly configService: ConfigService,
    // private readonly prismaService: PrismaService,
    private readonly em: EntityManager,
    private readonly orm: MikroORM,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        // check if the token is in the headers
        // const tokenFromHeaders = req.headers['refreshtoken'];
        // if (tokenFromHeaders) {
        //   return tokenFromHeaders as string;
        // }

        // check if the token is in the cookies
        const tokenFromCookies = req.cookies['refreshtoken'];
        if (tokenFromCookies) {
          return tokenFromCookies;
        }

        return null;
      },
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: JwtPayload,
  ): Promise<{ user: User; refreshToken: string }> {
    // const user = await this.prismaService.user.findFirst({
    //   where: {
    //     id: payload.sub,
    //   },
    // });

    const user = await this.em.findOne(User, { id: payload.sub });

    if (!user) {
      throw new HttpException('Invalid refresh token', 401);
    }

    const refreshToken =
      // req.headers['refreshtoken'] || req.cookies['refreshtoken'];
      req.cookies['refreshtoken'];
    return {
      ...payload,
      user,
      refreshToken,
    };
  }
}
