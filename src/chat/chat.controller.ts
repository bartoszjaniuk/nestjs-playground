import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  Body,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtGuard } from 'src/auth/guard';
import { GetUser, GetUserId } from 'src/auth/decorator';
import { User } from '@prisma/client';
import { ChatGateway } from './chat.gateway';

type CreateChatDto = {
  userId: number;
  username: string;
};

@UseGuards(JwtGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private chatGateway: ChatGateway,
  ) {}

  @Get('threads')
  getThreads(@GetUserId() id: string) {
    return this.chatService.getUserThreads(+id);
  }

  @Get(':id/messages')
  getChatMessages(@Param('id') id: string) {
    return this.chatService.getChatMessages(+id);
  }

  @Get(':id')
  getChat(@Param('id') id: string) {
    return this.chatService.getChat(+id);
  }

  @Post('create')
  createChat(@GetUser() user: User, @Body() createChatDto: CreateChatDto) {
    this.chatGateway.server.emit('joinRoom');
    return this.chatService.createChat(user, createChatDto);
  }

  @Delete('leave/:chatId')
  delete(@Param('chatId') chatId: string, @GetUser() user: User) {
    return this.chatService.leaveChat(user.id, +chatId);
  }
}
