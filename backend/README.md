# Food & Feast — API

NestJS REST API (`/api/v1`) with MongoDB and local or OCI Object Storage.

```bash
cp .env.example .env
npm install
npm run start:dev
```

- Health: `GET /api/v1/health`
- Storage: `STORAGE_DRIVER=local` or `oci` (see `.env.example`)
- Admin: `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD`

Root docs: [../README.md](../README.md) · Oracle deploy: [../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)
