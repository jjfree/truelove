# Development Notes

Use this file for stable, actionable environment lessons that are likely to recur.

## Windows npm shim can point to a missing user-level npm

- Symptom: Running `npm --version` fails with `Cannot find module 'C:\Users\James\AppData\Roaming\npm\node_modules\npm\bin\npm-cli.js'`.
- Root cause: The user-level npm shim is ahead of the bundled/system npm path and points to a deleted or incomplete global npm installation.
- Fix: For this machine, run npm through the system install path: `node 'C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js' <command>`. Longer-term, repair the user-level npm installation or PATH order.
- Verification: `node 'C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js' --version` prints an npm version.
- Remember: Yes. This is stable, Windows/PowerShell-specific, and likely to affect install/test/dev commands in this repo.

## Local API can run before PostgreSQL

- Symptom: A fresh clone may not have Docker/PostgreSQL running yet, but API behavior still needs to be developed and tested.
- Root cause: Round 1 intentionally uses `DATABASE_PROVIDER=memory` as the default local fallback while Prisma defines the durable schema.
- Fix: Keep `.env` using `DATABASE_PROVIDER=memory` for fast API/mobile work. Switch to `DATABASE_PROVIDER=postgres`, run `docker compose up -d`, then `npm run db:migrate` and `npm run db:seed` for persistence work.
- Verification: API unit tests pass in memory mode; Prisma migration/seed succeeds when Docker is running.
- Remember: Yes. This is a deliberate local development mode and should stay visible in onboarding docs.

## Workspace imports need broad TypeScript roots

- Symptom: API typecheck fails with `File packages/shared/src/index.ts is not under rootDir apps/api`.
- Root cause: The API tsconfig set `rootDir` to the app folder while importing workspace source through the root `paths` mapping.
- Fix: Remove the app-level `rootDir` for typechecking/build config so TypeScript can resolve workspace source correctly.
- Verification: `npm run typecheck --workspace @asia-love/api` no longer reports TS6059.
- Remember: Yes. This affects any app importing local workspace packages through source paths.

## Jest TypeScript config requires ts-node

- Symptom: `jest` fails with `ts-node is required for the TypeScript configuration files`.
- Root cause: Jest can read `jest.config.ts` only when `ts-node` is installed.
- Fix: Use `jest.config.js` for this repo to avoid another runtime config dependency.
- Verification: `npm test --workspace @asia-love/api` starts Jest without the config parse error.
- Remember: Yes. This is a stable tooling constraint.

## Use migrate deploy for clone-and-run setup

- Symptom: `prisma migrate dev` applies the committed migration, then prompts for a new migration name in non-interactive setup.
- Root cause: `migrate dev` is a development command that may try to create migrations when it detects schema differences; it is not ideal for scripted fresh-clone onboarding.
- Fix: Use `npm run db:deploy` to apply committed migrations during setup. Reserve `npm run db:migrate` for intentional schema changes.
- Verification: `npm run db:deploy` reports no pending migrations after the initial migration is applied.
- Remember: Yes. This directly affects fresh-clone setup and CI-style database initialization.

## Expo package versions should match SDK expectations

- Symptom: `expo start` warns that `@expo/vector-icons` and `react-native` are not at the expected versions for the installed Expo SDK.
- Root cause: A caret range allowed `@expo/vector-icons` to resolve newer than Expo expected, and `react-native` was pinned to an older patch version.
- Fix: Pin `@expo/vector-icons` with `~14.0.4` and use `react-native@0.76.9` for Expo SDK 52.
- Verification: Restart `npm run dev:mobile` and confirm the Expo compatibility warning is gone.
- Remember: Yes. Expo version drift is common and affects fresh installs.

## npm audit force fix can break Expo SDK alignment

- Symptom: `npm audit --omit=dev` reports vulnerabilities through Expo transitive dependencies and suggests `npm audit fix --force`.
- Root cause: The force fix proposes a breaking Expo version change instead of a narrow patch compatible with the selected SDK.
- Fix: Do not run `npm audit fix --force` blindly. Track Expo SDK upgrades and dependency overrides deliberately in a dedicated security pass.
- Verification: `npm audit --omit=dev` shows the advisory chain and the proposed breaking Expo change.
- Remember: Yes. This is stable for the current dependency set and can prevent accidental SDK downgrades/upgrades.

## Expo workspace package main should use package entry

- Symptom: Opening the Expo dev server returns `ConfigError: Cannot resolve entry file` for `node_modules/expo/AppEntry.js`.
- Root cause: In npm workspaces, dependencies can be hoisted, so `apps/mobile/node_modules/expo/AppEntry.js` may not exist.
- Fix: Set the mobile package `main` field to a local `index.js` and call `registerRootComponent(App)` there.
- Verification: Restart `npm run dev:mobile`; Metro starts from `apps/mobile` without the missing `node_modules/expo/AppEntry.js` entry error.
- Remember: Yes. This is a stable monorepo/Expo setup requirement.

## Expo Metro 8081 is not the app UI in round 1

- Symptom: Opening `http://localhost:8081` in a desktop browser appears blank or shows bundler behavior instead of the mobile app.
- Root cause: Round 1 is an Expo React Native native app. Metro runs on port 8081, but browser web runtime is not enabled.
- Fix: Use Expo Go via QR code or an iOS/Android simulator for the mobile UI. Add React Native Web support in a later round if browser testing is required.
- Verification: `npm run dev:mobile` reports Metro waiting on `http://localhost:8081`; the app should be opened through Expo Go/simulator, not by expecting a browser UI at that URL.
- Remember: Yes. This is a stable local mobile development limitation.

## Windows Git line endings need repo policy

- Symptom: `git add .` prints many warnings that LF will be replaced by CRLF the next time Git touches files.
- Root cause: This machine has `core.autocrlf=true`, which can rewrite text files differently across Windows and non-Windows machines.
- Fix: Add `.gitattributes` with `* text=auto eol=lf`, while keeping Windows command files as CRLF.
- Verification: Re-stage files after adding `.gitattributes`; future checkouts should follow the repo line-ending policy.
- Remember: Yes. This is a stable Windows collaboration issue for this repo.
