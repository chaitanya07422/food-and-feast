# Local setup

## Prerequisites

- Node.js 20+
- npm 10+
- MongoDB on `27017` (Homebrew `mongodb-community` or Atlas)

```bash
brew services start mongodb-community
```

## Backend

```bash
cd food-and-feast/backend
cp .env.example .env
# Edit ADMIN_BOOTSTRAP_EMAIL / ADMIN_BOOTSTRAP_PASSWORD / SESSION_SECRET
npm install
npm run start:dev
```

- API: `http://localhost:4000/api/v1`
- Health: `GET http://localhost:4000/api/v1/health`

For local file uploads keep `STORAGE_DRIVER=local`. For OCI (same keys as CreditSea LMS), set `STORAGE_DRIVER=oci` and the `OCI_*` vars in `.env.example`.

### Seed menu (optional)

```bash
npm run seed                 # categories + dishes from menu PDF (no photos)
npm run seed:gallery         # real photos from ../assets/restaurant/
npm run seed:clear-mock-images  # if an old DB still has mock image URLs
```

## Frontend

```bash
cd food-and-feast/frontend
cp .env.example .env.local
npm install
npm run dev
```

- Site: `http://localhost:3000`
- Admin: `http://localhost:3000/admin/login` (credentials = backend `ADMIN_BOOTSTRAP_*`)

## Scripts

| App | Command | Purpose |
|-----|---------|---------|
| backend | `npm run start:dev` | Watch mode API |
| backend | `npm run typecheck` / `build` | Typecheck / production build |
| frontend | `npm run dev` | Next.js dev |
| frontend | `npm run typecheck` / `build` | Typecheck / production build |

## Production

See [DEPLOYMENT.md](DEPLOYMENT.md) for Oracle Cloud (Nginx HTTPS, `TRUST_PROXY`, OCI Object Storage, PM2).

Never commit `.env` or `.env.local`.
