import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/createUser.dto';
import { UserService } from 'src/user/user.service';

@Injectable() // it means that this service will use dependency injection
export class AuthService {
  constructor(
    private db: DatabaseService,
    private jwt: JwtService,
    private userService: UserService,
  ) {}
  async signup(dto: CreateUserDto) {
    const passwordHashed = await argon.hash(dto.password);

    try {
      const isUserExists = await this.db.user.findUnique({
        where: {
          email: dto.email,
        },
      });

      if (isUserExists) {
        throw new BadRequestException('User already exists');
      }

      const user = await this.db.user.create({
        data: {
          email: dto.email,
          password: passwordHashed,
          refreshToken: '',
        },
      });

      const { accessToken, refreshToken } = await this.signTokens(
        user.id,
        user.email,
      );

      await this.updateRefreshToken(user.id, refreshToken);

      return {
        accessToken,
        refreshToken,
        user: {
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
        },
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }
  async signin(dto: AuthDto) {
    const user = await this.db.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('User does not exist');

    const isPasswordMatch = await argon.verify(user.password, dto.password);

    if (!isPasswordMatch)
      throw new ForbiddenException('Invalid email or password');

    const { accessToken, refreshToken } = await this.signTokens(
      user.id,
      user.email,
    );

    await this.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
      },
    };
  }

  async logout(userId: number) {
    return this.userService.update(userId, { refreshToken: '' });
  }

  async signTokens(
    userId: number,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId, email };

    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: '1m',
      secret: process.env.JWT_REFRESH_SECRET,
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET,
    });

    return { accessToken, refreshToken };
  }

  async refreshTokens(id: number, refreshToken: string) {
    const user = await this.db.user.findUnique({ where: { id } });
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');
    const refreshTokenMatches = await argon.verify(
      user.refreshToken,
      refreshToken,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
    const tokens = await this.signTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await argon.hash(refreshToken);
    await this.userService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }
}
