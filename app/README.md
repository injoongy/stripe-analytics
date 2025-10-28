# MRR Analysis Platform

A modern, scalable SaaS metrics analysis platform built with Next.js, Elysia, Redis, BullMQ, and Tanstack Query.

## Architecture Overview

### Tech Stack

#### Frontend
- **Framework**: Next.js 15.5.3 with App Router
- **UI Components**: Radix UI primitives with shadcn/ui
- **Styling**: Tailwind CSS v4
- **State Management**: Tanstack Query for server state
- **Forms**: React Hook Form
- **Charts**: Recharts for data visualization
- **Theme**: Next Themes for dark/light mode support

#### Backend
- **API Framework**: Elysia (Bun-powered web framework)
- **Authentication**: Better Auth with email verification
- **Database**: PostgreSQL with Drizzle ORM
- **Queue System**: BullMQ with Redis
- **Email Service**: Resend with React Email templates
- **Payment Integration**: Stripe API

#### Infrastructure
- **Worker Processes**: Separate TypeScript worker for background jobs
- **Caching**: Redis for queue management
- **File Storage**: AWS S3 (integrated)
- **Analytics**: Vercel Analytics
- **Runtime**: Node.js / Bun hybrid approach

## Project Structure

```
mrr-analysis/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   └── [[...slugs]]/    # Elysia API handler
│   ├── dashboard/           # Dashboard pages
│   │   └── [jobId]/        # Dynamic job details
│   ├── sign-in/            # Authentication pages
│   ├── sign-up/
│   └── layout.tsx          # Root layout with providers
│
├── components/              # React components
│   ├── ui/                 # UI components library
│   ├── charts/             # Chart components
│   ├── emails/             # Email templates
│   └── providers.tsx       # Context providers
│
├── lib/                    # Shared utilities
│   ├── auth.ts            # Auth configuration
│   ├── auth-client.ts     # Client-side auth
│   ├── auth-middleware.ts # API middleware
│   ├── api.ts             # API client setup
│   ├── utils.ts           # Utility functions
│   └── hook/              # Custom React hooks
│       └── useStripeData.ts
│
├── worker/                 # Background job processing
│   └── server/
│       ├── job/           # Job processing logic
│       │   ├── worker.ts  # Main worker process
│       │   ├── queue.ts   # Queue configuration
│       │   ├── metrics.ts # Stripe metrics extraction
│       │   ├── persist.ts # Data persistence
│       │   └── s3.ts      # S3 integration
│       └── db/            # Database layer
│           ├── schema.ts  # Drizzle schema
│           └── index.ts   # DB connection
│
├── middleware.ts          # Next.js middleware
├── drizzle.config.ts     # Drizzle ORM config
└── auth-schema.ts        # Auth database schema
```

## Core Features

### Authentication System
- Email/password authentication with Better Auth
- Email verification using Resend
- Session management with secure cookies
- Protected routes and API endpoints

### API Architecture
- **Elysia Framework**: Type-safe, fast API routes
- **Eden Client**: End-to-end type safety
- **Swagger Documentation**: Auto-generated API docs at `/api/docs`
- **CORS Configuration**: Secure cross-origin handling

### Queue System
- **BullMQ**: Robust job queue with Redis backend
- **Worker Pool**: Concurrent job processing (configurable)
- **Job Types**:
  - Stripe data scraping
  - Metrics calculation
  - Data persistence
- **Observability**: Job status tracking and monitoring

### Data Flow

1. **Client Request** → Next.js API Route → Elysia Handler
2. **Job Creation** → BullMQ Queue → Redis
3. **Worker Processing** → Background Worker → Stripe API
4. **Data Storage** → PostgreSQL via Drizzle ORM
5. **Real-time Updates** → Tanstack Query → UI Updates

## Database Schema

The application uses Drizzle ORM with PostgreSQL:

- **Users**: Authentication and profile data
- **Sessions**: User session management
- **Scraped Data**: Stored metrics and analysis results
- **Jobs**: Queue job metadata and status

## Environment Variables

```env
# Database
DATABASE_URL=

# Authentication
BETTER_AUTH_SECRET=
CLIENT_URL=

# Email
RESEND_KEY=

# Redis
REDIS_URL=

# Worker
WORKER_CONCURRENCY=

# External APIs
STRIPE_API_KEY=
# Secret Escrow
```

## Getting Started

### Prerequisites
- Node.js 20+ or Bun
- PostgreSQL database
- Redis server
- Resend account for emails

### Installation

```bash
# Install dependencies
npm install

# Setup database
npx drizzle-kit push

# Run development server
npm run dev

# Run worker process (separate terminal)
npm run worker
```

### Development Commands

```bash
npm run dev        # Start Next.js dev server with Turbopack
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run worker     # Start worker in dev mode
npm run worker:prod # Start worker in production mode
```

## API Endpoints

### Authentication
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - User login
- `POST /api/auth/sign-out` - User logout
- `GET /api/auth/verify-email` - Email verification

### Stripe Integration
- `POST /api/stripe` - Queue Stripe data extraction
- `GET /api/stripe/status/:jobId` - Check job status
- `GET /api/stripe/data` - Fetch user's scraped data
- `GET /api/stripe/data/:jobId` - Get specific job results

## Deployment

The application is designed for deployment on:
- **Frontend**: Vercel (optimized for Next.js)
- **Worker**: Any Node.js hosting (Railway, Render, etc.)
- **Database**: Neon, Supabase, or any PostgreSQL provider
- **Redis**: Upstash, Redis Cloud, or self-hosted

## Security Features

- CSRF protection via Better Auth
- Secure session cookies
- API rate limiting
- Input validation with Elysia schemas
- SQL injection prevention via Drizzle ORM
- XSS protection in React components

## Performance Optimizations

- Turbopack for faster builds
- Server-side rendering with Next.js
- Optimistic updates with Tanstack Query
- Background job processing
- Database connection pooling
- Redis caching for queue management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
