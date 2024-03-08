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
COPY --from=builder /app/dist ./dist


# RUN npm install --only-PRODUCTION

# RUN rm package*.json

EXPOSE 3000

CMD [ "npm", "run", "start:prod" ]

# CMD ["node", "dist/src/main"]







