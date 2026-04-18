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
scanPrice/
├── client/ # React + Vite frontend
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ ├── pages/ # Route-level components
│ │ ├── hooks/ # Custom React hooks
│ │ ├── services/ # API calls (axios/fetch)
│ │ └── types/ # TypeScript interfaces
├── server/ # Express backend
│ ├── src/
│ │ ├── routes/ # Express routers
│ │ ├── controllers/ # Route handlers
│ │ ├── services/ # Business logic
│ │ ├── db/ # DB connection + queries
│ │ └── middlewares/ # Auth, error handling, etc.
├── docs/ # Architecture, plans, notes
└── CLAUDE.md
```

## Database Schema

Single table — no history needed.

```sql
CREATE TABLE products (
id SERIAL PRIMARY KEY,
barcode VARCHAR(50) UNIQUE NOT NULL,
name VARCHAR(255) NOT NULL,
category VARCHAR(100),
brand VARCHAR(100),
supermarket VARCHAR(100) NOT NULL,
price DECIMAL(10, 2) NOT NULL,
unit VARCHAR(50), -- e.g. "500g", "1L"
image_url VARCHAR(500),
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);
```

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