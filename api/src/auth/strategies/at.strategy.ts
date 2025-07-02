import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

export type JWTPayload = {
  sub: string; // User ID
  email: string; // User email
};

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt-at') {
  constructor(
    private readonly configServices: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configServices.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  validate(payload: JWTPayload) {
    const userId = payload.sub;
    return this.authService.validateJwtUser(userId);
  }
}
