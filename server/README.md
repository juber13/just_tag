# Justtag profile server

Hosts public profile pages and a JSON API for the mobile app.

## Quick start

```bash
cd server
npm install
npm run dev
```

Server runs at **http://localhost:3000**

- Health: http://localhost:3000/api/health  
- Example page: http://localhost:3000/p/{slug} (slug is created when the app syncs)

## Connect the mobile app

1. Find your PC's LAN IP (e.g. `192.168.1.5` on Windows: `ipconfig`).
2. Edit `src/config/profileServer.ts` in the app:

   ```ts
   export const PROFILE_SERVER_URL = 'http://192.168.1.5:3000';
   export const PROFILE_SYNC_ENABLED = true;
   ```

3. Phone and PC must be on the **same Wi‑Fi**.
4. Restart the Expo app — it registers your profile and syncs links.

| Device | URL to use |
|--------|------------|
| Physical phone | `http://YOUR_LAN_IP:3000` |
| Android emulator | `http://10.0.2.2:3000` |
| iOS simulator | `http://localhost:3000` |

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Server status |
| GET | `/api/profiles/:slug` | Public profile (web page uses this) |
| GET | `/api/profiles/by-email/:email` | Find profile by owner email |
| POST | `/api/profiles` | Create profile `{ ownerEmail, fullName, ... }` |
| PUT | `/api/profiles/:slug` | Update (header `X-Owner-Email` required) |
| POST | `/api/profiles/:slug/contacts` | Lead form submission |

## Web profile page

Opening `/p/{slug}` shows:

- Name, role, about, avatar/cover  
- Connect buttons (WhatsApp, phone, email, social links, etc.)  
- Payment UPI IDs (Google Pay, Paytm, PhonePe)  
- Contact form  

Data is stored in `server/data/profiles.json` and `server/data/contacts.json`.

## Production (optional)

Deploy the `server/` folder to any Node host (Railway, Render, VPS). Set `PROFILE_SERVER_URL` in the app to your public URL (e.g. `https://profiles.yourdomain.com`).
