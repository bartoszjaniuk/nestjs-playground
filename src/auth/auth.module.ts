import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DatabaseModule } from 'src/database/database.module';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy';
import { RefreshTokenStrategy } from './strategy/refreshToken.strategy';
import { UserService } from 'src/user/user.service';
import { WsJwtStrategy } from './strategy/ws.strategy';
import { WsAuthGuard } from './guard/ws.guard';

@Module({
  imports: [DatabaseModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenStrategy,
    UserService,
    WsJwtStrategy,
    WsAuthGuard,
  ],
})
export class AuthModule {}
