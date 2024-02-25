-- DropIndex
DROP INDEX "UsersChats_userId_chatId_key";

-- AlterTable
ALTER TABLE "UsersChats" ADD CONSTRAINT "UsersChats_pkey" PRIMARY KEY ("userId", "chatId");
