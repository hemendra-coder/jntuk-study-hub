# JNTUK Study Hub

## Firebase Deployment

This project is configured to deploy to Firebase Hosting from CI using `FIREBASE_TOKEN`.

### GitHub Actions

A workflow already exists in `.github/workflows/firebase-hosting-deploy.yml`.

Required repository secrets:

- `FIREBASE_TOKEN`
- `FIREBASE_PROJECT_ID` (optional if `.firebaserc` already has the correct project alias)

The workflow does:

- `npm ci`
- `npm run build`
- `npx firebase deploy --only hosting --token "$FIREBASE_TOKEN"`

### Local CI-style deployment

If you need to deploy from a headless machine, do not use interactive `firebase login`.

Instead:

1. Generate a token from a machine with a browser:
   ```bash
   firebase login:ci
   ```
2. Copy the generated token.
3. Run:
   ```bash
   FIREBASE_TOKEN="<your-token>" npm run deploy:ci
   ```

### Notes

- `firebase login:ci` will fail in environments without a browser or interactive authentication.
- If you see `Unable to authenticate using the provided code`, generate the token on a machine where Firebase CLI can open a browser.
- The `predeploy` hook in `firebase.json` ensures the app is built before deploying.
