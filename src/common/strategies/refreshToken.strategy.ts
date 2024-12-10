import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { HttpException, Injectable } from '@nestjs/common';
import { JwtPayload } from './accessToken.strategy';
import { EntityManager, MikroORM } from '@mikro-orm/mysql';
import { User } from '../../auth/user.entity';
@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refreshTokenGuard',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly em: EntityManager,
    private readonly orm: MikroORM,
  ) {
    super({
      // take token from custom header

      // jwtFromRequest: (req: Request) => {
      //   // check if the token is in the headers
      //   // const tokenFromHeaders = req.headers['refreshtoken'];
      //   // if (tokenFromHeaders) {
      //   //   return tokenFromHeaders as string;
      //   // }

      //   // check if the token is in the cookies
      //   const tokenFromCookies = req.cookies['refreshtoken'];
      //   if (tokenFromCookies) {
      //     return tokenFromCookies;
      //   }

      //   return null;
      // },

      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        RefreshTokenStrategy.extractJWT,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  private static extractJWT(req: Request): string | null {
    const tokenFromCookies = req.signedCookies['refreshtoken'];
    if (tokenFromCookies) {
      return tokenFromCookies;
    }

    return null;
  }

  async validate(
    req: Request,
    payload: JwtPayload,
  ): Promise<{ user: User; refreshToken: string }> {
    const user = await this.em.findOne(User, { id: payload.sub });

    if (!user) {
      throw new HttpException('Invalid refresh token', 401);
    }

    // const refreshToken = req.get('Authorization').split(' ')[1];
    const refreshToken =
      req.signedCookies['refreshtoken'] ||
      req.headers.authorization.split(' ')[1];

    if (!refreshToken) {
      throw new HttpException('Refresh token not found in cookies', 401);
    }

    return {
      ...payload,
      user,
      refreshToken,
    };
  }
}
