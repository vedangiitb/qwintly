FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
# Ensure optional native deps (like @tailwindcss/oxide) are installed in CI
ENV NPM_CONFIG_OPTIONAL=true
RUN npm ci --include=optional

COPY . .

RUN npm run build


FROM node:18-slim

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3000

CMD ["npm", "start"]
