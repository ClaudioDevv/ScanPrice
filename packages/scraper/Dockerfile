# STAGE 1: CONFIGURACIÓN BASE
FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app


# STAGE 2: BUILDER (Compilación in-container)
FROM base AS builder

# Copiamos archivos de configuración del monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/scraper/package.json ./packages/scraper/

# Instalamos dependencias de desarrollo y producción para poder compilar
RUN pnpm install --frozen-lockfile

# Copiamos el código fuente del scraper
COPY packages/scraper ./packages/scraper

# Compilamos TypeScript a JavaScript
RUN pnpm --filter scraper run build


# STAGE 3: PROD DEPENDENCIES (Aislamiento de producción)
FROM base AS prod-deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/scraper/package.json ./packages/scraper/

RUN pnpm --filter=scraper --prod deploy --legacy /app/pruned

# STAGE 4: RUNTIME DE PRODUCCIÓN
FROM node:24-alpine AS production

RUN apk add --no-cache dumb-init

WORKDIR /app

# Copiamos las dependencias de producción podadas
COPY --from=prod-deps /app/pruned/node_modules ./node_modules
COPY --from=prod-deps /app/pruned/package.json ./

# Copiamos el código ya compilado desde la etapa builder
COPY --from=builder /app/packages/scraper/dist ./dist

# Copiamos la carpeta de datos estáticos/plantillas del scraper
COPY packages/scraper/data ./data

# Seguridad: Usamos el usuario 'node' nativo de Alpine
RUN chown -R node:node /app
USER node

ENV NODE_ENV=production

ENTRYPOINT ["dumb-init", "--"]

# Ejecutamos el archivo principal según tu package.json (dist/index.js)
CMD ["node", "dist/index.js"]