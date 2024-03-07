import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { UpdateUserDto } from './dto/updateUser.dto';
import { User } from '@prisma/client';
import { GetFilteredUsersDto, WhereClause } from './dto/get-filtered-users.dto';
import { GetUserFriendsDto } from './dto/get-user-friends.dto';

@Injectable()
export class UserService {
  constructor(private db: DatabaseService) {}

  async update(id: number, user: UpdateUserDto) {
    return await this.db.user.update({
      where: {
        id,
      },
      data: {
        refreshToken: user.refreshToken || '',
      },
    });
  }

  async getMe(id: number) {
    const me = await this.db.user.findUnique({
      where: {
        id,
      },
    });

    return me;
  }

  async getUserFriends(userId: number): Promise<GetUserFriendsDto[] | []> {
    const data = await this.db.user.findUnique({
      where: { id: userId },
      select: {
        friends: {
          select: {
            id: true,
            avatar: true,
            bio: true,
            email: true,
            username: true,
          },
        },
      },
    });

    if (!data?.friends.length) return [];

    return data.friends;
  }

  async getFilteredUsers(
    currentUserId: number,
    params: {
      email?: string;
      username?: string;
    },
  ): Promise<GetFilteredUsersDto[] | []> {
    const whereClause: WhereClause = {
      id: {
        not: currentUserId,
      },
    };

    if (params.email) {
      whereClause['email'] = { contains: params.email };
    }

    if (params.username) {
      whereClause['username'] = { contains: params.username };
    }

    const users = await this.db.user.findMany({
      where: whereClause,
      select: {
        friends: true,
        avatar: true,
        id: true,
        email: true,
        friendOf: true,
      },
    });

    if (!users.length) return [];

    const shapedUsers = users.map((user) => {
      if (user.friendOf.some((friend) => friend.id === currentUserId)) {
        return {
          id: user.id,
          avatar: user.avatar,
          email: user.email,
          isFriend: true,
        };
      }
      return {
        id: user.id,
        avatar: user.avatar,
        email: user.email,
        isFriend: false,
      };
    });

    return shapedUsers;
  }

  async addFriend(userId: number, friendId: number): Promise<User> {
    await this.db.user.update({
      where: { id: userId },
      data: {
        friends: { connect: { id: friendId } },
      },
      include: { friends: true },
    });

    const friend = await this.db.user.update({
      where: { id: friendId },
      data: {
        friends: { connect: { id: userId } },
      },
    });
    return friend;
  }
}
