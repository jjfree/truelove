# Asia Serious Dating MVP

High-trust, serious relationship and marriage-focused MVP for Taiwan, Singapore, and Malaysia first, with structure ready for Japan, the Philippines, and Vietnam.

This is not an infinite swipe app. The first version focuses on authentic profiles, relationship intent, limited daily recommendations, mutual-like conversations, and safety signals from day one.

## Stack

- Monorepo: npm workspaces
- Mobile: Expo React Native + TypeScript
- API: NestJS + TypeScript
- DB: PostgreSQL + Prisma, with PostGIS-ready fields
- Redis: interface-ready, local MVP can use in-memory fallback
- Shared package: DTOs, enums, safety constants

## From a New Computer

Goal: clone and run local development in about 15 minutes.

1. Install Node `22.14.x` and npm `10.x`.
2. Clone the repo.
3. Copy environment variables:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Install dependencies:

   ```powershell
   npm install
   ```

5. Start PostgreSQL and Redis when you want DB-backed development:

   ```powershell
   docker compose up -d
   ```

6. Generate Prisma client and apply committed migrations/seed:

   ```powershell
   npm run db:generate
   npm run db:deploy
   npm run db:seed
   ```

7. Start the API:

   ```powershell
   npm run dev:api
   ```

8. Start the mobile app:

   ```powershell
   npm run dev:mobile
   ```

   Expo Metro listens on `http://localhost:8081`. That URL is the native bundler/dev-server endpoint, not the browser-rendered app UI for this MVP. Use the QR code with Expo Go or run an iOS/Android simulator from Expo. Browser web runtime is not enabled in round 1.

9. Verify:

   ```powershell
   npm run typecheck
   npm test
   ```

## Local Modes

By default `.env.example` sets `DATABASE_PROVIDER=memory`. This lets the API run immediately without requiring PostgreSQL while the MVP API surface is still evolving.

Use Docker/Postgres/Redis when working on persistence behavior:

```env
DATABASE_PROVIDER=postgres
DATABASE_URL=postgresql://asia_app:asia_app@localhost:5432/asia_serious_dating?schema=public
REDIS_URL=redis://localhost:6379
```

## Required Environment Variables

- `API_PORT`: API port, default `4000`.
- `DATABASE_PROVIDER`: `memory` for local fallback or `postgres` for Prisma-backed development.
- `DATABASE_URL`: PostgreSQL connection string used by Prisma.
- `REDIS_URL`: Redis connection string for future cache/rate-limit adapter.
- `JWT_SECRET`: local mock auth signing secret. Do not commit real secrets.
- `DAILY_RECOMMENDATION_LIMIT`: default daily candidates count, currently `5`.
- `EXPO_PUBLIC_API_BASE_URL`: mobile API endpoint.

## Useful Commands

```powershell
npm install
npm run build
npm run typecheck
npm test
npm run dev:api
npm run dev:mobile
docker compose up -d
npm run db:deploy
npm run db:seed
```

Mobile note: `http://localhost:8081` is expected to show Metro/bundler behavior in a desktop browser, not the actual app screen. The MVP mobile UI is tested through Expo Go or a simulator.

Use `npm run db:migrate` only when intentionally creating a new Prisma migration during schema development.

## Docs

- [Architecture](docs/architecture.md)
- [Product MVP](docs/product-mvp.md)
- [Safety Model](docs/safety-model.md)
- [Dev Notes](docs/dev-notes.md)
