FROM node:18 AS builder

WORKDIR /app

# Build-time public envs for Next.js client bundle
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_GA_ID

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID

COPY package*.json ./
# Ensure optional native deps (like @tailwindcss/oxide) are installed in CI
ENV NPM_CONFIG_OPTIONAL=true
RUN npm ci --include=optional \
  && npm install --no-save @tailwindcss/oxide-linux-x64-gnu

COPY . .

RUN npm run build


FROM node:18-slim

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3000

CMD ["npm", "start"]
