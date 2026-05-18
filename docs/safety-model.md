# Safety Model

## Principles

The product assumes high-trust dating requires visible safety primitives from the first sprint:

- clear relationship intent
- limited daily discovery
- mutual consent before chat
- block and report actions
- auditability for risky signals

## Current Safety Signals

Messages are checked for high-risk patterns:

- investment solicitation
- crypto or exchange references
- money transfer requests
- suspicious APK or sideload instructions
- external messaging migration such as LINE, Telegram, WhatsApp, or WeChat

When detected, the API creates `SafetySignal` records linked to the message and target profile.

## Report and Block

Report:

- creates a `Report`
- creates a high-severity manual `SafetySignal`
- does not automatically block

Block:

- creates a `Block`
- hides both profiles from each other in discovery
- prevents messaging
- marks affected match/conversation as blocked

## Trust Roadmap

Later versions should add:

- real selfie and document verification adapters
- phone/email verification status display
- rate limits for message sends and reports
- reviewer queue for high-severity safety signals
- privacy-preserving audit views
- jurisdiction-aware moderation and escalation policies

## Boundaries

Round 1 uses deterministic keyword detection. It is intentionally simple and auditable. No production AI safety, KYC, or law-enforcement workflow is implemented.
