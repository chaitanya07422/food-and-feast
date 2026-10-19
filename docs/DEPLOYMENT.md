# Food & Feast — Oracle Cloud deployment

Mirrors the CreditSea LMS layout: **Nginx (HTTPS) → Next + Nest**, MongoDB Atlas (or local), **OCI Object Storage** for images.

## GitHub Actions (auto-deploy)

Workflow: [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)

On every push to `main` (and manual **Actions → Deploy to Oracle → Run workflow**):

1. Build Nest API + Next standalone on GitHub runners  
2. `rsync` to the Oracle VM  
3. `pm2 startOrReload` → `ff-api` (:4000) and `ff-web` (:3000)

### Required GitHub secrets (`Settings → Secrets and variables → Actions`)

| Secret | Example |
|--------|---------|
| `DEPLOY_HOST` | `129.159.226.127` |
| `DEPLOY_USER` | `ubuntu` |
| `DEPLOY_SSH_KEY` | Private key contents (same key as `oracle-jogi`) |
| `FF_PUBLIC_URL` | `https://your-domain.com` (no trailing slash) |

### One-time on the VM

```bash
# Node 20 + PM2 (if not already installed)
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.nvm/nvm.sh
nvm install 20
npm install -g pm2

mkdir -p ~/apps/food-and-feast-api/shared/uploads \
         ~/apps/food-and-feast-web/current

# Create production env (Actions will not overwrite this file)
nano ~/apps/food-and-feast-api/shared/.env
```

Point Nginx Proxy Manager (or nginx) at `:3000` / `:4000` as in the proxy section below.

Before first production seed, clear any leftover local mock image URLs:

```bash
cd backend && npm run seed:clear-mock-images
```

Then seed menu text only (`npm run seed`) and upload real photos via Admin (or `seed:gallery`).

## Target shape

| Piece | Value |
|-------|--------|
| Host | Oracle Cloud Ubuntu VM |
| Site | `https://<your-domain>` |
| API | `https://<your-domain>/api/v1` |
| Uploads | `https://<your-domain>/uploads/...` (Nest streams local or OCI) |
| Process | PM2: `ff-api` (:4000), `ff-web` (:3000) |
| Proxy | Nginx TLS |
| Files | `STORAGE_DRIVER=oci` (same OCI keys as LMS) |

```text
Internet → Nginx :443
            ├─ /api/      → Nest :4000
            ├─ /uploads/  → Nest :4000  (local disk or OCI Object Storage)
            └─ /          → Next :3000
```

## 1. Production backend `.env`

On the VM (`shared/.env`), set:

```env
NODE_ENV=production
PORT=4000
TRUST_PROXY=true
MONGODB_URI=<atlas-or-oci-mongo>
CORS_ORIGIN=https://<your-domain>
SESSION_SECRET=<long-random-string>

# Admin login lives in env (synced to Mongo on boot)
ADMIN_BOOTSTRAP_EMAIL=<owner-email>
ADMIN_BOOTSTRAP_PASSWORD=<strong-password>

PUBLIC_API_ORIGIN=https://<your-domain>

STORAGE_DRIVER=oci
UPLOAD_DIR=./uploads
MAX_UPLOAD_BYTES=5242880
OCI_NAMESPACE=<namespace>
OCI_BUCKET=<bucket>
OCI_REGION=<region>
OCI_CONFIG_FILE=/home/ubuntu/.oci/config
OCI_PROFILE=DEFAULT
OCI_KEY_PREFIX=food-and-feast
```

Copy OCI credentials the same way as LMS (`~/.oci/config` + `oci_api_key.pem` on the VM).

## 2. Production frontend env (build-time)

```env
NEXT_PUBLIC_API_URL=https://<your-domain>/api/v1
NEXT_PUBLIC_API_ORIGIN=https://<your-domain>
NEXT_PUBLIC_SITE_URL=https://<your-domain>
```

Rebuild Next after changing these (`npm run build`).

## 3. Nginx (HTTPS + reverse proxy)

```nginx
server {
    listen 80;
    server_name <your-domain> <VM_PUBLIC_IP>;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name <your-domain>;

    # ssl_certificate / ssl_certificate_key — Certbot

    client_max_body_size 6M;

    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

TLS: `sudo certbot --nginx -d <your-domain>`

Open OCI security list: **22, 80, 443** only (do not expose :3000 / :4000).

## 4. Why `TRUST_PROXY=true` matters

Admin cookies use `Secure` in production. Nginx terminates HTTPS and forwards `X-Forwarded-Proto: https`. With `TRUST_PROXY=true`, Nest trusts that header so:

- `req.secure` is true  
- `Secure` cookies are set correctly  
- Login works for real customers over HTTPS  

## 5. Image URL rewrite (local → production)

Existing Mongo rows may still say `http://localhost:4000/uploads/...`. After deploy, rewrite once:

```js
// run with mongosh against production DB
const from = 'http://localhost:4000';
const to = 'https://<your-domain>';
db.menu_items.updateMany(
  { imageUrl: { $regex: from } },
  [{ $set: { imageUrl: { $replaceAll: { input: '$imageUrl', find: from, replacement: to } } } }],
);
db.gallery_images.updateMany(
  { imageUrl: { $regex: from } },
  [{ $set: { imageUrl: { $replaceAll: { input: '$imageUrl', find: from, replacement: to } } } }],
);
db.hero_slides.updateMany(
  { imageUrl: { $regex: from } },
  [{ $set: { imageUrl: { $replaceAll: { input: '$imageUrl', find: from, replacement: to } } } }],
);
```

Also upload existing `backend/uploads/**` into the OCI bucket under `food-and-feast/` (or keep `STORAGE_DRIVER=local` and rsync the folder onto the VM until you migrate).

## 6. Smoke checklist

- [ ] `GET https://<domain>/api/v1/health`
- [ ] Public menu shows dish images (`/uploads/...`)
- [ ] Admin login with env email/password
- [ ] Cookie is `Secure` / `HttpOnly` over HTTPS
- [ ] Upload a dish photo (lands in OCI when `STORAGE_DRIVER=oci`)
- [ ] Gallery + hero still load
