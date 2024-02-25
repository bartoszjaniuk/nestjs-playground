import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GetWsUser } from 'src/auth/decorator';
import { WsAuthGuard } from 'src/auth/guard/ws.guard';
import { ValidatePayload } from 'src/auth/strategy';
import { ChatService } from './chat.service';

export type CreateMessageDto = {
  authorId: number;
  content: string;
  chatId: number;
};

const createChatName = (chatId: number) => `chat-${chatId}`;

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173'],
    credentials: true,
  },
})
@UseGuards(WsAuthGuard)
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  afterInit() {
    console.log('Initialized!');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('getMessages')
  async getMessages(@MessageBody() chatId: number) {
    const messages = await this.chatService.getChatMessages(chatId);

    this.server.to(createChatName(chatId)).emit('receiveMessage', messages);
  }

  @SubscribeMessage('joinToChat')
  async joinToChat(
    @MessageBody() chatId: number,
    @ConnectedSocket() socket: Socket,
    @GetWsUser() currentUser: ValidatePayload,
  ) {
    const userId = currentUser.sub;
    await this.chatService.getChat(chatId, userId);

    socket.join(createChatName(chatId));
    const messages = await this.chatService.getChatMessages(chatId);
    socket.emit('receiveMessage', messages);

    this.server
      .to(createChatName(chatId))
      .emit('connectedUser', { userId: socket.id });
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @GetWsUser() user: ValidatePayload,
    @MessageBody() createMessageDto: CreateMessageDto,
  ) {
    const newMessage = await this.chatService.createMessage(
      user.sub,
      createMessageDto.chatId,
      createMessageDto.content,
    );

    this.server
      .to(createChatName(newMessage.chatId))
      .emit('receiveMessage', [newMessage]);
  }

  @SubscribeMessage('typing')
  async typing(
    @MessageBody() payload: { chatId: number; isTyping: boolean },
    @ConnectedSocket() socket: Socket,
  ) {
    socket.broadcast
      .to(createChatName(payload.chatId))
      .emit('typing', payload.isTyping);
  }
}
