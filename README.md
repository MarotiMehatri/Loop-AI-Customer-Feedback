# LOOP — AI Customer Feedback Intelligence Platform

LOOP collects customer feedback from every channel (support tickets, app stores, surveys, email, social, website), analyzes it with AI (sentiment, categories, themes, confidence), and turns it into actionable insights — dashboards, trend detection, reports, and an AI assistant that answers questions about your customers in plain language.

## Features

- **Omnichannel ingestion** — capture feedback from support, app stores, surveys, email, social, and web, manually or via CSV import.
- **AI classification** — automatic sentiment analysis, category tagging, theme detection, and confidence scoring powered by Google Gemini.
- **Analytics dashboard** — feedback volume, sentiment distribution, source/channel breakdown, top themes, AI classification accuracy, and exportable reports (CSV).
- **Theme trends** — track how themes like Pricing, Product Bug, and Feature Request evolve over time.
- **Trend detection** — detect anomalies, forecasts, and period-over-period comparisons.
- **Ask LOOP** — an AI assistant that answers questions about your feedback data using retrieval + citations and supports saved queries and conversation history.
- **Reports** — generate and export feedback summaries, sentiment analysis, theme analysis, and trend reports.
- **Workspaces & RBAC** — multi-workspace with Admin, Analyst, and Viewer roles.
- **Real-time** — Socket.IO for live analytics streaming and events.

## Monorepo structure

```
.
├── backend/    # Express + Prisma + PostgreSQL REST API (port 5000)
└── frontend/   # Next.js 15 App Router admin dashboard (port 3000)
```

## Tech stack

| Layer      | Tech                                                             |
| ---------- | ---------------------------------------------------------------- |
| Backend    | Node.js 20, Express 5, TypeScript 5, Prisma ORM, PostgreSQL 16   |
| Frontend   | Next.js 15 (App Router), React 19, TypeScript, Recharts, TanStack Query |
| AI         | Google Gemini (via `@google/genai`)                              |
| Real-time  | Socket.IO                                                        |
| Validation | Zod                                                              |
| Auth       | JWT + bcrypt, role-based access control                          |

## Getting started

### 1. Prerequisites

- Node.js >= 20
- PostgreSQL >= 14 (or use Docker Compose below)
- npm

### 2. Backend

```bash
cd backend

npm install
cp .env.example .env      # then edit with your DB URL, JWT secret, Gemini key

npm run prisma:generate   # generate Prisma client
npm run prisma:migrate    # run migrations
npm run seed              # optional: seed demo workspace + users (admin@loop.com / Loop@123)
npm run seed:demo         # optional: seed 34 demo feedback records + themes
npm run dev               # http://localhost:5000
```

### 3. Frontend

```bash
cd frontend

npm install
cp .env.example .env      # defaults point to http://localhost:5000/api/v1
npm run dev               # http://localhost:3000
```

### 4. Docker (whole stack)

```bash
cd backend
docker compose up -d      # starts PostgreSQL + backend
cd ../frontend            # start frontend separately, or add it to compose
npm run dev
```

## Environment variables

**Backend** (`backend/.env`) — see `backend/.env.example`:

| Variable           | Required | Default                                  | Description                      |
| ------------------ | -------- | ---------------------------------------- | -------------------------------- |
| `DATABASE_URL`     | yes      | `postgresql://username:password@localhost:5432/loop_db` | PostgreSQL connection string |
| `JWT_SECRET`       | yes      | —                                        | Secret for signing JWTs          |
| `GEMINI_API_KEY`   | yes      | —                                        | Google Gemini API key            |
| `NODE_ENV`         | no       | `development`                            | Environment mode                 |
| `PORT`             | no       | `5000`                                   | Server port                      |
| `JWT_EXPIRES_IN`   | no       | `7d`                                     | JWT lifetime                     |
| `FRONTEND_URL`     | no       | `http://localhost:3000`                  | Frontend origin for CORS         |

**Frontend** (`frontend/.env`):

| Variable             | Required | Default                          | Description                |
| -------------------- | -------- | -------------------------------- | -------------------------- |
| `NEXT_PUBLIC_API_URL`| no       | `http://localhost:5000/api/v1`   | Backend API base URL       |

## API overview

Base URL: `http://localhost:5000/api/v1`. All endpoints (except `/health` and auth) require a `Bearer` JWT.

| Area                | Base path                       | Highlights                                                        |
| ------------------- | ------------------------------- | ----------------------------------------------------------------- |
| Health              | `GET /health`                   | Liveness probe                                                    |
| Auth                | `/auth`                         | login, signup, refresh, verify                                    |
| Dashboard           | `/dashboard`                    | workspace stats                                                   |
| Feedback            | `/feedback`                     | CRUD + import                                                     |
| Feedback inbox      | `/feedback-inbox`               | list/summary with sentiment & status filters                      |
| Analytics           | `/analytics`                    | dashboard, overview, trend, sentiment, sources, themes, hourly, export, live-url |
| AI classification   | `/ai-classification`            | classify, classify-batch, classify-by-id, list                    |
| Trends              | `/trends`                       | trends, comparison, detect, anomalies, forecast, insights         |
| Ask LOOP            | `/ask-loop`                     | ask, suggestions, conversations, saved queries, message feedback  |
| Reports             | `/reports`                      | generate & manage reports                                         |
| Workspaces          | `/workspace`                    | workspace management & switching                                  |
| Members             | `/members`                      | team management                                                   |
| Notifications       | `/notifications`                | in-app notifications                                              |
| Activity            | `/activity`                     | audit/activity log                                                |
| Themes              | `/theme`                        | theme management                                                  |
| Data sources        | `/data-sources`                 | connected sources                                                 |
| Exports             | `/exports`                      | export jobs                                                       |

See `backend/README.md` for the full setup and deployment details.

## Useful scripts

| Command                 | Where       | Purpose                            |
| ----------------------- | ----------- | ---------------------------------- |
| `npm run dev`           | both        | Start dev servers                  |
| `npm run build`         | both        | Production build (tsc / next build)|
| `npm run type-check`    | both        | TypeScript type checking           |
| `npm run lint`          | both        | ESLint                             |
| `npm run prisma:studio` | backend     | Browse the database in the browser |
| `npm run seed`          | backend     | Seed demo workspace + users        |
| `npm run seed:demo`     | backend     | Seed 34 demo feedback records      |

## Deployment

See [`backend/README.md`](backend/README.md#deployment) for Docker and production setup, or [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the step-by-step deploy guide.

## Documentation

- [`docs/VoC-Report.md`](docs/VoC-Report.md) — Voice of the Customer report generated from the demo dataset
- [`docs/DEMO-VIDEO-SCRIPT.md`](docs/DEMO-VIDEO-SCRIPT.md) — demo video script and storyboard
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — step-by-step production deployment guide

## License

Private / proprietary.
