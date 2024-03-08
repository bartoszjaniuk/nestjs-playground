# FROM node:18 AS builder

# # Create app directory
# WORKDIR /app

# # A wildcard is used to ensure both package.json AND package-lock.json are copied
# COPY package*.json ./
# COPY prisma ./prisma/

# # Install app dependencies
# RUN npm install

# COPY . .

# RUN npx prisma generate
# RUN npm run build

# FROM node:18

# COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/.env .env
# COPY --from=builder /app/package*.json ./

# EXPOSE 3000
# CMD [ "npm", "run", "start:prod" ]



# STAGE I: BUILD
FROM node:18-alpine AS build

WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY package*.json ./
# TODO: CHECK IF THIS IS CORRECT
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npm run build
# TODO: CHECK IF THIS IS CORRECT
RUN npx prisma generate
RUN npx prisma migrate deploy


# STAGE II: PRODUCTION

FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=build /usr/src/app ./dist

COPY package*.json ./

RUN npm install --only-PRODUCTION

RUN rm package*.json

EXPOSE 3000

CMD ["node", "dist/src/main.js"]







