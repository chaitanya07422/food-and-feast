import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AdminUser, AdminUserDocument } from '../schemas/admin-user.schema';

export type JwtPayload = { sub: string; email: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectModel(AdminUser.name)
    private readonly adminModel: Model<AdminUserDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.ff_admin_token ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('sessionSecret'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.adminModel.findById(payload.sub).exec();
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid session');
    }
    return {
      id: user.id as string,
      email: user.email,
      role: user.role,
    };
  }
}
