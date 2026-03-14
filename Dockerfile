FROM node:18-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build


FROM node:18-slim

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3000

CMD ["npm", "start"]