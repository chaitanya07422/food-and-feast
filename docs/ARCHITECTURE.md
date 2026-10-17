# Architecture (Milestone 1)

## Decisions locked for v1

- **Monorepo folder** under CreditSea workspace: `food-and-feast/` (no git yet)
- **Frontend:** Next.js App Router + Tailwind + Lucide
- **Backend:** NestJS REST under `/api/v1`
- **Database:** MongoDB via Mongoose (not PostgreSQL/Prisma)
- **Demo target:** Local Mac only for now; Oracle Cloud later
- **No online ordering** in v1

## Data collections

| Collection | Purpose |
|------------|---------|
| `categories` | Menu categories |
| `menu_items` | Dishes (draft/published, available flag, INR price) |
| `admin_users` | Owner accounts (password hashes only) |
| `restaurant_settings` | Name, contact, hours, social links |

Public reads must filter `status: published`. Drafts never leave admin APIs (enforced in Milestone 3–4).

## Route map

### Public

- `/` Home
- `/menu` Digital menu
- `/about` About
- `/gallery` Gallery
- `/contact` Contact

### Admin (shells now; auth in Milestone 4)

- `/admin/login`
- `/admin` Dashboard
- `/admin/menu`
- `/admin/categories`
- `/admin/settings`

## API (current)

- `GET /api/v1/health` — process + Mongo connectivity

Menu, auth, upload, and settings endpoints arrive in later milestones.
