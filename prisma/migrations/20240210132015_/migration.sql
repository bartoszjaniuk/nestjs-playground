/*
  Warnings:

  - The primary key for the `UsersChats` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[userId,chatId]` on the table `UsersChats` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UsersChats" DROP CONSTRAINT "UsersChats_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "UsersChats_userId_chatId_key" ON "UsersChats"("userId", "chatId");
