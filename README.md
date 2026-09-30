# Payment Records

A simple single-user app to add, edit, delete, search and export money/payment records.
React talks directly to Firebase. There is no custom backend.

## Technologies

- React 18 + Vite (JavaScript/JSX), React Router
- Tailwind CSS
- Firebase Authentication (Email/Password) and Firestore
- xlsx-js-style (a SheetJS fork with the same API, needed because the standard `xlsx` package cannot style cells such as bold headers)

## Installation

Requires Node.js 18 or newer.

```bash
npm install
```

## npm commands

```bash
npm run dev       # start the dev server
npm run build     # production build into dist/
npm run preview   # preview the production build locally
```

## Firebase setup

### 1. Create a Firebase project
1. Go to https://console.firebase.google.com and click **Add project**.
2. Name it and finish the wizard (Analytics is optional).
3. On the project home page click the **Web** icon (`</>`), register an app, and copy the `firebaseConfig` values shown.

### 2. Enable Email/Password authentication
**Build → Authentication → Get started → Sign-in method → Email/Password → Enable → Save.**

### 3. Create the Firestore database
**Build → Firestore Database → Create database.** Choose a location and start in **production mode** (the rules below will be added next). The `records` collection is created automatically when you save the first record.

### 4. Create the first (and only) user
**Build → Authentication → Users → Add user.** Enter your email and password. After it is created, copy the **User UID** from the users table. You need it for the security rules.

### 5. Configure `.env`
```bash
cp .env.example .env
```
Fill in the values from `firebaseConfig`:

```
VITE_FIREBASE_API_KEY=            # apiKey
VITE_FIREBASE_AUTH_DOMAIN=        # authDomain
VITE_FIREBASE_PROJECT_ID=         # projectId
VITE_FIREBASE_STORAGE_BUCKET=     # storageBucket
VITE_FIREBASE_MESSAGING_SENDER_ID=# messagingSenderId
VITE_FIREBASE_APP_ID=             # appId
```
Restart `npm run dev` after editing `.env`.

### 6. Firestore security rules
Open **Firestore Database → Rules**, paste the following, replace `YOUR_USER_UID` with the UID from step 4, and click **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /records/{recordId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == "YOUR_USER_UID";
    }
  }
}
```
Anyone not logged in as that user cannot read, create, update or delete records. Everything else in the database is denied by default. The same rules are in `firestore.rules`.

## Run locally

```bash
npm install
npm run dev
```
Open http://localhost:5173 and log in with the user you created.

## Build for production

```bash
npm run build
```
The static site is generated in `dist/`.

## Deploy (Firebase Hosting)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
```
Answer the prompts: choose your project, public directory `dist`, **single-page app: Yes**, no GitHub deploys. Then:

```bash
npm run build
firebase deploy --only hosting
```

Other static hosts (Netlify, Vercel) also work: build command `npm run build`, output directory `dist`, add the six `VITE_FIREBASE_*` variables in the host's settings, and enable SPA fallback to `index.html`.

If you deploy to a custom domain, add it under **Authentication → Settings → Authorized domains**.

## Notes

- The Firebase web config is not secret. Access is protected by Authentication plus the Firestore rules above.
- Records are sorted by date (newest first), then by creation time.
- Excel export contains the currently filtered records and a bold Total Amount row.
