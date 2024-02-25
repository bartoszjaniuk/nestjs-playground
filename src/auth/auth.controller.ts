import { AuthService } from './auth.service';
import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthDto } from './dto';

import { CreateUserDto } from './dto/createUser.dto';
import { JwtGuard, RefreshTokenGuard } from './guard';
import { Response } from 'express';
import { GetRefreshData } from './decorator/getRefreshData.decorator';
import { GetUserId } from './decorator/getUserId.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('register')
  async signup(@Body() dto: CreateUserDto, @Res() res: Response) {
    const register = await this.authService.signup(dto);
    this.authService.storeTokenInCookie(res, {
      refresh_token: register.refresh_token,
      access_token: register.access_token,
    });

    res.status(200).send(register);
  }
  @Post('login')
  async signin(@Body() dto: AuthDto, @Res() res: Response) {
    const login = await this.authService.signin(dto);
    this.authService.storeTokenInCookie(res, {
      refresh_token: login.refresh_token,
      access_token: login.access_token,
    });
    res.status(200).send(login);
  }

  @UseGuards(JwtGuard)
  @Get('logout')
  logout(@GetUserId() userId: number, @Res() res: Response) {
    this.authService.logout(userId);
    res.status(200).send('Success');
  }

  @UseGuards(RefreshTokenGuard)
  @Get('session')
  async session(@GetRefreshData() refreshData: any, @Res() res: Response) {
    const { sub, refreshToken } = refreshData;

    const newAuthToken = await this.authService.refreshTokens(
      sub,
      refreshToken,
    );
    this.authService.storeTokenInCookie(res, newAuthToken);
    res.status(200).send({ user: { id: sub } });
  }
}
