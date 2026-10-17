# Local Mac setup

## Prerequisites

- Node.js 20+ (Node 25 works for local demo)
- npm 10+
- MongoDB running locally (`mongod` available via Homebrew)

### Start MongoDB

```bash
brew services start mongodb-community
# or: mongod --config /opt/homebrew/etc/mongod.conf
```

Confirm the API health check after starting the backend (`mongodb: "connected"`), or use Compass / `mongosh` if installed:

```bash
# optional
mongosh --eval 'db.runCommand({ ping: 1 })'
```

If port `27017` is already in use, another MongoDB instance is likely running — you can reuse it with `MONGODB_URI=mongodb://127.0.0.1:27017/food-and-feast`.

## Backend API

```bash
cd food-and-feast/backend
cp .env.example .env   # already present for demo if you keep local .env
npm install
npm run start:dev
```

- Base URL: `http://localhost:4000/api/v1`
- Health: `GET http://localhost:4000/api/v1/health`

Environment variables are documented in `backend/.env.example`.

## Frontend

```bash
cd food-and-feast/frontend
cp .env.example .env.local
npm install
npm run dev
```

- Site: `http://localhost:3000`
- Admin shell: `http://localhost:3000/admin/login`

## Useful scripts

| App | Command | Purpose |
|-----|---------|---------|
| backend | `npm run start:dev` | Watch mode API |
| backend | `npm run typecheck` | TypeScript check |
| backend | `npm run build` | Production build |
| frontend | `npm run dev` | Next.js dev server |
| frontend | `npm run typecheck` | TypeScript check |
| frontend | `npm run build` | Production build |

## Oracle Cloud (later)

Demo stays on this Mac for now. When you are ready to host on Oracle Cloud:

- Run MongoDB on OCI (Compute + mongod, or Atlas reachable from OCI)
- Run NestJS on an OCI Compute instance (PM2 or systemd) behind HTTPS
- Serve Next.js on the same instance or a separate app tier
- Point DNS / firewall rules accordingly

Deployment runbooks will be added in Milestone 6.

## Git

Do not initialize git until you ask. Keep secrets out of any future commit (`.env`, `.env.local`).
