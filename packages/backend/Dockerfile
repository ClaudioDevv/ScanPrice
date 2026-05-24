# STAGE 1: DEPENDENCIA BASE
FROM node:24-alpine AS base

# Configuramos variables de entorno para pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

# STAGE 2: BUILD
FROM base AS builder

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/backend/package.json ./packages/backend/

RUN pnpm install --frozen-lockfile

COPY packages/backend ./packages/backend

RUN pnpm --filter scanprice-backend run build

# STAGE 3: PROD DEPENDENCIES (Aislamiento/Podado)
FROM base AS prod-deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/backend/package.json ./packages/backend/

RUN pnpm --filter=scanprice-backend --prod deploy --legacy /app/pruned

# STAGE 4: PRODUCCIÓN
FROM node:24-alpine AS production

RUN apk add --no-cache dumb-init

WORKDIR /app

COPY --from=prod-deps /app/pruned/node_modules ./node_modules
COPY --from=prod-deps /app/pruned/package.json ./

COPY --from=builder /app/packages/backend/dist ./dist

RUN chown -R node:node /app
USER node

ENV NODE_ENV=production
EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
