import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { ValidatePayload } from './refreshToken.strategy';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtStrategy extends PassportStrategy(Strategy, 'ws') {
  constructor() {
    super({
      jwtFromRequest: WsJwtStrategy.extractJWT,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(req: ValidatePayload) {
    try {
      return req;
    } catch (error) {
      throw new WsException('Unauthorized access');
    }
  }

  private static extractJWT(req: Request): string | null {
    const token = extractAccessToken(req.headers.cookie);
    if (!token) return null;

    return token;
  }
}

function extractAccessToken(cookiesString: string | undefined) {
  if (!cookiesString) return null;
  const cookiesArray = cookiesString.split(';');
  let accessToken = null;

  cookiesArray.forEach((cookie) => {
    const cookiePair = cookie.trim().split('=');
    if (cookiePair[0] === 'access_token') {
      accessToken = decodeURIComponent(cookiePair[1]);
    }
  });

  return accessToken;
}
