# Architecture

## Decisions (v1)

- Monorepo: `food-and-feast/`
- Frontend: Next.js App Router + Tailwind
- Backend: NestJS REST under `/api/v1`
- Database: MongoDB via Mongoose
- Storage: `STORAGE_DRIVER=local` or `oci` (OCI Object Storage, streamed via Nest `/uploads`)
- Deploy: Oracle Cloud Ubuntu + Nginx TLS + PM2
- No online ordering in v1

## Collections

| Collection | Purpose |
|------------|---------|
| `categories` | Menu categories |
| `menu_items` | Dishes (draft/published, available, INR) |
| `admin_users` | Owner accounts (password hashes); bootstrapped from env |
| `restaurant_settings` | Name, contact, hours, social |
| `gallery_images` | Restaurant photography |
| `hero_slides` | Homepage slideshow |

Public reads filter `status: published` / `isPublished` / `isActive`.

## Routes

**Public:** `/` `/menu` `/about` `/gallery` `/contact`

**Admin:** `/admin/login` `/admin` `/admin/menu` `/admin/categories` `/admin/gallery` `/admin/hero` `/admin/settings`

## Request path (production)

```text
Internet → Nginx :443
            ├─ /api/      → Nest :4000
            ├─ /uploads/  → Nest :4000  (local disk or OCI)
            └─ /          → Next :3000
```
