# 亞洲認真交友 MVP

這是一個高信任、認真交往與婚戀導向的 MVP，第一階段面向台灣、新加坡、馬來西亞，並保留未來擴展到日本、菲律賓、越南的結構。

這不是無限 swipe app。第一版聚焦真人資料、關係意圖、每日限量推薦、mutual like 後聊天，以及從第一天就放進系統核心的安全訊號。

## 技術架構

- Monorepo：npm workspaces
- Mobile：Expo React Native + TypeScript
- API：NestJS + TypeScript
- DB：PostgreSQL + Prisma，並預留 PostGIS 欄位
- Redis：已預留介面方向，本地 MVP 可先使用 in-memory fallback
- Shared package：共用 DTO、enum、安全常數

## 從新電腦接手

目標：clone repo 後約 15 分鐘內跑起本地開發環境。

1. 安裝 Node `22.14.x` 與 npm `10.x`。
2. Clone 這個 repo。
3. 複製環境變數範本：

   ```powershell
   Copy-Item .env.example .env
   ```

4. 安裝依賴：

   ```powershell
   npm install
   ```

5. 若要使用 DB-backed 開發模式，啟動 PostgreSQL 與 Redis：

   ```powershell
   docker compose up -d
   ```

6. 產生 Prisma client，套用已提交的 migrations，並執行 seed：

   ```powershell
   npm run db:generate
   npm run db:deploy
   npm run db:seed
   ```

7. 啟動 API：

   ```powershell
   npm run dev:api
   ```

8. 啟動 mobile app：

   ```powershell
   npm run dev:mobile
   ```

   Expo Metro 會監聽 `http://localhost:8081`。這個 URL 是 native bundler/dev-server endpoint，不是此 MVP 的瀏覽器版 app UI。請使用 Expo Go 掃 QR code，或從 Expo 啟動 iOS/Android simulator。第一輪尚未啟用 browser web runtime。

9. 驗證：

   ```powershell
   npm run typecheck
   npm test
   ```

## 本地模式

`.env.example` 預設使用 `DATABASE_PROVIDER=memory`。這讓 API 在 PostgreSQL 尚未啟動時也能先跑起來，方便第一輪 API/mobile 流程開發。

當你要開發或驗證 persistence 行為時，請切到 Docker/Postgres/Redis：

```env
DATABASE_PROVIDER=postgres
DATABASE_URL=postgresql://asia_app:asia_app@localhost:5432/asia_serious_dating?schema=public
REDIS_URL=redis://localhost:6379
```

## 必要環境變數

- `API_PORT`：API port，預設 `4000`。
- `DATABASE_PROVIDER`：`memory` 代表本地 fallback，`postgres` 代表 Prisma-backed 開發模式。
- `DATABASE_URL`：Prisma 使用的 PostgreSQL connection string。
- `REDIS_URL`：未來 cache/rate-limit adapter 使用的 Redis connection string。
- `JWT_SECRET`：本地 mock auth signing secret。不要提交真實 secrets。
- `DAILY_RECOMMENDATION_LIMIT`：每日推薦數，預設 `5`。
- `EXPO_PUBLIC_API_BASE_URL`：mobile app 使用的 API endpoint。

## 常用指令

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

Mobile 注意：`http://localhost:8081` 在桌面瀏覽器中預期會呈現 Metro/bundler 行為，而不是實際 app 畫面。MVP mobile UI 請透過 Expo Go 或 simulator 測試。

只有在刻意修改 Prisma schema 並要建立新 migration 時，才使用 `npm run db:migrate`。

## 文件

- [系統架構](docs/architecture.md)
- [產品 MVP](docs/product-mvp.md)
- [安全模型](docs/safety-model.md)
- [開發備註](docs/dev-notes.md)
