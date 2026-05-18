# Product MVP

## Positioning

This MVP is a high-trust, serious dating and marriage-oriented app for Taiwan, Singapore, and Malaysia first. It should later expand cleanly to Japan, the Philippines, and Vietnam.

It is not an infinite swipe product. It should feel intentional, bounded, and safer than casual discovery apps.

## First-Round Scope

- Mock onboarding/login
- Profile setup
- Intent selection:
  - `marriage`
  - `serious_relationship`
  - `open_to_relationship`
  - `friendship`
- Daily recommendations, default 5 people
- Profile detail
- Like/pass
- Mutual-like match creation
- Conversation list
- Message send/list
- Safety report/block flow
- Risky-message signal creation

## Non-Goals

- Real payments
- Real AI moderation
- Real KYC
- Infinite swipe loops
- Production identity verification
- Production push notifications

## Markets and Languages

Initial markets:

- Taiwan
- Singapore
- Malaysia

Prepared future markets:

- Japan
- Philippines
- Vietnam

i18n scaffolding supports:

- `zh-TW`
- `en`
- `ja`

Round 1 fills zh-TW/en more completely and keeps ja as a supported structure with basic text.

## MVP Success Criteria

- The data skeleton is correct.
- Core flows are navigable.
- Matching and messaging rules are testable.
- Safety and trust models are central, not bolted on later.
- Another developer can clone the repo and reproduce local development.
