export class ThreadsDto {
  chatId: number;
  title: string;
  lastMessage: {
    author: string;
    content: string;
  } | null;
  messageLastUpdatedAt: Date | null;
}
