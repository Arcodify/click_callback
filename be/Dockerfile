FROM node:20-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/* && npm install
COPY prisma ./prisma
RUN npx prisma generate

FROM deps AS build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY prisma ./prisma

EXPOSE 4000
CMD ["node", "dist/server.js"]
