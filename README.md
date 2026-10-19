# Food and Feast

Premium restaurant website and menu management portal for **Food and Feast Multicuisine Restaurant**.

Production target: **Oracle Cloud** (Nginx HTTPS, PM2, OCI Object Storage). See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Stack

| Layer | Choice |
|-------|--------|
| Public site + admin UI | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| API | NestJS, TypeScript |
| Database | MongoDB (Mongoose) |
| Images | Local disk (`STORAGE_DRIVER=local`) or **OCI Object Storage** (`oci`) |
| Auth | JWT HttpOnly cookie; admin from `ADMIN_BOOTSTRAP_*` env |

## Folder layout

```
food-and-feast/
├── frontend/     # Next.js — http://localhost:3000
├── backend/      # NestJS API — http://localhost:4000/api/v1
├── assets/       # Optional restaurant photos for gallery import
└── docs/         # Setup + Oracle deployment
```

## Quick start (local)

1. Start MongoDB: `brew services start mongodb-community`
2. API: `cd backend && cp .env.example .env && npm install && npm run start:dev`
3. Web: `cd frontend && cp .env.example .env.local && npm install && npm run dev`
4. Open http://localhost:3000 and http://localhost:4000/api/v1/health
5. Optional menu seed (PDF data, no photos): `cd backend && npm run seed`

Full steps: [docs/SETUP.md](docs/SETUP.md). Oracle: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Useful scripts

| Command | Purpose |
|---------|---------|
| `backend`: `npm run seed` | Categories + dishes from owner menu PDF (no images) |
| `backend`: `npm run seed:gallery` | Import real photos from `assets/restaurant/` |
| `backend`: `npm run seed:clear-mock-images` | Strip leftover mock image URLs from Mongo |

## Out of scope (v1)

Online ordering, cart, payments, reservations, customer accounts.
