# Stripe Analytics Platform

A full-stack SaaS analytics platform for Stripe with background job processing using BullMQ and Redis.

## 🏗️ Architecture

- **Web**: Next.js 15 frontend with Elysia API
- **Worker**: Background job processor with BullMQ
- **Queue**: Redis for job management
- **Database**: PostgreSQL with Drizzle ORM

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose

### Quick Start

```bash
# Clone and setup
git clone <your-repo-url>
cd stripe-analytics

# Set up environment variables
cp app/.env.example app/.env
cp jobs/.env.example jobs/.env

# Start everything
docker-compose up
```

That's it! Your app will be running at `http://localhost:3000`

### Common Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart
```

### First Time Setup

Run database migrations:

```bash
docker exec -it stripe-analytics-app sh
npx drizzle-kit push
exit
```

## 📁 Project Structure

```
├── web/                # Next.js application
│   ├── app/           # App router pages & API routes
│   ├── components/    # React components
│   ├── lib/           # Utilities, hooks & API clients
│   └── db/            # Database schema (Drizzle)
└── worker/            # Background worker process
    └── server/
        ├── job/       # Job processing logic
        └── db/        # Database schema
```

## 🔧 Environment Variables

### Using Docker (Development)
When using Docker Compose, `DATABASE_URL` and `REDIS_URL` are automatically configured. You only need to set:

**app/.env**
```env
# Database & Redis (auto-configured in docker-compose.yml)
# DATABASE_URL=postgresql://postgres:postgres@postgres:5432/database
# REDIS_URL=redis://redis:6379

# Required - Your configuration
BETTER_AUTH_SECRET=your-secret-here
CLIENT_URL=http://localhost:3000
RESEND_KEY=your-resend-api-key
STRIPE_SECRET_ENCRYPTION_KEY=your-32-byte-hex-key
```

**jobs/.env**
```env
# Database & Redis (auto-configured in docker-compose.yml)
# DATABASE_URL=postgresql://postgres:postgres@postgres:5432/database
# REDIS_URL=redis://redis:6379

# Required - Your configuration
WORKER_CONCURRENCY=3
STRIPE_SECRET_ENCRYPTION_KEY=your-32-byte-hex-key
```

## 📊 Features

- ✅ Background job processing with BullMQ
- ✅ Real-time job status polling
- ✅ Stripe API data scraping & analytics
- ✅ MRR/ARR calculations
- ✅ Revenue trend visualization
- ✅ Fault-tolerant architecture
- ✅ User authentication with Better Auth
- ✅ Encrypted API key storage

## 🚢 Deployment

### Recommended Stack
- **Web**: Vercel (optimized for Next.js)
- **Worker**: Railway or Render
- **Database**: Neon or Supabase (PostgreSQL)
- **Redis**: Upstash or Railway

### Deploy Web to Vercel
```bash
cd web
vercel
```

### Deploy Worker to Railway
```bash
cd worker
# Connect to Railway and deploy
```

## 🔐 Security

- API keys are encrypted using AES-256-GCM before storage in Redis
- Keys expire after 15 minutes by default
- Session-based authentication with Better Auth
- CORS protection enabled

## 📈 Scalability

The architecture supports horizontal scaling:
- Run multiple worker instances (they share the same Redis queue)
- Increase `WORKER_CONCURRENCY` for more parallel processing
- Database connection pooling built-in
- React Query caching reduces API load

## 🛠️ Tech Stack

**Frontend:**
- Next.js 15 with App Router
- React 19
- TanStack Query
- Tailwind CSS
- Radix UI + shadcn/ui

**Backend:**
- Elysia (API framework)
- BullMQ (job queue)
- Drizzle ORM
- Better Auth
- PostgreSQL
- Redis

**Infrastructure:**
- TypeScript
- Node.js/Bun
- Railway/Vercel

## 📝 License

MIT

