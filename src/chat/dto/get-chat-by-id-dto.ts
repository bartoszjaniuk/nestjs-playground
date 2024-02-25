export class GetChatByIdDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  users: { userId: number }[];
}
