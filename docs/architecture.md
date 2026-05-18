# Architecture

## Monorepo Layout

- `apps/mobile`: Expo React Native MVP.
- `apps/api`: NestJS API with mock auth and in-memory development store.
- `packages/shared`: shared DTOs, enums, constants, and safety keyword detection.
- `prisma`: PostgreSQL schema, PostGIS-ready migration, and seed script.
- `docs`: product, safety, and development notes.

## Runtime Shape

The MVP has three practical layers:

1. Mobile calls API endpoints with mock headers such as `x-user-id` and `x-profile-id`.
2. API modules own behavior for auth, profile, discovery, matching, conversations, reports, blocks, and safety signals.
3. Persistence is abstracted for round 1 by an in-memory store, while Prisma schema and migrations define the future durable database contract.

## API Modules

- `AuthModule`: mock register/login. No real KYC, payment, or production auth.
- `ProfileModule`: create/update/get profile.
- `DiscoveryModule`: daily candidates, default limit 5.
- `MatchingModule`: like/pass and mutual-like match creation.
- `ConversationModule`: list conversations, list messages, send messages.
- `SafetyModule`: report, block, and manual signal creation.

## Data Model

Prisma includes:

- `User`
- `Profile`
- `ProfilePhoto`
- `Preference`
- `Verification`
- `Like`
- `Match`
- `Conversation`
- `Message`
- `Block`
- `Report`
- `SafetySignal`
- `AuditLog`

`Profile.location` is reserved as `geography(Point,4326)` and the migration enables PostGIS.

## Discovery Rules

Daily candidates prioritize:

- same relationship intent
- acceptable intent from preferences
- same city or acceptable country
- language overlap
- age preference
- verified profiles

Blocked profiles and already-decided profiles are excluded.

## Safety Rules

- Only mutual likes open a conversation.
- Blocked users cannot see each other in discovery or message each other.
- Blocking marks affected matches/conversations as blocked.
- Risky message content creates `SafetySignal` records.
- Reports create a `Report` and a manual high-severity `SafetySignal`.

## Adapters Reserved for Later

- Real auth/JWT provider
- KYC provider
- Payment provider
- AI moderation provider
- Redis cache/rate-limit adapter
- Prisma-backed repositories replacing the in-memory store
