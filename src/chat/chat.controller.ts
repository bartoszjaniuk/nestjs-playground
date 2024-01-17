import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { User } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':id')
  getChat(@Param('id') id: string) {
    return this.chatService.getChat(+id);
  }

  @Post('create/:recipientId')
  createChat(@Param('chatId') chatId: string, @GetUser() user: User) {
    return this.chatService.createChat(user, { userId: 2, username: 'Zdzich' });
  }

  @Delete('leave/:chatId')
  delete(@Param('chatId') chatId: string, @GetUser() user: User) {
    return this.chatService.leaveChat(user.id, +chatId);
  }
}
