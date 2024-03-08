# STAGE I: BUILD
FROM node:latest AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npm run build

# STAGE II: PRODUCTION

FROM node:latest

WORKDIR /app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}


COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./


# RUN npm install --only-PRODUCTION

# RUN rm package*.json

EXPOSE 3000

CMD [ "npm", "run", "start:prod" ]

# CMD ["node", "dist/src/main"]







