FROM node:20-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/build ./build
RUN npm install -g serve
EXPOSE 4173
CMD ["serve", "-s", "build", "-l", "4173"]
