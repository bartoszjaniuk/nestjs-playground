import { AuthService } from './auth.service';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthDto } from './dto';
import { GetUser } from './decorator';
import { User } from '@prisma/client';

import { CreateUserDto } from './dto/createUser.dto';
import { JwtGuard, RefreshTokenGuard } from './guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('register')
  signup(@Body() dto: CreateUserDto) {
    return this.authService.signup(dto);
  }
  @Post('login')
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }

  @UseGuards(JwtGuard)
  @Get('logout')
  logout(@GetUser() user: User) {
    this.authService.logout(user.id);
    return;
  }

  @UseGuards(RefreshTokenGuard)
  @Get('session')
  session(@GetUser() user: User) {
    const { id, refreshToken } = user;
    return this.authService.refreshTokens(id, refreshToken);
  }
}
