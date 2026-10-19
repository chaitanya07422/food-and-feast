import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser, type AuthUser } from './current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

const COOKIE = 'ff_admin_token';

@Controller('admin/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  private cookieOptions(req: Request) {
    const nodeEnv = this.config.get<string>('nodeEnv');
    // Secure cookies when production or when nginx terminates TLS (trust proxy)
    const secure =
      nodeEnv === 'production' || Boolean(req.secure) || req.protocol === 'https';
    return {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    };
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    res.cookie(COOKIE, result.token, this.cookieOptions(req));
    return { user: result.user };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const opts = this.cookieOptions(req);
    res.clearCookie(COOKIE, {
      path: opts.path,
      httpOnly: opts.httpOnly,
      sameSite: opts.sameSite,
      secure: opts.secure,
    });
    return { ok: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return this.authService.me(user.id);
  }
}
