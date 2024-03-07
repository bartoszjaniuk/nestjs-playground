import { PrismaClient } from '@prisma/client';
import { CreateUserDto } from 'src/auth/dto/createUser.dto';
import * as argon from 'argon2';

const prisma = new PrismaClient();

const USERS: CreateUserDto[] = [
  {
    email: 'user@user.com',
    password: 'password',
    avatar: 'https://monsterapi.ai/images/apis/llama2-7b-chat.png',
    username: 'Lama Dev',
    refreshToken: '',
  },
  {
    email: 'user2@user.com',
    password: 'password',
    avatar: 'https://monsterapi.ai/images/apis/mpt-7b-instruct.webp',
    username: 'Robo Chair Man',
    refreshToken: '',
  },
  {
    email: 'user3@user.com',
    password: 'password',
    avatar:
      'https://qbcontent.nyc3.cdn.digitaloceanspaces.com/monsterweb/text-to-image-doc.webp',
    username: 'astronaut horse rider',
    refreshToken: '',
  },
  {
    email: 'user4@user.com',
    password: 'password',
    avatar: 'https://monsterapi.ai/images/apis/photo-maker-display.jpg',
    username: 'Doggo Astronaut',
    refreshToken: '',
  },
];

async function main() {
  console.log(USERS, 'USERS');

  USERS.forEach(async (user) => {
    const hashedPassword = await argon.hash(user.password);

    await prisma.user.create({
      data: {
        ...user,
        password: hashedPassword,
      },
    });
  });
  console.log('Data seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
