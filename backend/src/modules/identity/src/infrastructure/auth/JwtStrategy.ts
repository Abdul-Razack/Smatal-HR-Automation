import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'default_secret',
      passReqToCallback: true,
    });
  }

  async validate(reqOrPayload: any, payloadMaybe?: any) {
    const isRuntimeCallback = payloadMaybe !== undefined;
    const req = isRuntimeCallback ? reqOrPayload : null;
    const payload = isRuntimeCallback ? payloadMaybe : reqOrPayload;

    if (!payload || !payload.sub || !payload.companyId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const isCommon = Boolean(
      payload.isCommon || payload.roles?.includes('SUPER_ADMIN'),
    );

    // Read requested company from header (x-company-id) if request context exists
    const headerCompanyId =
      req?.headers?.['x-company-id'] ||
      req?.headers?.['x-companyid'] ||
      req?.headers?.['company-id'];

    const effectiveCompanyId =
      isCommon && typeof headerCompanyId === 'string' && headerCompanyId.trim()
        ? headerCompanyId.trim()
        : payload.companyId;

    const user: any = {
      id: payload.sub,
      userId: payload.sub,
      email: payload.email,
      companyId: effectiveCompanyId,
      profileId: payload.profileId,
      roles: payload.roles || [],
      permissions: payload.permissions || [],
    };

    if (payload.isCommon !== undefined) {
      user.isCommon = payload.isCommon;
    }
    if (isRuntimeCallback) {
      user.homeCompanyId = payload.companyId;
      user.isCommon = isCommon;
    }

    return user;
  }
}
