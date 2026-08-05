# LOOP — Production Deployment Guide

Step-by-step guide to deploy the full LOOP stack (backend + frontend + PostgreSQL) to a production server.

---

## 1. Architecture

```
Internet
   │
   ▼
Reverse proxy (nginx/Caddy, TLS)        :443
   ├── / → frontend (Next.js)           :3000
   └── /api → backend (Express)         :5000
                                          │
                                   PostgreSQL 16  :5432
```

- Backend Docker image: `backend/Dockerfile` (multi-stage, Node 20 Alpine).
- `docker-compose.yml` (backend/): PostgreSQL + backend. Frontend runs separately.

---

## 2. Prerequisites

- Server with Docker + Docker Compose (`docker --version`, `docker compose version`)
- A domain (or IP) + TLS certificate (Let's Encrypt via nginx/Caddy)
- Google Gemini API key (`GEMINI_API_KEY`)

---

## 3. Clone & configure

```bash
git clone <your-repo> && cd Loop-AI-Customer-Feedback
cd backend

cp .env.example .env
nano .env
```

Minimum `.env` values for production:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://username:STRONG_PASSWORD@postgres:5432/loop_db?schema=public
GEMINI_API_KEY=your_gemini_key
JWT_SECRET=<generate: openssl rand -base64 48>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://yourdomain.com
```

> `DATABASE_URL` uses host `postgres` (the compose service name), not `localhost`.

Also set the same `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` in `.env`
(compose defaults: `username` / `password` / `loop_db`).

---

## 4. Build & start the backend

```bash
cd backend
docker compose up -d --build
docker compose ps
```

On container start the backend runs `npx prisma migrate deploy` automatically
(see `CMD` in `Dockerfile`) — a fresh database gets all tables without manual steps.

---

## 5. Seed (once, for demo data)

```bash
docker compose exec backend npm run seed        # workspace + users (admin@loop.com / Loop@123)
docker compose exec backend npm run seed:demo   # 34 demo feedback records + themes
```

Skip both for a clean production database.

---

## 6. Frontend (Next.js)

The frontend is not part of compose; run it on the same server:

```bash
cd frontend
cp .env.example .env
# NEXT_PUBLIC_API_URL=https://yourdomain.com/api
npm ci
npm run build
npm start   # listens on :3000 (set PORT if needed)
```

Recommend running it as a systemd service or PM2:

```ini
# /etc/systemd/system/loop-frontend.service
[Unit]
Description=LOOP frontend
After=network.target

[Service]
WorkingDirectory=/opt/Loop-AI-Customer-Feedback/frontend
ExecStart=/usr/bin/npm start
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now loop-frontend
```

---

## 7. Reverse proxy with TLS

Example nginx site (`/etc/nginx/sites-available/loop`):

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    client_max_body_size 25m;

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Obtain certificates:

```bash
sudo certbot --nginx -d yourdomain.com
sudo nginx -t && sudo systemctl reload nginx
```

---

## 8. Verification

```bash
curl https://yourdomain.com/api/health          # {"success":true,...}
curl https://yourdomain.com                     # frontend HTML
```

Sign in with `admin@loop.com` / `Loop@123` (demo seed) and check:
- Dashboard + Analytics load real data
- Ask LOOP answers a question (requires `GEMINI_API_KEY`)
- Reports generate + preview + export

---

## 9. Operations

| Task             | Command                                                        |
| ---------------- | -------------------------------------------------------------- |
| Backend logs     | `docker compose logs -f backend`                               |
| Restart backend  | `docker compose restart backend`                               |
| Rebuild backend  | `docker compose up -d --build backend`                         |
| Apply migrations | done automatically on start; manual: `docker compose exec backend npx prisma migrate deploy` |
| DB backup        | `docker compose exec postgres pg_dump -U username loop_db > backup.sql` |
| DB restore       | `docker compose exec -T postgres psql -U username loop_db < backup.sql` |

---

## 10. Security checklist

- [ ] `JWT_SECRET` is a long random value, not the example
- [ ] Database password is strong and different from defaults
- [ ] `.env` is never committed; `.dockerignore` excludes it from images
- [ ] Only expose ports 80/443 publicly; keep 3000/5000/5432 internal (or firewalled)
- [ ] `GEMINI_API_KEY` stays server-side only
- [ ] TLS enforced (HTTP → HTTPS redirect)
- [ ] Logs reviewed for auth failures / abuse
