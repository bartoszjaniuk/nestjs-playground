import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { DatabaseService } from 'src/database/database.service';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UserService } from './user.service';
import { GetUserId } from 'src/auth/decorator/getUserId.decorator';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(
    private db: DatabaseService,
    private userService: UserService,
  ) {}

  @Get()
  async getFilteredUsers(
    @GetUserId() userId: string,
    @Query() query: { email?: string; id?: number; username?: string },
  ) {
    return this.userService.getFilteredUsers(+userId, query);
  }

  // TODO: RESPONSE NEED TO BE ADJUSTED. I NEED TO CONSIDER WHAT I NEED ON PROFILE PAGE
  @Get('me')
  async getMe(@GetUserId() userId: number) {
    return await this.userService.getMe(userId);
  }

  @Get('friends')
  async getUserFriends(@GetUserId() userId: number) {
    return await this.userService.getUserFriends(userId);
  }

  @Patch('id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.update(+id, updateUserDto);
  }

  @Post('add/:friendId')
  async addFriend(
    @GetUserId() userId: string,
    @Param('friendId') friendId: string,
  ) {
    return this.userService.addFriend(+userId, +friendId);
  }
}
