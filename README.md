# Food and Feast

Premium restaurant website and menu management portal for **Food and Feast Multicuisine Restaurant**.

Local Mac demo first. Oracle Cloud deployment comes later. Git will be added when you are ready — this folder is intentionally not a git repository yet.

## Stack

| Layer | Choice |
|-------|--------|
| Public site + admin UI | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| API | NestJS, TypeScript |
| Database | **MongoDB** (Mongoose) |
| Images (later) | Local disk for demo → Cloudinary or OCI Object Storage |

## Folder layout

```
food-and-feast/
├── frontend/     # Next.js — http://localhost:3000
├── backend/      # NestJS API — http://localhost:4000/api/v1
└── docs/         # Setup and architecture notes
```

## Quick start (local Mac)

1. Start MongoDB: `brew services start mongodb-community` (or run `mongod`).
2. API: `cd backend && cp .env.example .env && npm run start:dev`
3. Web: `cd frontend && cp .env.example .env.local && npm run dev`
4. Open http://localhost:3000 and http://localhost:4000/api/v1/health

Full steps: [docs/SETUP.md](docs/SETUP.md).

## Milestones

| # | Status | Focus |
|---|--------|--------|
| 1 Foundation | Done | Scaffold, design tokens, routes, Mongo schemas, health |
| 2 Public experience | Partial | Pages live; gallery photos still pending |
| 3 Digital menu | **Done** | 227 dishes / 17 categories from PDF |
| 4 Administration | **Done (local)** | Auth, CRUD, settings; image upload next |
| 5 QA | Pending | Tests, a11y, security |
| 6 Deploy | Pending | Oracle Cloud + handover |

## Explicitly out of scope (v1)

Online ordering, cart, payments, reservations, customer accounts.
