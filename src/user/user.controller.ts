import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { DatabaseService } from 'src/database/database.service';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(
    private db: DatabaseService,
    private userService: UserService,
  ) {}
  @Get('me')
  async getMe(@GetUser() user: User) {
    return user;
  }

  @Patch('id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }
}
