import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetWsUser = createParamDecorator<{
  sub: number;
  email: string;
  iat: number;
  exp: number;
}>((data: unknown, ctx: ExecutionContext) => {
  const client = ctx.switchToWs().getClient().handshake;
  return client.user;
});
