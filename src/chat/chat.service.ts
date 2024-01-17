import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { User } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private db: DatabaseService) {}

  async getChat(id: number) {
    const chat = await this.db.chat.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            user: true,
          },
        },
        messages: true,
      },
    });

    if (!chat) return 'Chat does not exist';

    console.log({ chat });

    if (chat?.users && chat?.users.length < 0) return 'Chat is empty';

    return chat;
  }

  async leaveChat(userId: number, chatId: number) {
    try {
      // Check if the user is part of the chat
      const userInChat = await this.db.usersChats.findUnique({
        where: {
          userId_chatId: {
            userId,
            chatId,
          },
        },
      });

      if (!userInChat) {
        throw new Error('User is not part of the chat');
      }

      // Remove the user from the chat
      await this.db.usersChats.delete({
        where: {
          userId_chatId: {
            userId,
            chatId,
          },
        },
      });

      return 'User successfully left the chat';
    } catch (error) {
      console.error('Error leaving chat:', error.message);
      throw error;
    }
  }

  async createChat(
    currentUser: User,
    recipient: { userId: number; username: string },
  ) {
    const chat = await this.db.chat.create({
      data: {
        title: `${currentUser.username + recipient.username} chat`,
      },
    });

    await this.db.usersChats.create({
      data: {
        userId: currentUser.id,
        chatId: chat.id,
      },
      include: {
        user: true,
      },
    });
  }
}
