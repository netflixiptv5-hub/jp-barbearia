FROM oven/bun:1.1 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
COPY packages/web/package.json packages/web/
RUN bun install --frozen-lockfile 2>/dev/null || bun install

# Copy source
COPY packages/web/ packages/web/
COPY tsconfig.json ./
COPY .env.template ./.env.template

# Build frontend
WORKDIR /app/packages/web
RUN bunx vite build

# Production
FROM oven/bun:1.1-slim
WORKDIR /app/packages/web

COPY --from=base /app/node_modules /app/node_modules
COPY --from=base /app/packages/web/node_modules /app/packages/web/node_modules
COPY --from=base /app/packages/web/dist /app/packages/web/dist
COPY --from=base /app/packages/web/src /app/packages/web/src
COPY --from=base /app/packages/web/server.ts /app/packages/web/server.ts
COPY --from=base /app/packages/web/package.json /app/packages/web/package.json
COPY --from=base /app/packages/web/tsconfig.json /app/packages/web/tsconfig.json

EXPOSE 3000
ENV PORT=3000

CMD ["bun", "run", "server.ts"]
