import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UserService {
  constructor(private db: DatabaseService) {}
  async update(id: number, user: UpdateUserDto) {
    return this.db.user.update({
      where: {
        id,
      },
      data: {
        refreshToken: user.refreshToken || '',
      },
    });
  }
}
