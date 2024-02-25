export class GetFilteredUsersDto {
  id: number;
  avatar: string | null;
  email: string;
  isFriend: boolean;
}

export type StringField = string | { contains: string };
export type NumericField = number | { not: number };

export type WhereClause = {
  email?: StringField;
  username?: StringField;
  id: NumericField;
};
