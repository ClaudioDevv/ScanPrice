# scanPrice — Project Context for Claude

## Overview

University project. A web app that scans or manually inputs a barcode to look up a food product and compare its price across supermarkets. If the product doesn’t exist, the user can add it via a modal.

## Stack

- **Frontend:** React + Vite (TypeScript)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (AWS RDS)
- **Infra:** AWS S3 + CloudFront (frontend), EC2 (backend), RDS (database)

## Key Commands

```bash
# Frontend
cd client
pnpm run dev # Dev server
pnpm run build # Production build
pnpm run lint # ESLint
pnpm run preview # Preview production build

# Backend
cd server
pnpm run dev # Nodemon dev server
pnpm run start # Production
pnpm run lint # ESLint
```

## Project Structure

```
ScanPrice/
│
├── .github/
│   └── workflows/
│       └── deploy-frontend.yml      # Build + sync a S3 + invalidar CloudFront
│       
│
├── packages/
│   ├── frontend/                    # React + Vite
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── assets/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   ├── services/            # Llamadas a la API
│   │   │   ├── types/               # Tipos propios del frontend
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   ├── backend/                     # Node + Express
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   ├── models/              # Modelos de BD (pg)
│   │   │   ├── services/
│   │   │   ├── types/               # Tipos propios del backend
│   │   │   └── index.ts
│   │   ├── Dockerfile               # Para EC2
│   │   └── package.json
│   │
│   └── scraper/                     # Servicio independiente
│       ├── src/
│       │   ├── scrapers/            # Un fichero por fuente
│       │   ├── db/                  # Conexión y queries a PostgreSQL
│       │   ├── utils/
│       │   └── index.ts             # Entry point (puede usarse con cron local)
│       ├── Dockerfile               # Para EC2 / EventBridge
│       └── package.json
│
├── docker/
│   ├── docker-compose.dev.yml       # Solo PostgreSQL (desarrollo)
│   └── docker-compose.prod.yml      # Backend + Scraper (EC2)
│
│
├── .env.example                     # Variables sin valores reales
├── .gitignore
├── pnpm-workspace.yaml
├── package.json                     # Scripts raíz del monorepo
└── CLAUDE.md
```

## Database Schema

Single table — no history needed.

```sql
CREATE TABLE normalized_names (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  ean VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  brand VARCHAR(100),
  supermarket VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  normalized_name_id INT REFERENCES normalized_names(id),
  image_url VARCHAR(500),
  source_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(ean, supermarket)
);

CREATE TABLE product_suggestions (
  id SERIAL PRIMARY KEY,
  ean VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  brand VARCHAR(100),
  supermarket VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

```

## Prompt to normalize name
Eres un normalizador de productos de supermercado.
Para cada producto, devuelve SOLO la categoría genérica en 2-4 palabras,
sin marca, sin gramaje, sin adjetivos de calidad.

Devuelve un JSON array en el mismo orden que la entrada.

Productos:
1. Pechuga de pollo Hacendado ultracongelada 500g
2. Leche entera Asturiana 1L
3. Detergente Ariel Pods 30 unidades
4. Pechuga de Pollo Dia Corral 450g
5. Leche semi President 6x1L

Respuesta esperada:
["pechuga de pollo", "leche entera", "detergente", "pechuga de pollo", "leche semidesnatada"]

## Prompt to new Products
Estos son los nombres normalizados que ya existen en el sistema, 
DEBES reutilizarlos si el producto encaja:
["pechuga de pollo", "leche entera", "leche semidesnatada", "detergente en cápsulas"]

Ahora normaliza estos productos nuevos. Si encajan con uno existente usa 
exactamente ese string. Si no encaja ninguno, crea uno nuevo con el mismo estilo.
Devuelve JSON array en el mismo orden.

Productos nuevos:
1. Filete de pechuga de pollo Mercadona 600g
2. Agua con gas Fonter 1.5L

## Core Features

1. **Barcode lookup** — search by barcode (camera scanner or manual input)
1. **Compare analogues** — show same/similar products from other supermarkets
1. **Add product modal** — if barcode not found, user fills a form to add it
1. **Price comparison** — sort/filter by price across supermarkets

## Code Standards

- Use TypeScript on both frontend and backend
- Functional components only — no class components
- Custom hooks for any logic that touches state or side effects
- Controllers stay thin — business logic goes in services
- Use environment variables for all secrets and config (never hardcode)
- Follow REST conventions: `GET /products/:barcode`, `POST /products`, etc.
- Handle errors explicitly — no silent catches
- Validate request inputs on the backend (zod or express-validator)

## AWS Deployment Notes

- Frontend: built with `npm run build`, deployed to S3, served via CloudFront
- Backend: runs on EC2, use PM2 for process management
- DB: RDS PostgreSQL, access only from EC2 security group (never public)
- Use `.env` files locally; use EC2 environment variables or AWS Parameter Store in production
- Never commit `.env` files or AWS credentials

## What Claude Should NOT Do Without Asking

- Do NOT run `DROP TABLE` or any destructive SQL
- Do NOT delete files
- Do NOT make git commits
- Do NOT change the DB schema without confirming first
- Do NOT modify `.env` files or anything with credentials

## Docs to Reference On-Demand

- `@docs/architecture.md` — detailed system design
- `@docs/plan.md` — implementation checklist with [ ] tasks
- `@docs/api.md` — API endpoint reference