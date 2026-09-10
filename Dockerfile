FROM oven/bun:1.2 AS base

WORKDIR /app
ENV NODE_ENV=production

FROM base AS deps

COPY bun.lock package.json bunfig.toml tsconfig.json ./
RUN bun install --frozen-lockfile --production

FROM base AS runner

COPY --from=deps /app/node_modules ./node_modules
COPY package.json bunfig.toml tsconfig.json ./
COPY src ./src

ENTRYPOINT ["bun", "run", "src/bootstrap.ts"]
