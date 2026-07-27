# LOOP - AI Customer Feedback Backend

RESTful API backend for the LOOP customer feedback platform. Ingests, analyzes, and manages customer feedback using AI-powered sentiment analysis and categorization.

## Tech Stack

- **Runtime:** Node.js 20
- **Language:** TypeScript 5
- **Framework:** Express 5
- **Database:** PostgreSQL 16 with Prisma ORM
- **Real-time:** Socket.IO
- **AI:** Google Gemini & Anthropic Claude
- **Validation:** Zod
- **Auth:** JWT (jsonwebtoken) + bcrypt
- **File Uploads:** Multer

## Prerequisites

- Node.js >= 20
- PostgreSQL >= 14
- npm

## Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your database credentials and API keys

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed the database (optional)
npm run seed

# Start development server
npm run dev
```

## Available Scripts

| Script                | Description                         |
| --------------------- | ----------------------------------- |
| `npm run dev`         | Start dev server with hot-reload    |
| `npm run build`       | Compile TypeScript to JavaScript    |
| `npm start`           | Run compiled production build       |
| `npm run lint`        | Lint with ESLint                     |
| `npm run type-check`  | Type-check without emitting         |
| `npm run prisma:generate` | Generate Prisma client          |
| `npm run prisma:migrate`  | Run Prisma migrations           |
| `npm run prisma:studio`   | Open Prisma Studio             |
| `npm run prisma:format`   | Format Prisma schema            |
| `npm run prisma:validate` | Validate Prisma schema          |
| `npm run seed`        | Seed the database                   |

## API Overview

Base URL: `http://localhost:5000/api/v1`

| Method   | Endpoint             | Description              |
| -------- | -------------------- | ------------------------ |
| `GET`    | `/health`            | Health check             |
| `POST`   | `/api/v1/auth/*`     | Authentication endpoints |
| `GET`    | `/api/v1/feedback`   | List feedback entries    |
| `POST`   | `/api/v1/feedback`   | Submit feedback          |
| `GET`    | `/api/v1/feedback/:id` | Get feedback by ID     |
| `PATCH`  | `/api/v1/feedback/:id` | Update feedback        |
| `DELETE` | `/api/v1/feedback/:id` | Delete feedback        |

> Full API documentation available in `docs/`.

## Folder Structure

```
backend/
├── prisma/
│   ├── migrations/       # Database migration files
│   ├── seed-data/        # Seed data fixtures
│   ├── seed.ts           # Seed script
│   └── schema.prisma     # Prisma schema
├── src/
│   ├── ai/               # AI integration (Gemini, Claude)
│   ├── app/              # App bootstrap
│   ├── config/           # Environment & Prisma config
│   ├── constants/        # Shared constants
│   ├── controllers/      # Route handlers
│   ├── events/           # Socket.IO event handlers
│   ├── generated/        # Prisma generated client
│   ├── jobs/             # Background jobs
│   ├── lib/              # Shared libraries
│   ├── middleware/        # Express middleware
│   ├── modules/          # Feature modules
│   ├── permissions/      # RBAC permissions
│   ├── repositories/     # Data access layer
│   ├── routes/           # Route definitions
│   ├── services/         # Business logic
│   ├── types/            # Shared TypeScript types
│   ├── utils/            # Utility functions
│   ├── validators/       # Zod validation schemas
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
├── tests/
│   ├── integration/      # Integration tests
│   ├── unit/             # Unit tests
│   └── setup.ts          # Test setup
├── uploads/              # Uploaded files
├── docs/                 # API documentation
└── dist/                 # Compiled output
```

## Environment Variables

| Variable         | Description                          | Default                              |
| ---------------- | ------------------------------------ | ------------------------------------ |
| `NODE_ENV`       | Environment mode                     | `development`                        |
| `PORT`           | Server port                          | `5000`                               |
| `DATABASE_URL`   | PostgreSQL connection string         | `postgresql://username:password@localhost:5432/loop_db?schema=public` |
| `GEMINI_API_KEY` | Google Gemini API key                | —                                    |
| `JWT_SECRET`     | Secret for signing JWTs              | —                                    |
| `JWT_EXPIRES_IN` | JWT expiration duration              | `7d`                                 |
| `FRONTEND_URL`   | Frontend URL for CORS                | `http://localhost:3000`              |
| `POSTGRES_USER`  | Postgres user (Docker Compose)       | `username`                           |
| `POSTGRES_PASSWORD` | Postgres password (Docker Compose) | `password`                           |
| `POSTGRES_DB`    | Postgres database name (Docker Compose) | `loop_db`                         |

## Deployment

### Docker

```bash
# Build and start all services
docker compose up -d

# View logs
docker compose logs -f backend

# Stop services
docker compose down
```

### Production Checklist

1. Set `NODE_ENV=production` in `.env`
2. Use strong, unique values for `JWT_SECRET` and database credentials
3. Run `npm run prisma:migrate` before starting the server
4. Serve behind a reverse proxy (nginx/Caddy) with TLS
5. Set `FRONTEND_URL` to your production frontend domain
