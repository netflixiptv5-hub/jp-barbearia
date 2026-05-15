FROM oven/bun:1.1 AS build
WORKDIR /app

# Copy entire monorepo
COPY . .

# Install all deps (monorepo workspace)
RUN bun install

# Build frontend
WORKDIR /app/packages/web
RUN bunx vite build

# Production stage
FROM oven/bun:1.1-slim
WORKDIR /app

# Copy everything needed (node_modules at root level for workspace)
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/web/dist ./packages/web/dist
COPY --from=build /app/packages/web/src ./packages/web/src
COPY --from=build /app/packages/web/server.ts ./packages/web/server.ts
COPY --from=build /app/packages/web/package.json ./packages/web/package.json
COPY --from=build /app/packages/web/tsconfig.json ./packages/web/tsconfig.json
COPY --from=build /app/packages/web/tsconfig.app.json ./packages/web/tsconfig.app.json
COPY --from=build /app/packages/web/tsconfig.node.json ./packages/web/tsconfig.node.json
COPY --from=build /app/packages/web/public ./packages/web/public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/tsconfig.json ./tsconfig.json

WORKDIR /app/packages/web

EXPOSE 3000
ENV PORT=3000

CMD ["bun", "run", "server.ts"]
