import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { User } from '@prisma/client';
import { WsException } from '@nestjs/websockets';
import { ThreadsDto } from './dto/threads.dto';
import { GetChatMessagesDto } from './dto/get-chat-messages.dto';
import { GetChatByIdDto } from './dto/get-chat-by-id-dto';
import { CreateChatDto } from './dto/create-chat.dto';

@Injectable()
export class ChatService {
  constructor(private db: DatabaseService) {}

  async getChat(id: number, userId?: number): Promise<GetChatByIdDto> {
    const chat = await this.db.chat.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            userId: true,
          },
          where: {
            userId,
          },
        },
      },
    });

    if (!chat) throw new WsException('Chat does not exist for that user');

    return chat;
  }

  async leaveChat(userId: number, chatId: number): Promise<string> {
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
  ): Promise<CreateChatDto> {
    const exitingChat = await this.db.chat.findFirst({
      include: {
        users: true,
      },
      where: {
        users: {
          every: {
            userId: {
              in: [currentUser.id, recipient.userId],
            },
          },
        },
      },
    });

    if (exitingChat)
      return {
        chatId: exitingChat.id,
      };

    const chat = await this.db.chat.create({
      data: {
        title: `${currentUser.username} + ${recipient.username} chat`,
      },
    });

    const currentUserChat = this.db.usersChats.create({
      data: {
        chatId: chat.id,
        userId: currentUser.id,
      },
      include: {
        user: true,
      },
    });

    const recipientChat = this.db.usersChats.create({
      data: {
        chatId: chat.id,
        userId: Number(recipient.userId),
      },
      include: {
        user: true,
      },
    });

    const userChats = await Promise.all([currentUserChat, recipientChat]);

    return {
      chatId: userChats[0].chatId || userChats[1].chatId,
    };
  }

  async createMessage(authorId: number, chatId: number, content: string) {
    const message = await this.db.message.create({
      data: {
        authorId,
        chatId,
        content,
      },
      select: {
        chatId: true,
        id: true,
        content: true,
        author: {
          select: {
            id: true,
            avatar: true,
            email: true,
            username: true,
          },
        },
      },
    });
    return message;
  }

  async getAllMessages(chatId: number) {
    const messages = await this.db.chat.findUnique({
      where: {
        id: chatId,
      },
      select: {
        messages: true,
      },
    });
    console.log('getAllMessages from chat.service');
    return messages;
  }

  async getUserThreads(userId: number): Promise<ThreadsDto[]> {
    const threads = await this.db.usersChats.findMany({
      where: {
        userId,
      },
      include: {
        chat: {
          include: {
            messages: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
              include: {
                author: true,
              },
            },
          },
        },
      },
    });

    const shapedThreads = threads.map((thread) => ({
      chatId: thread.chatId,
      title: thread.chat.title,
      lastMessage: thread.chat.messages[0]
        ? {
            author: thread.chat.messages[0].author.email, // TODO: CHANGE IT INTO USERNAME
            content: thread.chat.messages[0].content,
          }
        : null,
      messageLastUpdatedAt: thread.chat.messages[0]
        ? thread.chat.messages[0].updatedAt
        : null,
    }));

    return shapedThreads;
  }

  async getChatMessages(chatId: number): Promise<GetChatMessagesDto[] | []> {
    const messages = await this.db.message.findMany({
      where: {
        chatId,
      },
      select: {
        id: true,
        content: true,
        author: {
          select: {
            id: true,
            avatar: true,
            email: true,
            username: true,
          },
        },
      },
    });

    if (!messages.length) {
      return [];
    }

    return messages;
  }
}
