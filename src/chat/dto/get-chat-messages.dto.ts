export class GetChatMessagesDto {
  id: number;
  content: string;
  author: {
    id: number;
    email: string;
    username: string | null;
    avatar: string | null;
  };
}
