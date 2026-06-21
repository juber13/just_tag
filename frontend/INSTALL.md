# Install JUSTAGG on a phone (share link)

Use this for **personal sharing** — not the Play Store. Recipients get a normal app install from a link (Android).

## One-time setup (on your PC)

1. Create a free account at [https://expo.dev](https://expo.dev).

2. Install EAS CLI and log in:

   ```bash
   npm install -g eas-cli
   eas login
   ```

3. Link this project to Expo (run inside the project folder):

   ```bash
   cd C:\ankit\justtag
   eas init
   ```

   Accept creating a project if asked. This adds your `projectId` to `app.json`.

## Build an Android install link

```bash
eas build --platform android --profile preview
```

- Wait for the build on [expo.dev](https://expo.dev) (about 10–20 minutes the first time).
- Open the build → copy the **Install** link or scan the QR code.
- Send that link to anyone with **Android**.

**On their phone:** open the link → download APK → install. They may need to allow installs from the browser or Files app.

## Rebuild after code changes

Run the same `eas build` command again and share the **new** install link.

## iPhone

Apple does not allow a simple public APK-style install link without a paid Apple Developer account and TestFlight. For iPhone testers, use Expo Go during development (`npx expo start --tunnel`) or set up TestFlight later.

## Notes

- Package name: `com.justagg.justtag` (change in `app.json` if you need a unique ID).
- This app uses native modules (camera, sharing, clipboard); the installable build is required — Expo Go alone is not enough for full features.
