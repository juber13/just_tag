# JUSTAGG (justtag)

React Native (Expo) UI for the JUSTAGG digital business card app. UI-only phase with static mock data.

**Expo SDK 54** — compatible with Expo Go that supports SDK 54.

**Auth (temporarily off):** Login and sign-up are hidden. The app opens on the main UI with a guest profile. Set `AUTH_ENABLED = true` in [`src/config/appConfig.ts`](src/config/appConfig.ts) when you want auth screens again.

## Run

```bash
npm install
npx expo start
```

- **Phone:** Scan the QR code with **Expo Go** (iPhone: Camera app → open in Expo Go).
- **Android emulator (Windows):** Press `a` after starting (requires Android Studio emulator).
- **Web (limited):** Press `w`.

If the phone can’t connect, try: `npx expo start --tunnel`

## Profile web pages (your own server)

Public profile URLs (like `profile.justagg.com/...`) are served by the **`server/`** package — not inside the Expo app.

```bash
cd server
npm install
npm run dev
```

Set your PC IP in [`src/config/profileServer.ts`](src/config/profileServer.ts), then restart the app. See **[server/README.md](./server/README.md)**.

## Share install link (Android, personal use)

To send someone a **link so they can install the app** (not Expo Go), see **[INSTALL.md](./INSTALL.md)**. Short version:

```bash
eas login
eas init
eas build --platform android --profile preview
```

Then share the install URL from your build on [expo.dev](https://expo.dev).

## Flow

1. **Welcome** → Create Account or Sign In → Main app
2. **Tabs:** Profile, Contacts, center QR (Share), Analytics, Menu
3. **Profile** FAB (+) → Apps & Links Store (tap icons for link modals)
4. **Contacts** + New → Edit Contact
5. **Share** → Create Email Signature → Signature Preview

Reference screenshots are in `assets/reference/`.
