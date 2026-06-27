# Deploy Justtag Server

This package is ready to upload to any Node.js host (VPS, Railway, Render, DigitalOcean, etc.).

## What is in the zip

- `server.js` — main Express API + profile pages
- `src/` — auth, payments, analytics
- `public/` — web profile UI
- `node_modules/` — production dependencies (already installed)
- `.env.example` — copy to `.env` and fill in values

## Quick deploy (VPS / Linux)

1. Upload `dist/justtag-server.zip` to your server.
2. Unzip:
   ```bash
   unzip justtag-server.zip
   cd justtag-server
   ```
3. Create environment file:
   ```bash
   cp .env.example .env
   nano .env
   ```
4. Start the server:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```
   Or with PM2 (recommended):
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.cjs
   pm2 save
   pm2 startup
   ```

5. Open port `3001` (or your `PORT`) in the firewall / security group.

6. Test: `curl https://YOUR_DOMAIN/api/health` → `{"ok":true}`

## Railway / Render / similar

1. Upload the unzipped folder or connect git repo.
2. Set **Start command**: `node server.js`
3. Add all variables from `.env.example` in the platform dashboard.
4. Platform usually sets `PORT` automatically — the server reads `process.env.PORT`.

## Razorpay webhook

After your domain is live, set the webhook URL in Razorpay dashboard:

```
https://YOUR_DOMAIN/api/webhooks/razorpay
```

Enable event: `payment.captured`

## Update mobile app

In `frontend/src/config/profileServer.ts`, set:

```ts
export const PROFILE_SERVER_URL = 'https://YOUR_NEW_DOMAIN';
```

## Rebuild the zip locally

From the `server` folder:

```bash
npm run build:deploy
```

Output:

- `dist/justtag-server/` — deploy folder
- `dist/justtag-server.zip` — upload this to your server

## Required environment variables

| Variable | Purpose |
|----------|---------|
| `PORT` | HTTP port (default 3001) |
| `MONGODB_URI` or `PASSWORD` + `DB_USERNAME` | Database |
| `CLOUDINARY_*` | Avatar/cover uploads |
| `RAZORPAY_*` | Payments |
